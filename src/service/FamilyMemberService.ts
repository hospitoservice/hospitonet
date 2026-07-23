export interface FamilyMember {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  relation?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  mobile?: string;
  email?: string;
  patientId?: string;
}

const BASE_URL = '/api/users';

class FamilyMemberService {
  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    const res = await fetch(`${BASE_URL}/${userId}/family-members`);
    if (!res.ok) throw new Error(`Failed to fetch family members: ${res.status}`);
    return res.json();
  }

  async addFamilyMember(userId: string, member: Omit<FamilyMember, 'id' | 'userId'>): Promise<FamilyMember> {
    const res = await fetch(`${BASE_URL}/${userId}/family-members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    if (!res.ok) throw new Error(`Failed to add family member: ${res.status}`);
    return res.json();
  }

  async updateFamilyMember(userId: string, memberId: string, member: Omit<FamilyMember, 'id' | 'userId'>): Promise<FamilyMember> {
    const res = await fetch(`${BASE_URL}/${userId}/family-members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    if (!res.ok) throw new Error(`Failed to update family member: ${res.status}`);
    return res.json();
  }

  async deleteFamilyMember(userId: string, memberId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${userId}/family-members/${memberId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete family member: ${res.status}`);
  }
}

export default new FamilyMemberService();
