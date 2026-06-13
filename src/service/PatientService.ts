import { UserProfile } from './UserService';

export interface PatientRecord {
  id?: string;
  patientId: string;
  hospitalId?: string;
  userId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  mobile?: string;
  email?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  allergies?: string;
}

const PATIENT_GRAPHQL = '/patient/graphql';

const PATIENT_FIELDS = `id patientId hospitalId userId firstName middleName lastName mobile email dateOfBirth age gender allergies`;

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(PATIENT_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Patient service error: ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

// ── Global lookups (kept for backwards compatibility) ─────────────────────────

export async function findPatientByMobile(mobile: string): Promise<PatientRecord | null> {
  const data = await gql<{ getPatientByMobile: PatientRecord | null }>(
    `query FindByMobile($mobile: String!) {
       getPatientByMobile(mobile: $mobile) { ${PATIENT_FIELDS} }
     }`,
    { mobile }
  );
  return data.getPatientByMobile ?? null;
}

export async function findPatientByUserId(userId: string): Promise<PatientRecord | null> {
  const data = await gql<{ getPatientByUserId: PatientRecord | null }>(
    `query FindByUserId($userId: String!) {
       getPatientByUserId(userId: $userId) { ${PATIENT_FIELDS} }
     }`,
    { userId }
  );
  return data.getPatientByUserId ?? null;
}

// ── Hospital-scoped lookups ────────────────────────────────────────────────────

export async function findPatientByMobileAndHospital(
  mobile: string,
  hospitalId: string
): Promise<PatientRecord | null> {
  const data = await gql<{ getPatientByMobileAndHospitalId: PatientRecord | null }>(
    `query FindByMobileAndHospital($mobile: String!, $hospitalId: String!) {
       getPatientByMobileAndHospitalId(mobile: $mobile, hospitalId: $hospitalId) { ${PATIENT_FIELDS} }
     }`,
    { mobile, hospitalId }
  );
  return data.getPatientByMobileAndHospitalId ?? null;
}

export async function findPatientByUserIdAndHospital(
  userId: string,
  hospitalId: string
): Promise<PatientRecord | null> {
  const data = await gql<{ getPatientByUserIdAndHospitalId: PatientRecord | null }>(
    `query FindByUserIdAndHospital($userId: String!, $hospitalId: String!) {
       getPatientByUserIdAndHospitalId(userId: $userId, hospitalId: $hospitalId) { ${PATIENT_FIELDS} }
     }`,
    { userId, hospitalId }
  );
  return data.getPatientByUserIdAndHospitalId ?? null;
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createPatient(
  user: UserProfile,
  hospitalId?: string
): Promise<PatientRecord> {
  const input: Record<string, unknown> = {
    userId:          user.id,
    hospitalId:      hospitalId ?? undefined,
    firstName:       user.firstName ?? '',
    middleName:      user.middleName,
    lastName:        user.lastName,
    mobile:          user.phone ?? '',
    email:           user.email,
    aadhar:          user.aadhar,
    dateOfBirth:     user.dateOfBirth,
    age:             user.age,
    gender:          user.gender,
    allergies:       user.allergies,
    registrationDate: new Date().toISOString().split('T')[0],
  };

  if (user.location) {
    input.location = {
      address: user.location.address,
      city:    user.location.city,
      state:   user.location.state,
      pincode: user.location.pincode,
    };
  }

  if (user.immediateContact) {
    input.immediateContact = {
      firstName: user.immediateContact.firstName,
      lastName:  user.immediateContact.lastName,
      mobile:    user.immediateContact.mobile,
      email:     user.immediateContact.email,
      relation:  user.immediateContact.relation,
    };
  }

  const data = await gql<{ createPatient: PatientRecord }>(
    `mutation CreatePatient($input: PatientInput!) {
       createPatient(input: $input) { ${PATIENT_FIELDS} }
     }`,
    { input }
  );
  return data.createPatient;
}

// ── Hospital-scoped ensure (primary entry point for appointment booking) ───────

/**
 * Returns the existing patient record for this user at the given hospital,
 * or creates one if none exists.
 *
 * Lookup order:
 *   1. userId + hospitalId  (exact hospital-scoped match)
 *   2. mobile + hospitalId  (phone-based hospital-scoped match)
 *   3. userId globally      (reuse existing record when hospitalId format changed — prevents duplicate patients)
 *   4. mobile globally      (last-resort reuse before creating a brand-new patient)
 *   5. Create new patient   (truly first-time patient with no prior record anywhere)
 */
export async function ensurePatientForHospital(
  user: UserProfile,
  hospitalId: string
): Promise<PatientRecord> {
  // Hospital-scoped lookups (exact match)
  if (user.id) {
    const byUserAndHospital = await findPatientByUserIdAndHospital(user.id, hospitalId).catch(() => null);
    if (byUserAndHospital) return byUserAndHospital;
  }
  if (user.phone) {
    const byMobileAndHospital = await findPatientByMobileAndHospital(user.phone, hospitalId).catch(() => null);
    if (byMobileAndHospital) return byMobileAndHospital;
  }

  // Global fallback — reuse any existing patient record for this user.
  // This preserves patientId continuity when a prior booking used a different
  // hospitalId format (e.g. MongoDB hash vs "H00012"), which would otherwise
  // create a duplicate patient and orphan all prior appointments.
  if (user.id) {
    const byUserId = await findPatientByUserId(user.id).catch(() => null);
    if (byUserId) return byUserId;
  }
  if (user.phone) {
    const byMobile = await findPatientByMobile(user.phone).catch(() => null);
    if (byMobile) return byMobile;
  }

  return createPatient(user, hospitalId);
}

/**
 * @deprecated Use ensurePatientForHospital. This global version is kept only
 * for cases where hospitalId is genuinely unavailable.
 */
export async function ensurePatient(user: UserProfile): Promise<PatientRecord> {
  if (user.patientId) return { patientId: user.patientId };

  if (user.id) {
    const byUserId = await findPatientByUserId(user.id).catch(() => null);
    if (byUserId) return byUserId;
  }

  if (user.phone) {
    const byMobile = await findPatientByMobile(user.phone).catch(() => null);
    if (byMobile) return byMobile;
  }

  return createPatient(user);
}
