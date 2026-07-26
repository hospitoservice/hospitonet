# Hospitonet — Entity / Object Reference

All TypeScript interfaces, types, and enums used across the Hospitonet frontend,
organised by domain. File paths are relative to the project root.

---

## Enums & Union Types

### `Screen` — `types.ts`
Navigation screen identifiers used throughout the router.

| Value | String |
|-------|--------|
| `LOGIN` | `"login"` |
| `VERIFY` | `"verify"` |
| `HOME` | `"home"` |
| `HOSPITALS` | `"hospitals"` |
| `RECORDS` | `"records"` |
| `MEDICINES` | `"medicines"` |
| `PROFILE` | `"profile"` |
| `FAVOURITES` | `"favourites"` |
| `ASSISTANT` | `"assistant"` |
| `NOTIFICATIONS` | `"notifications"` |
| `LABTESTS` | `"lab-tests"` |
| `CHECKOUT` | `"checkout"` |

---

### `PaymentMethod` — `src/screens/CheckoutScreen.tsx`
Union type for checkout payment selection.

```
'upi' | 'card' | 'cod'
```

---

### Order `status` union — `src/resources/Order.ts`
```
'Delivered' | 'Processing' | 'Cancelled' | 'Shipped'
```

---

## Domain Entities

### `Hospital` — `types.ts`
Represents a hospital returned by the hospital-service REST API.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | Yes | MongoDB document ID |
| `hospitalId` | `string` | No | Business-level hospital code (e.g. `"H00012"`) |
| `name` | `string` | Yes | Display name |
| `location` | `string` | Yes | Free-form location string |
| `city` | `string` | No | City extracted from location |
| `distance` | `string` | Yes | Distance label shown in UI |
| `rating` | `number` | Yes | Star rating (0–5) |
| `tags` | `string[]` | Yes | Specialty/feature tags (e.g. `["Multispeciality", "24/7"]`) |
| `consultationFee` | `number` | Yes | Fee in INR |
| `image` | `string` | Yes | Image URL |
| `phone` | `string` | No | Contact number |
| `email` | `string` | No | Contact email |
| `website` | `string` | No | Hospital website URL |
| `isActive` | `boolean` | No | Whether the hospital is currently active |

---

### `Doctor` — `types.ts`
Compact doctor card used in the UI (display-only).

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `name` | `string` | Yes |
| `specialty` | `string` | Yes |
| `hospital` | `string` | Yes |
| `rating` | `number` | Yes |
| `image` | `string` | Yes |

---

### `Appointment` — `types.ts`
Lightweight appointment shape used for UI display cards.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | Yes | |
| `doctorName` | `string` | Yes | |
| `specialty` | `string` | Yes | |
| `hospital` | `string` | Yes | Hospital name string |
| `date` | `string` | Yes | |
| `time` | `string` | Yes | |
| `status` | `'Upcoming' \| 'Completed' \| 'Cancelled'` | Yes | |
| `image` | `string` | Yes | Doctor image URL |
| `prescription` | `string[]` | Yes | Array of prescription image URLs |

---

### `BookedAppointment` — `types.ts`
Full appointment document returned by the appointment-service GraphQL API.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | Yes | MongoDB document ID |
| `patientId` | `string` | Yes | |
| `patientFirstName` | `string` | Yes | |
| `patientLastName` | `string` | Yes | |
| `patientGender` | `string` | No | |
| `patientMobile` | `string` | No | |
| `patientEmail` | `string` | No | |
| `patientDOB` | `string` | No | ISO date string |
| `department` | `string` | Yes | |
| `doctor` | `string` | No | Doctor full name |
| `doctorFees` | `number` | No | Consultation fee in INR |
| `shift` | `string` | No | `"Morning"` / `"Evening"` etc. |
| `appointmentDate` | `string` | Yes | ISO date string |
| `slot` | `string` | Yes | Time string e.g. `"10:00:00"` |
| `appointmentPriority` | `string` | No | `"High"` / `"Normal"` etc. |
| `paymentMode` | `string` | No | |
| `status` | `string` | Yes | `"Scheduled"` / `"Completed"` / `"Cancelled"` etc. |
| `message` | `string` | No | Patient notes or reason for visit |
| `liveConsultant` | `string` | No | `"Yes"` / `"No"` |
| `vitals` | `AppointmentVitals` | No | ↓ see below |
| `symptoms` | `AppointmentSymptoms` | No | ↓ see below |
| `doctorComments` | `string` | No | Doctor's notes |
| `medicine` | `AppointmentMedicine[]` | No | ↓ see below |
| `testsAndReports` | `AppointmentTestReport[]` | No | ↓ see below |
| `paymentInformation` | `AppointmentPayment[]` | No | ↓ see below |
| `hospital` | `AppointmentHospitalInfo` | No | ↓ see below |

---

### `AppointmentVitals` — `types.ts`
Embedded vitals sub-document within a `BookedAppointment`.

| Field | Type |
|-------|------|
| `height` | `string` |
| `weight` | `string` |
| `bmi` | `string` |
| `temperature` | `string` |
| `heartRate` | `string` |
| `spo2` | `string` |
| `bloodGroup` | `string` |
| `bloodPressure` | `string` |
| `condition` | `string` |

All fields optional.

---

### `AppointmentSymptoms` — `types.ts`
Boolean symptom checklist embedded in a `BookedAppointment`.

| Field | Type |
|-------|------|
| `fever` | `boolean` |
| `cough` | `boolean` |
| `headache` | `boolean` |
| `fatigue` | `boolean` |
| `jointPain` | `boolean` |
| `chestPain` | `boolean` |
| `bodyPain` | `boolean` |
| `abdominalPain` | `boolean` |
| `hairloss` | `boolean` |
| `breathingProblem` | `boolean` |
| `nightSweats` | `boolean` |
| `infection` | `boolean` |
| `vomiting` | `boolean` |
| `diarrhea` | `boolean` |
| `constipation` | `boolean` |
| `dizziness` | `boolean` |
| `skinrash` | `boolean` |
| `nausea` | `boolean` |
| `otherSymptoms` | `string` |

All fields optional.

---

### `AppointmentMedicine` — `types.ts`
Prescribed medicine entry embedded in a `BookedAppointment`.

| Field | Type |
|-------|------|
| `id` | `string` |
| `medicineName` | `string` |
| `medicineCategory` | `string` |
| `medicineDosage` | `string` |
| `medicineFrequency` | `string` |
| `medicineDuration` | `string` |
| `store` | `string` |
| `description` | `string` |
| `price` | `string` |
| `expiryDate` | `string` |

All fields optional.

---

### `AppointmentTestReport` — `types.ts`
Lab test or diagnostic report linked to a `BookedAppointment`.

| Field | Type |
|-------|------|
| `id` | `string` |
| `testId` | `string` |
| `testName` | `string` |
| `testCategory` | `string` |
| `testStatus` | `string` |
| `testAssignedDate` | `string` |
| `testPerformedDate` | `string` |
| `reportId` | `string` |
| `reportName` | `string` |
| `report` | `string` |
| `reportDate` | `string` |

All fields optional.

---

### `AppointmentPayment` — `types.ts`
Payment transaction record embedded in a `BookedAppointment`.

| Field | Type |
|-------|------|
| `paymentId` | `string` |
| `paymentMode` | `string` |
| `paymentAmount` | `string` |
| `paymentSuccessful` | `boolean` |

All fields optional.

---

### `AppointmentHospitalInfo` — `types.ts`
Snapshot of hospital details embedded inside a `BookedAppointment`.

| Field | Type |
|-------|------|
| `hospitalId` | `string` |
| `hospitalName` | `string` |
| `hospitalBranchName` | `string` |
| `hospitalLocation` | `{ address?, city?, state?, pincode? }` |

All fields optional.

---

### `RecordItem` — `types.ts`
Generic medical record card used in the Records screen list view.

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `title` | `string` | Yes |
| `location` | `string` | Yes |
| `date` | `string` | Yes |
| `status` | `string` | No |
| `type` | `'lab' \| 'consultation' \| 'vaccination' \| 'order'` | Yes |

---

### `Medicine` — `types.ts`
Medicine product shown in the Medicines catalogue and cart.

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `name` | `string` | Yes |
| `manufacturer` | `string` | Yes |
| `price` | `number` | Yes |
| `originalPrice` | `number` | No |
| `rating` | `number` | Yes |
| `reviews` | `number` | Yes |
| `discount` | `string` | No | e.g. `"-12%"` |
| `image` | `string` | Yes |

---

## User & Patient Entities

### `UserProfile` — `src/service/UserService.ts`
Full user account record stored in the user-service.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | No | MongoDB document ID |
| `userId` | `string` | No | Alias for `id` |
| `patientId` | `string` | No | Linked patient record ID |
| `healthCardNumber` | `string` | No | |
| `firstName` | `string` | No | |
| `middleName` | `string` | No | |
| `lastName` | `string` | No | |
| `phone` | `string` | No | Used as login identifier |
| `email` | `string` | No | |
| `aadhar` | `string` | No | 12-digit Aadhar number |
| `dateOfBirth` | `string` | No | ISO date string |
| `age` | `number` | No | |
| `gender` | `string` | No | `"Male"` / `"Female"` / `"Other"` |
| `bloodGroup` | `string` | No | e.g. `"O+"` |
| `height` | `string` | No | |
| `weight` | `string` | No | |
| `bmi` | `string` | No | |
| `allergies` | `string` | No | |
| `additionalComments` | `string` | No | |
| `imageUrl` | `string` | No | Appwrite profile image URL |
| `location` | `UserLocation` | No | ↓ see below |
| `immediateContact` | `ImmediateContact` | No | ↓ see below |
| `medicalHistoryList` | `MedicalHistory[]` | No | ↓ see below |
| `insuranceInformation` | `InsuranceInformation` | No | ↓ see below |
| `appointmentIdList` | `string[]` | No | IDs of all linked appointments |

---

### `UserLocation` — `src/service/UserService.ts`
Address sub-document embedded in `UserProfile`.

| Field | Type |
|-------|------|
| `address` | `string` |
| `city` | `string` |
| `state` | `string` |
| `pincode` | `string` |

All fields optional.

---

### `ImmediateContact` — `src/service/UserService.ts`
Emergency contact embedded in `UserProfile`.

| Field | Type |
|-------|------|
| `firstName` | `string` |
| `lastName` | `string` |
| `mobile` | `string` |
| `email` | `string` |
| `relation` | `string` |

All fields optional. Allowed `relation` values: `Spouse`, `Parent`, `Child`, `Sibling`, `Friend`, `Other`.

---

### `MedicalHistory` — `src/service/UserService.ts`
A past or ongoing medical condition entry within `UserProfile`.

| Field | Type |
|-------|------|
| `issueName` | `string` |
| `issueDiagnosedDate` | `string` |
| `currentlyActive` | `boolean` |

All fields optional.

---

### `InsuranceInformation` — `src/service/UserService.ts`
Insurance policy details embedded in `UserProfile`.

| Field | Type |
|-------|------|
| `insuranceId` | `string` |
| `insuranceCompanyName` | `string` |
| `insuranceName` | `string` |
| `insuranceAmount` | `number` |

All fields optional.

---

### `PatientRecord` — `src/service/PatientService.ts`
Patient record stored in the patient-service (hospital-scoped).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | No | MongoDB document ID |
| `patientId` | `string` | Yes | Business patient ID (e.g. `"P00123"`) |
| `hospitalId` | `string` | No | Hospital this record belongs to |
| `userId` | `string` | No | Linked user-service user ID |
| `firstName` | `string` | No | |
| `middleName` | `string` | No | |
| `lastName` | `string` | No | |
| `mobile` | `string` | No | |
| `email` | `string` | No | |
| `dateOfBirth` | `string` | No | ISO date string |
| `age` | `number` | No | |
| `gender` | `string` | No | |
| `allergies` | `string` | No | |

---

## Appointment Input Entities (Write Side)

These interfaces are used when **sending** data to the appointment-service GraphQL API.
Source: `src/service/AppointmentService.ts`

### `AppointmentInput`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | No | Present on updates |
| `patientId` | `string` | Yes | |
| `patientFirstName` | `string` | Yes | |
| `patientLastName` | `string` | Yes | |
| `patientGender` | `string` | Yes | |
| `patientMobile` | `string` | Yes | |
| `patientEmail` | `string` | No | |
| `patientDOB` | `string` | Yes | ISO date string |
| `department` | `string` | Yes | |
| `doctor` | `string` | No | |
| `doctorFees` | `number` | No | |
| `shift` | `string` | No | |
| `appointmentDate` | `string` | Yes | ISO date string |
| `slot` | `string` | Yes | `"HH:mm:ss"` format |
| `appointmentPriority` | `string` | No | |
| `paymentMode` | `string` | No | |
| `status` | `string` | Yes | |
| `message` | `string` | Yes | |
| `liveConsultant` | `string` | No | `"Yes"` / `"No"` |
| `symptoms` | `SymptomsInput` | No | ↓ see below |
| `vitals` | `VitalsInput` | No | ↓ see below |
| `doctorComments` | `string` | No | |
| `testsAndReports` | `TestsAndReportsInput[]` | No | ↓ see below |
| `medicine` | `MedicineInput[]` | No | ↓ see below |
| `paymentInformation` | `PaymentInformationInput[]` | No | ↓ see below |
| `hospital` | `HospitalInput` | No | ↓ see below |

---

### `HospitalInput` — `src/service/AppointmentService.ts`
Hospital sub-document sent with appointment mutations.

| Field | Type |
|-------|------|
| `hospitalId` | `string` |
| `hospitalName` | `string` |
| `hospitalBranchId` | `string` |
| `hospitalBranchName` | `string` |
| `hospitalLocation` | `LocationInput` |

All fields optional.

---

### `LocationInput` — `src/service/AppointmentService.ts`
Address sub-document used within `HospitalInput`.

| Field | Type |
|-------|------|
| `address` | `string` |
| `city` | `string` |
| `state` | `string` |
| `pincode` | `string` |

All fields optional.

---

### `VitalsInput` — `src/service/AppointmentService.ts`
Vitals payload for appointment mutations (mirrors `AppointmentVitals`).

| Field | Type |
|-------|------|
| `height` | `string` |
| `weight` | `string` |
| `bmi` | `string` |
| `temperature` | `string` |
| `heartRate` | `string` |
| `spo2` | `string` |
| `bloodGroup` | `string` |
| `bloodPressure` | `string` |
| `condition` | `string` |

All fields optional.

---

### `SymptomsInput` — `src/service/AppointmentService.ts`
Symptom checklist payload for appointment mutations (mirrors `AppointmentSymptoms`).
All boolean fields plus `otherSymptoms: string`. All optional.

---

### `TestsAndReportsInput` — `src/service/AppointmentService.ts`
Lab test/report payload for appointment mutations.

| Field | Type |
|-------|------|
| `id` | `string` |
| `testId` | `string` |
| `testName` | `string` |
| `testCategory` | `string` |
| `testAssignedDate` | `string` |
| `testAssignedTime` | `string` |
| `testStatus` | `string` |
| `testPerformedDate` | `string` |
| `testPerformedTime` | `string` |
| `reportId` | `string` |
| `reportName` | `string` |
| `report` | `string` |
| `reportDate` | `string` |
| `reportTime` | `string` |

All fields optional.

---

### `MedicineInput` — `src/service/AppointmentService.ts`
Prescribed medicine payload for appointment mutations.

| Field | Type |
|-------|------|
| `id` | `string` |
| `medicineName` | `string` |
| `medicineCategory` | `string` |
| `medicineSupplier` | `string` |
| `medicineDosage` | `string` |
| `medicineFrequency` | `string` |
| `medicineDuration` | `string` |
| `store` | `string` |
| `manufactureDate` | `string` |
| `expiryDate` | `string` |
| `description` | `string` |
| `totalQuantity` | `string` |
| `price` | `string` |

All fields optional.

---

### `PaymentInformationInput` — `src/service/AppointmentService.ts`
Payment transaction payload for appointment mutations.

| Field | Type |
|-------|------|
| `paymentId` | `string` |
| `paymentMode` | `string` |
| `paymentAmount` | `string` |
| `paymentSuccessful` | `boolean` |

All fields optional.

---

## Employee & Booking Entities

### `HospitalDepartment` — `src/resources/AppointmentBooking.ts`
Department returned by the employee-service live API.

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `name` | `string` | Yes |

---

### `EmployeeDoctor` — `src/resources/AppointmentBooking.ts`
Doctor/employee card returned by the employee-service live API.

| Field | Type | Required |
|-------|------|----------|
| `employeeId` | `string` | Yes |
| `fullName` | `string` | Yes |
| `designation` | `string` | Yes |
| `department` | `string` | Yes |
| `departmentId` | `string` | Yes |
| `profileImageUrl` | `string` | No |

---

### `AvailableSlot` — `src/resources/AppointmentBooking.ts`
Time slot returned by the employee-service available-slots API.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `slotId` | `string` | Yes | |
| `startTime` | `string` | Yes | `"HH:mm"` 24-hour |
| `endTime` | `string` | Yes | `"HH:mm"` 24-hour |
| `status` | `string` | Yes | `"AVAILABLE"` / `"BOOKED"` / `"BLOCKED"` |
| `employeeId` | `string` | Yes | |
| `patientId` | `string` | No | Set when `status` is `BOOKED` |
| `appointmentId` | `string` | No | Set when `status` is `BOOKED` |

---

### `Department` — `src/resources/AppointmentBooking.ts`
Static fallback department shape (used when employee-service is unreachable).

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `name` | `string` | Yes |
| `doctors` | `string[]` | Yes | Array of `Doctor.id` references |

---

### `Doctor` (static) — `src/resources/AppointmentBooking.ts`
Static fallback doctor shape (used when employee-service is unreachable).

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `name` | `string` | Yes |
| `specialization` | `string` | Yes |
| `experience` | `number` | Yes | Years |
| `rating` | `number` | Yes | 0–5 |
| `image` | `string` | Yes | Profile image URL |
| `availableSlots` | `string[]` | Yes | e.g. `["09:00 AM", "10:00 AM"]` |

---

## Catalogue Entities

### `LabTest` — `src/resources/LabTest.ts`
Lab test item shown on the Lab Tests screen.

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `name` | `string` | Yes |
| `category` | `string` | Yes |
| `price` | `number` | Yes | INR |
| `description` | `string` | Yes |
| `preparation` | `string` | Yes | Pre-test patient instructions |
| `resultsIn` | `string` | Yes | Expected turnaround e.g. `"24 hours"` |
| `popular` | `boolean` | Yes | Shown in Popular Tests filter |

---

### `TestCategory` — `src/resources/LabTest.ts`
Filter category for the Lab Tests screen.

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `name` | `string` | Yes |

---

### `Order` — `src/resources/Order.ts`
Medicine delivery order.

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `orderNumber` | `string` | Yes | Display-friendly e.g. `"#ORD-2023-001"` |
| `date` | `string` | Yes | ISO date string |
| `status` | `'Delivered' \| 'Processing' \| 'Cancelled' \| 'Shipped'` | Yes |
| `total` | `number` | Yes | Total amount in INR |
| `items` | `OrderItem[]` | Yes | ↓ see below |

### `OrderItem` (inline) — `src/resources/Order.ts`

| Field | Type |
|-------|------|
| `id` | `string` |
| `name` | `string` |
| `quantity` | `number` |
| `price` | `number` |
| `image` | `string` |

---

## Notification Entity

### `Notification` — `src/service/NotificationService.ts`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | Yes | |
| `type` | `string` | Yes | `"appointment"` / `"medicine"` / `"offer"` / `"activity"` |
| `title` | `string` | Yes | Short notification heading |
| `message` | `string` | Yes | Full notification body |
| `time` | `string` | Yes | Relative time label e.g. `"10 min ago"` |
| `read` | `boolean` | Yes | Whether user has seen it |
| `icon` | `string` | Yes | Material Icon name |
| `color` | `string` | Yes | Tailwind text colour class |
| `bgColor` | `string` | Yes | Tailwind background colour class |

---

## Favourites Entities

Source: `src/service/FavouritesService.ts`

### `FavouriteMedicine`

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `name` | `string` | Yes |
| `manufacturer` | `string` | Yes |
| `price` | `number` | Yes |
| `originalPrice` | `number` | Yes |
| `rating` | `number` | Yes |
| `reviews` | `number` | Yes |
| `image` | `string` | Yes |

---

### `FavouriteHospital`

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `name` | `string` | Yes |
| `location` | `string` | Yes |
| `rating` | `number` | Yes |
| `tags` | `string[]` | Yes |
| `image` | `string` | Yes |

---

### `FavouriteDoctor`

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `name` | `string` | Yes |
| `specialty` | `string` | Yes |
| `hospital` | `string` | Yes |
| `rating` | `number` | Yes |
| `image` | `string` | Yes |

---

### `Favourites`
Aggregate container returned by `FavouritesService.getFavourites()`.

| Field | Type |
|-------|------|
| `medicines` | `FavouriteMedicine[]` |
| `hospitals` | `FavouriteHospital[]` |
| `doctors` | `FavouriteDoctor[]` |

---

## Screen-Local Entities

These interfaces are defined inside individual screen components and are not exported globally.

### `CartItem` — `src/screens/CartScreen.tsx`
Extends `Medicine` with a shopping cart quantity field.

```typescript
interface CartItem extends Medicine {
  quantity: number;
}
```

---

### `Message` — `src/screens/AssistantScreen.tsx`
A single chat bubble in the AI assistant conversation.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | Yes | |
| `text` | `string` | Yes | Chat message content |
| `sender` | `'user' \| 'assistant'` | Yes | |
| `timestamp` | `Date` | Yes | |

---

### `EditForm` — `src/screens/ProfileScreen.tsx`
Local form state for the profile edit UI (not persisted directly — mapped to `UserProfile` on save).

| Field | Type |
|-------|------|
| `firstName` | `string` |
| `middleName` | `string` |
| `lastName` | `string` |
| `email` | `string` |
| `aadhar` | `string` |
| `dateOfBirth` | `string` |
| `gender` | `string` |
| `bloodGroup` | `string` |
| `height` | `string` |
| `weight` | `string` |
| `allergies` | `string` |
| `imageUrl` | `string` |
| `location` | `{ address, city, state, pincode }` |
| `immediateContact` | `{ firstName, lastName, mobile, email, relation }` |

---

### `PrescriptionEntry` — `src/screens/RecordsScreen.tsx`
Derived view object grouping prescription medicines from a single appointment.

| Field | Type |
|-------|------|
| `appointmentId` | `string` |
| `appointment` | `BookedAppointment` |
| `medicines` | `AppointmentMedicine[]` |

---

### `LabEntry` — `src/screens/RecordsScreen.tsx`
Derived view object grouping a lab test result from a single appointment.

| Field | Type |
|-------|------|
| `appointmentId` | `string` |
| `appointment` | `BookedAppointment` |
| `test` | `AppointmentTestReport` |

---

## Entity Relationship Overview

```
UserProfile ─────────────── PatientRecord
    │                             │
    │ (patientId link)            │ (patientId used in)
    └──────────────────────► BookedAppointment
                                  ├── AppointmentVitals
                                  ├── AppointmentSymptoms
                                  ├── AppointmentMedicine[]
                                  ├── AppointmentTestReport[]
                                  ├── AppointmentPayment[]
                                  └── AppointmentHospitalInfo ──► Hospital

BookedAppointment
    ├── (medicines)  ──► PrescriptionEntry  (RecordsScreen view)
    └── (tests)      ──► LabEntry           (RecordsScreen view)

CartItem (extends Medicine)
    └── used in Order.items (OrderItem)
```
