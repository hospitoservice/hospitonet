const BASE_URL = '/api/patient-complaints';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ComplaintRequest {
  hospitalId?: string;
  userId: string;
  patientId?: string;
  patientMobile?: string;
  appointmentId?: string;
  subject: string;
  against: string;
  description: string;
}

export interface Complaint extends ComplaintRequest {
  id: string;
  status: string;
  /** Admin's response left when resolving/reviewing the complaint (Admin > Complaints, HOSPITO-WEB). */
  comment?: string;
  createdAt: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * ComplaintService
 *
 * Submits and fetches patient complaints via hospital-service.
 * The Vite proxy's generic /api catch-all already targets hospital-service
 * (see vite.config.ts), so no dedicated proxy rule is needed here.
 *
 * Note: hospital-service wraps every response in an { success, message, data }
 * envelope, so responses are unwrapped via `.data` before being returned.
 */
class ComplaintService {
  async fileComplaint(request: ComplaintRequest): Promise<Complaint> {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(`ComplaintService: HTTP ${res.status}`);
    const body = (await res.json()) as ApiEnvelope<Complaint>;
    return body.data;
  }

  async getMyComplaints(userId: string): Promise<Complaint[]> {
    const res = await fetch(`${BASE_URL}/user/${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error(`ComplaintService: HTTP ${res.status}`);
    const body = (await res.json()) as ApiEnvelope<Complaint[]>;
    return body.data ?? [];
  }
}

export default new ComplaintService();
