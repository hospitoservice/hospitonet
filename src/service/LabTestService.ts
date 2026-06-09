import { LAB_TESTS, TEST_CATEGORIES, LabTest, TestCategory } from '../resources/LabTest';

const LAB_TEST_API_URL = 'http://localhost:8086/api/lab-tests';

class LabTestService {
  async getLabTests(): Promise<LabTest[]> {
    try {
      const res = await fetch(LAB_TEST_API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LabTest[] = await res.json();
      if (!data.length) throw new Error('Empty response');
      return data;
    } catch (error) {
      console.warn('[LabTestService] API unavailable, using static data:', (error as Error).message);
      return LAB_TESTS;
    }
  }

  async getCategories(): Promise<TestCategory[]> {
    try {
      const res = await fetch(`${LAB_TEST_API_URL}/categories`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      console.warn('[LabTestService] Categories API unavailable, using static data:', (error as Error).message);
      return TEST_CATEGORIES;
    }
  }
}

export default new LabTestService();
