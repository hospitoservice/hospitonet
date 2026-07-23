import { BookedAppointment, AppointmentHospitalInfo } from '../../types';

// TypeScript interfaces matching the Java input classes

export interface LocationInput {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface HospitalInput {
  hospitalId?: string;
  hospitalName?: string;
  hospitalBranchId?: string;
  hospitalBranchName?: string;
  hospitalLocation?: LocationInput;
}

export interface PaymentInformationInput {
  paymentId?: string;
  paymentMode?: string;
  paymentAmount?: string;
  paymentSuccessful?: boolean;
}

export interface MedicineInput {
  id?: string;
  medicineName?: string;
  medicineCategory?: string;
  medicineSupplier?: string;
  medicineDosage?: string;
  medicineFrequency?: string;
  medicineDuration?: string;
  store?: string;
  manufactureDate?: string;
  expiryDate?: string;
  description?: string;
  totalQuantity?: string;
  price?: string;
}

export interface TestsAndReportsInput {
  id?: string;
  testId?: string;
  testName?: string;
  testCategory?: string;
  testAssignedDate?: string;
  testAssignedTime?: string;
  testStatus?: string;
  testPerformedDate?: string;
  testPerformedTime?: string;
  reportId?: string;
  reportName?: string;
  report?: string;
  reportDate?: string;
  reportTime?: string;
}

export interface VitalsInput {
  height?: string;
  weight?: string;
  bmi?: string;
  temperature?: string;
  heartRate?: string;
  spo2?: string;
  bloodGroup?: string;
  bloodPressure?: string;
  condition?: string;
}

export interface SymptomsInput {
  fever?: boolean;
  cough?: boolean;
  headache?: boolean;
  fatigue?: boolean;
  jointPain?: boolean;
  chestPain?: boolean;
  bodyPain?: boolean;
  abdominalPain?: boolean;
  hairloss?: boolean;
  breathingProblem?: boolean;
  nightSweats?: boolean;
  infection?: boolean;
  vomiting?: boolean;
  diarrhea?: boolean;
  constipation?: boolean;
  dizziness?: boolean;
  skinrash?: boolean;
  nausea?: boolean;
  otherSymptoms?: string;
}

export interface AppointmentInput {
  id?: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientGender: string;
  patientMobile: string;
  patientEmail?: string;
  patientDOB: string;
  department: string;
  doctor?: string;
  doctorFees?: number;
  shift?: string;
  appointmentDate: string;
  slot: string;
  appointmentPriority?: string;
  paymentMode?: string;
  status: string;
  message: string;
  liveConsultant?: string;
  staffId?: string;
  slotId?: string;
  symptoms?: SymptomsInput;
  vitals?: VitalsInput;
  doctorComments?: string;
  testsAndReports?: TestsAndReportsInput[];
  medicine?: MedicineInput[];
  paymentInformation?: PaymentInformationInput[];
  hospital?: HospitalInput;
}

export interface Appointment {
  id?: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientGender: string;
  patientMobile: string;
  patientEmail?: string;
  patientDOB: string;
  department: string;
  doctor?: string;
  doctorFees?: number;
  shift?: string;
  appointmentDate: string;
  slot: string;
  appointmentPriority?: string;
  paymentMode?: string;
  status: string;
  message: string;
  liveConsultant?: string;
  symptoms?: SymptomsInput;
  vitals?: VitalsInput;
  doctorComments?: string;
  testsAndReports?: TestsAndReportsInput[];
  medicine?: MedicineInput[];
  paymentInformation?: PaymentInformationInput[];
  hospital?: HospitalInput;
}

function bookingToInput(
  appt: BookedAppointment,
  overrides: Partial<AppointmentInput> = {},
): AppointmentInput {
  const hosp = appt.hospital as (AppointmentHospitalInfo & { hospitalBranchId?: string }) | undefined;
  return {
    patientId: appt.patientId,
    patientFirstName: appt.patientFirstName,
    patientLastName: appt.patientLastName,
    patientGender: appt.patientGender ?? '',
    patientMobile: appt.patientMobile ?? '',
    patientEmail: appt.patientEmail,
    patientDOB: appt.patientDOB ?? '',
    department: appt.department,
    doctor: appt.doctor,
    doctorFees: appt.doctorFees,
    shift: appt.shift,
    appointmentDate: appt.appointmentDate,
    slot: appt.slot,
    appointmentPriority: appt.appointmentPriority,
    paymentMode: appt.paymentMode,
    status: appt.status,
    message: appt.message ?? '',
    liveConsultant: appt.liveConsultant ?? '',
    hospital: hosp
      ? { hospitalId: hosp.hospitalId, hospitalName: hosp.hospitalName, hospitalBranchId: hosp.hospitalBranchId, hospitalBranchName: hosp.hospitalBranchName, hospitalLocation: hosp.hospitalLocation }
      : undefined,
    ...overrides,
  };
}

class AppointmentService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/appointment-graphql') {
    this.baseUrl = baseUrl;
  }

  /**
   * Creates a new appointment by calling the GraphQL mutation
   * @param appointmentInput The appointment data matching the Java AppointmentInput structure
   * @returns Promise with the created appointment
   */
  async createAppointment(appointmentInput: AppointmentInput): Promise<Appointment> {
    const mutation = `
      mutation CreateAppointment($input: AppointmentInput!) {
        createAppointment(input: $input) {
          id
          patientId
          patientFirstName
          patientLastName
          patientGender
          patientMobile
          patientEmail
          patientDOB
          department
          doctor
          doctorFees
          shift
          appointmentDate
          slot
          appointmentPriority
          paymentMode
          status
          message
          liveConsultant
          staffId
          slotId
          symptoms {
            fever
            cough
            headache
            fatigue
            jointPain
            chestPain
            bodyPain
            abdominalPain
            hairloss
            breathingProblem
            nightSweats
            infection
            vomiting
            diarrhea
            constipation
            dizziness
            skinrash
            nausea
            otherSymptoms
          }
          vitals {
            height
            weight
            bmi
            temperature
            heartRate
            spo2
            bloodGroup
            bloodPressure
            condition
          }
          doctorComments
          testsAndReports {
            id
            testId
            testName
            testCategory
            testAssignedDate
            testAssignedTime
            testStatus
            testPerformedDate
            testPerformedTime
            reportId
            reportName
            report
            reportDate
            reportTime
          }
          medicine {
            id
            medicineName
            medicineCategory
            medicineSupplier
            medicineDosage
            medicineFrequency
            medicineDuration
            store
            manufactureDate
            expiryDate
            description
            totalQuantity
            price
          }
          paymentInformation {
            paymentId
            paymentMode
            paymentAmount
            paymentSuccessful
          }
          hospital {
            hospitalId
            hospitalName
            hospitalBranchId
            hospitalBranchName
            hospitalLocation {
              address
              city
              state
              pincode
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: appointmentInput,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data.createAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async getAppointmentsByPatientId(patientId: string): Promise<BookedAppointment[]> {
    const query = `
      query GetByPatientId($patientId: String!) {
        getAppointmentsByPatientId(patientId: $patientId) {
          id patientId patientFirstName patientLastName patientGender
          patientMobile patientEmail patientDOB
          department doctor doctorFees appointmentDate slot status message liveConsultant
          vitals { height weight bmi temperature heartRate spo2 bloodGroup bloodPressure condition }
          symptoms {
            fever cough headache fatigue jointPain chestPain bodyPain abdominalPain
            hairloss breathingProblem nightSweats infection vomiting diarrhea
            constipation dizziness skinrash nausea otherSymptoms
          }
          doctorComments
          medicine {
            id medicineName medicineCategory medicineDosage medicineFrequency
            medicineDuration store description price expiryDate
          }
          testsAndReports {
            id testId testName testCategory testStatus
            testAssignedDate testPerformedDate reportId reportName report reportDate
          }
          paymentInformation { paymentId paymentMode paymentAmount paymentSuccessful }
          hospital {
            hospitalId hospitalName hospitalBranchName
            hospitalLocation { address city state pincode }
          }
        }
      }
    `;

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { patientId } }),
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data.getAppointmentsByPatientId ?? [];
  }

  async updateAppointment(id: string, input: AppointmentInput): Promise<Appointment> {
    const mutation = `
      mutation UpdateAppointment($id: ID!, $input: AppointmentInput!) {
        updateAppointment(id: $id, input: $input) {
          id patientId patientFirstName patientLastName patientGender patientMobile
          patientEmail patientDOB department doctor doctorFees shift
          appointmentDate slot appointmentPriority paymentMode status message liveConsultant
          doctorComments
          hospital { hospitalId hospitalName hospitalBranchId hospitalBranchName hospitalLocation { address city state pincode } }
        }
      }
    `;
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: mutation, variables: { id, input } }),
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data.updateAppointment;
  }

  async cancelAppointment(id: string, appt: BookedAppointment): Promise<Appointment> {
    const input = bookingToInput(appt, { status: 'Cancelled' });
    return this.updateAppointment(id, input);
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteAppointment($id: ID!) {
        deleteAppointment(id: $id)
      }
    `;
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: mutation, variables: { id } }),
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data.deleteAppointment as boolean;
  }

  async getAppointmentById(id: string): Promise<BookedAppointment> {
    const query = `
      query GetAppointmentById($id: ID!) {
        getAppointmentById(id: $id) {
          id patientId patientFirstName patientLastName patientGender
          patientMobile patientEmail patientDOB
          department doctor doctorFees appointmentDate slot status message liveConsultant
          vitals { height weight bmi temperature heartRate spo2 bloodGroup bloodPressure condition }
          symptoms {
            fever cough headache fatigue jointPain chestPain bodyPain abdominalPain
            hairloss breathingProblem nightSweats infection vomiting diarrhea
            constipation dizziness skinrash nausea otherSymptoms
          }
          doctorComments
          medicine {
            id medicineName medicineCategory medicineDosage medicineFrequency
            medicineDuration store description price expiryDate
          }
          testsAndReports {
            id testId testName testCategory testStatus
            testAssignedDate testPerformedDate reportId reportName report reportDate
          }
          paymentInformation { paymentId paymentMode paymentAmount paymentSuccessful }
          hospital {
            hospitalId hospitalName hospitalBranchName
            hospitalLocation { address city state pincode }
          }
        }
      }
    `;
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id } }),
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    const data = result.data.getAppointmentById;
    if (!data) throw new Error('Appointment not found');
    return data;
  }

  async getAppointmentsByMobile(mobile: string): Promise<BookedAppointment[]> {
    const query = `
      query GetByMobile($mobile: String!) {
        getAppointmentsByPatientMobile(mobile: $mobile) {
          id patientId patientFirstName patientLastName patientGender
          patientMobile patientEmail patientDOB
          department doctor doctorFees appointmentDate slot status message liveConsultant
          vitals { height weight bmi temperature heartRate spo2 bloodGroup bloodPressure condition }
          symptoms {
            fever cough headache fatigue jointPain chestPain bodyPain abdominalPain
            hairloss breathingProblem nightSweats infection vomiting diarrhea
            constipation dizziness skinrash nausea otherSymptoms
          }
          doctorComments
          medicine {
            id medicineName medicineCategory medicineDosage medicineFrequency
            medicineDuration store description price expiryDate
          }
          testsAndReports {
            id testId testName testCategory testStatus
            testAssignedDate testPerformedDate reportId reportName report reportDate
          }
          paymentInformation { paymentId paymentMode paymentAmount paymentSuccessful }
          hospital {
            hospitalId hospitalName hospitalBranchName
            hospitalLocation { address city state pincode }
          }
        }
      }
    `;

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { mobile } }),
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data?.getAppointmentsByPatientMobile ?? [];
  }
}

export default new AppointmentService();

