import { DEPARTMENTS, DOCTORS, Department, Doctor } from '../resources/AppointmentBooking';
import { HospitalDepartment, EmployeeDoctor, AvailableSlot } from '../resources/AppointmentBooking';

const EMPLOYEE_API = '/api/employees';

class DepartmentService {
  // ── Hospital-scoped discovery (live data from employee-service) ─────────────

  /**
   * Returns departments that have at least one employee in the given hospital.
   * Falls back to static DEPARTMENTS when the service is unreachable.
   */
  async getDepartmentsByHospital(hospitalId: string): Promise<HospitalDepartment[]> {
    try {
      const res = await fetch(`${EMPLOYEE_API}/hospital/${encodeURIComponent(hospitalId)}/departments`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HospitalDepartment[] = await res.json();
      if (data.length > 0) return data;
      throw new Error('Empty response');
    } catch (error) {
      console.warn('[DepartmentService] getDepartmentsByHospital failed, using static fallback:', (error as Error).message);
      return DEPARTMENTS.map(d => ({ id: d.id, name: d.name }));
    }
  }

  /**
   * Returns doctors (employees) for the given hospital + department.
   * Falls back to static DOCTORS when the service is unreachable.
   */
  async getDoctorsByDepartment(hospitalId: string, departmentId: string): Promise<EmployeeDoctor[]> {
    try {
      const res = await fetch(
        `${EMPLOYEE_API}/hospital/${encodeURIComponent(hospitalId)}/department/${encodeURIComponent(departmentId)}/doctors`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: EmployeeDoctor[] = await res.json();
      if (data.length > 0) return data;
      throw new Error('Empty response');
    } catch (error) {
      console.warn('[DepartmentService] getDoctorsByDepartment failed, using static fallback:', (error as Error).message);
      // Return static doctors that match the department (best-effort)
      const dept = DEPARTMENTS.find(d => d.id === departmentId || d.name === departmentId);
      const doctorIds = dept?.doctors ?? [];
      return doctorIds
        .map(id => DOCTORS[id])
        .filter(Boolean)
        .map(d => ({
          employeeId: d.id,
          fullName: d.name,
          designation: d.specialization,
          department: dept?.name ?? '',
          departmentId: dept?.id ?? '',
          profileImageUrl: d.image,
        }));
    }
  }

  /**
   * Returns AVAILABLE time slots for a doctor on the given date.
   * Falls back to static TIME_SLOTS formatted as AvailableSlot objects when the service is unreachable.
   */
  async getAvailableSlots(staffId: string, date: string): Promise<AvailableSlot[]> {
    try {
      const res = await fetch(
        `${EMPLOYEE_API}/${encodeURIComponent(staffId)}/available-slots?date=${encodeURIComponent(date)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body: { availableSlots: AvailableSlot[] } = await res.json();
      return body.availableSlots ?? [];
    } catch (error) {
      console.warn('[DepartmentService] getAvailableSlots failed, using static fallback:', (error as Error).message);
      // Build synthetic 30-min slots from 09:00 – 17:00 as a dev fallback
      return buildFallbackSlots(staffId);
    }
  }

  // ── Legacy methods (kept for backward compatibility) ────────────────────────

  async getDepartments(): Promise<Department[]> {
    try {
      const res = await fetch('http://localhost:8080/api/departments');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Department[] = await res.json();
      if (!data.length) throw new Error('Empty response');
      return data;
    } catch {
      return DEPARTMENTS;
    }
  }

  async getDoctors(): Promise<Record<string, Doctor>> {
    try {
      const res = await fetch('http://localhost:8080/api/doctors');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list: Doctor[] = await res.json();
      if (!list.length) throw new Error('Empty response');
      return list.reduce((acc, doc) => ({ ...acc, [doc.id]: doc }), {} as Record<string, Doctor>);
    } catch {
      return DOCTORS;
    }
  }
}

function buildFallbackSlots(staffId: string): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  let current = 9 * 60; // 09:00 in minutes
  while (current + 30 <= 17 * 60) {
    const start = `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`;
    const end   = `${String(Math.floor((current + 30) / 60)).padStart(2, '0')}:${String((current + 30) % 60).padStart(2, '0')}`;
    slots.push({ slotId: `fallback-${start}`, startTime: start, endTime: end, status: 'AVAILABLE', employeeId: staffId });
    current += 30;
  }
  return slots;
}

export default new DepartmentService();
