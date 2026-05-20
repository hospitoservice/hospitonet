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
  hospitalContact?: string;
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
  medicinePresent?: boolean;
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
  testPresent?: boolean;
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
  vitalPresent?: boolean;
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
  symptomsPresent?: boolean;
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

class AppointmentService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8080/graphql') {
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
          symptoms {
            symptomsPresent
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
            vitalPresent
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
            testPresent
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
            medicinePresent
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
            hospitalContact
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
}

export default new AppointmentService();
