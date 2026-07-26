import { UserProfile } from './UserService';

export interface BillItem {
  itemId?: string;
  code?: string;
  name?: string;
  category?: string;
  price?: number;
  tax?: number;
  discount?: number;
  quantity?: number;
}

export interface Bill {
  id: string;
  billNumber?: string;
  /** "Appointment" | "Item" | "Test" */
  billCategory?: string;
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  doctor?: string;
  department?: string;
  billDate?: string;
  items?: BillItem[];
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
  status?: string;
  paymentMode?: string;
  paymentId?: string;
  hospitalId?: string;
}

const GET_BILLS_BY_PATIENT_ID = `
  query GetBillsByPatientId($patientId: String!) {
    getBillsByPatientId(patientId: $patientId) {
      id billNumber billCategory patientId patientName patientAge patientGender
      doctor department billDate subtotal tax discount total status paymentMode paymentId hospitalId
      items { itemId code name category price tax discount quantity }
    }
  }
`;

class BillingService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/billing-graphql') {
    this.baseUrl = baseUrl;
  }

  async getBillsByPatientId(patientId: string): Promise<Bill[]> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: GET_BILLS_BY_PATIENT_ID, variables: { patientId } }),
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data?.getBillsByPatientId ?? [];
  }

  /**
   * Bills are scoped per hospital (like patient records), so this fetches across
   * every hospital the user has a patient link for, dedupes, and sorts newest first.
   */
  async getBillsForUser(user: UserProfile): Promise<Bill[]> {
    const patientIds = new Set((user.patientLinks ?? []).map(l => l.patientId).filter(Boolean));
    if (user.patientId) patientIds.add(user.patientId);
    if (patientIds.size === 0) return [];

    const results = await Promise.all(
      [...patientIds].map(id => this.getBillsByPatientId(id).catch(() => [] as Bill[]))
    );

    const seen = new Set<string>();
    const merged: Bill[] = [];
    for (const bill of results.flat()) {
      if (!seen.has(bill.id)) { seen.add(bill.id); merged.push(bill); }
    }
    merged.sort((a, b) => (b.billDate ?? '').localeCompare(a.billDate ?? ''));
    return merged;
  }
}

export default new BillingService();
