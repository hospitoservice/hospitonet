export interface InsurancePlan {
  id: string;
  provider: string;
  planName: string;
  type: 'Health' | 'Life' | 'Accident' | 'Travel';
  coverageAmount: number;
  premiumPerYear: number;
  description?: string;
  features?: string[];
  icon?: string;
}

const BASE_URL = '/api/insurance-plans';

class InsurancePlanService {
  async getPlans(): Promise<InsurancePlan[]> {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`Failed to fetch insurance plans: ${res.status}`);
    return res.json();
  }
}

export default new InsurancePlanService();
