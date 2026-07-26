# Hospitonet — Outbound Calls Reference

All HTTP/external calls made by the Hospitonet frontend, grouped by upstream service.
Proxy paths (relative URLs) are resolved by Vite at runtime via `vite.config.ts`.

---

## 1. OTP Service
**Local default:** `http://localhost:8095`  
**Proxy prefix:** `/otp` → rewrites to `/otp` on the target  
**Source:** `src/service/AuthService.ts`

| Method | Path | Purpose | Caller |
|--------|------|---------|--------|
| POST | `/otp/send` | Send OTP to a phone number for login | `sendOTP()`, `resendOTP()` |
| POST | `/otp/verify` | Verify the OTP entered by the user | `verifyOTP()` |

**Request body:** `{ phone: string, purpose: "LOGIN" }` (send/resend) · `{ phone: string, otp: string }` (verify)

---

## 2. User Service
**Local default:** `http://localhost:8085`  
**Proxy prefix:** `/api/users` → forwarded as-is  
**Source:** `src/service/UserService.ts`, `src/service/NotificationService.ts`

| Method | Path | Purpose | Caller |
|--------|------|---------|--------|
| GET | `/api/users/phone/{phone}` | Look up a user by phone number | `getUserByPhone()` |
| GET | `/api/users/{id}` | Fetch a user profile by ID | `getUserById()` |
| POST | `/api/users` | Create a new user | `createUser()` |
| PUT | `/api/users/{id}` | Update an existing user profile | `updateUser()` |
| PATCH | `/api/users/{id}/link-patient` | Link a patientId to a user record | `linkPatient()` |
| GET | `/api/users/{phone}/notifications` | Fetch notifications for a user | `NotificationService.getNotifications()` |

**Note:** `NotificationService` calls the user service directly at `http://localhost:8085` (hardcoded, not proxied).

---

## 3. Patient Service
**Local default:** `http://localhost:8070`  
**Proxy prefix:** `/patient` → strips prefix before forwarding (path rewrite)  
**Protocol:** GraphQL over HTTP POST  
**Endpoint:** `/patient/graphql` → `/graphql` on the patient service  
**Source:** `src/service/PatientService.ts`

| Operation | Type | GraphQL Field | Purpose |
|-----------|------|---------------|---------|
| `getPatientByMobile` | Query | `getPatientByMobile(mobile)` | Find patient by phone (global) |
| `getPatientByUserId` | Query | `getPatientByUserId(userId)` | Find patient by userId (global) |
| `getPatientByMobileAndHospitalId` | Query | `getPatientByMobileAndHospitalId(mobile, hospitalId)` | Hospital-scoped patient lookup by phone |
| `getPatientByUserIdAndHospitalId` | Query | `getPatientByUserIdAndHospitalId(userId, hospitalId)` | Hospital-scoped patient lookup by userId |
| `createPatient` | Mutation | `createPatient(input: PatientInput!)` | Create a new patient record |

**Primary entry point:** `ensurePatientForHospital(user, hospitalId)` — tries hospital-scoped lookups then global fallbacks before creating a new record.

---

## 4. Appointment Service
**Local default:** `http://localhost:8080`  
**Proxy prefix:** `/appointment` → strips prefix before forwarding (path rewrite)  
**Protocol:** GraphQL over HTTP POST  
**Endpoint:** `/appointment/graphql` → `/graphql` on the appointment service  
**Source:** `src/service/AppointmentService.ts`

| Operation | Type | GraphQL Field | Purpose |
|-----------|------|---------------|---------|
| `createAppointment` | Mutation | `createAppointment(input: AppointmentInput!)` | Book a new appointment |
| `getAppointmentsByPatientId` | Query | `getAppointmentsByPatientId(patientId)` | Fetch all appointments for a patient |
| `getAppointmentsByPatientMobile` | Query | `getAppointmentsByPatientMobile(mobile)` | Fetch appointments by patient mobile number |

**Called from:** `AppointmentBookingScreen.tsx` (create), `RecordsScreen.tsx` (fetch by patientId/mobile)

---

## 5. Hospital Service
**Local default:** `http://localhost:8100`  
**Proxy prefix:** `/api` (catch-all, registered after `/api/employees`)  
**Env override:** `VITE_HOSPITAL_SERVICE_URL`  
**Source:** `src/service/HospitalService.ts`, `src/service/LocationService.ts`, `src/service/FavouritesService.ts`

| Method | Path | Purpose | Caller |
|--------|------|---------|--------|
| GET | `/api/hospitals` | Fetch all hospitals (with optional `?filter=` param) | `getHospitals()`, `LocationService.getLocations()` |
| GET | `/api/hospitals/{id}` | Fetch a single hospital by ID | `getHospitalById()` |
| GET | `/api/hospitals/search?keyword=` | Search hospitals by keyword | `searchHospitals()` |
| GET | `/api/hospitals/city/{city}` | List hospitals in a city | `getHospitalsByCity()` |
| GET | `/api/hospitals/top-rated` | Fetch top-rated hospitals (for Favourites) | `FavouritesService.fetchHospitals()` |

**Filter values:** `near_me`, `top_rated`, `24_7` (mapped from UI labels in `HospitalService.ts`)  
**Note:** `LocationService` and `FavouritesService` call the hospital service at the hardcoded absolute URL `http://localhost:8100` (not via proxy).

---

## 6. Employee Service
**Local default:** `http://localhost:8082`  
**Proxy prefix:** `/api/employees` → forwarded as-is (registered before the `/api` catch-all)  
**Source:** `src/service/DepartmentService.ts`

| Method | Path | Purpose | Caller |
|--------|------|---------|--------|
| GET | `/api/employees/hospital/{hospitalId}/departments` | Departments with staff at a hospital | `getDepartmentsByHospital()` |
| GET | `/api/employees/hospital/{hospitalId}/department/{departmentId}/doctors` | Doctors in a department at a hospital | `getDoctorsByDepartment()` |
| GET | `/api/employees/{staffId}/available-slots?date=` | Available appointment slots for a doctor | `getAvailableSlots()` |

**Fallback:** All three methods fall back to static local data when the service is unreachable.  
**Legacy (not proxied, direct hardcoded):**
- `GET http://localhost:8080/api/departments` — `getDepartments()` (deprecated)
- `GET http://localhost:8080/api/doctors` — `getDoctors()` (deprecated)

---

## 7. Inventory Service
**Local default:** `http://localhost:8090`  
**Proxy:** None — called directly via hardcoded absolute URL  
**Protocol:** GraphQL over HTTP POST  
**Endpoint:** `http://localhost:8090/graphql`  
**Source:** `src/service/MedicineService.ts`, `src/service/FavouritesService.ts`

| Operation | Type | GraphQL Field | Purpose |
|-----------|------|---------------|---------|
| `getAllItems` | Query | `getAllItems { id, itemName, itemCategory, itemSupplier, description, price }` | Fetch all medicines/inventory items |

**Called from:** `MedicinesScreen.tsx` (full list), `FavouritesScreen.tsx` (top 4 items)  
**Fallback:** Returns static `Medicines` / `FAVOURITES.medicines` data when unreachable.

---

## 8. Lab Test Service
**Local default:** `http://localhost:8086`  
**Proxy:** None — called directly via hardcoded absolute URL  
**Source:** `src/service/LabTestService.ts`

| Method | Path | Purpose | Caller |
|--------|------|---------|--------|
| GET | `http://localhost:8086/api/lab-tests` | Fetch all available lab tests | `getLabTests()` |
| GET | `http://localhost:8086/api/lab-tests/categories` | Fetch test category list | `getCategories()` |

**Fallback:** Returns static `LAB_TESTS` / `TEST_CATEGORIES` data when unreachable.

---

## 9. Order Service
**Local default:** `http://localhost:8096`  
**Proxy:** None — called directly via hardcoded absolute URL  
**Source:** `src/service/OrderService.ts`

| Method | Path | Purpose | Caller |
|--------|------|---------|--------|
| GET | `http://localhost:8096/api/orders/user/{phone}` | Fetch orders for the logged-in user | `getOrders()` |
| GET | `http://localhost:8096/api/orders` | Fetch all orders (fallback when no session) | `getOrders()` |

**Fallback:** Returns static `ORDERS` data when unreachable.

---

## 10. Profile Image Store (User Service / GridFS)
**Source:** `src/service/ImageUploadService.ts`

| Method | Endpoint | Purpose | Caller |
|--------|----------|---------|--------|
| POST | `/api/users/image` | Upload a compressed JPEG, stored via MongoDB GridFS in userdb; returns `{ id, url, name }` | `uploadProfileImage()` |
| GET | `/api/users/image/{id}` | Stream a stored profile image back | rendered directly as `<img src>` |

Replaces the previous client-direct-to-Appwrite upload — the image now lives in userdb alongside the rest of the user's profile data instead of a third-party cloud project.

---

## 11. Google Gemini AI (External Cloud)
**SDK:** `@google/genai`  
**Model:** `gemini-3-flash-preview`  
**Source:** `src/screens/AssistantScreen.tsx`

| Method | Purpose |
|--------|---------|
| `ai.models.generateContent(...)` | Stream a response from Gemini for AI health assistant chat |

**API Key:** Read from `process.env.API_KEY` (injected via `GEMINI_API_KEY` env var in `vite.config.ts`).

---

## Proxy Summary

| Proxy Prefix | Target Service | Default Port | Path Rewrite |
|---|---|---|---|
| `/otp` | OTP Service | 8095 | None |
| `/api/users` | User Service | 8085 | None |
| `/patient` | Patient Service | 8070 | Strip `/patient` prefix |
| `/appointment` | Appointment Service | 8080 | Strip `/appointment` prefix |
| `/api/employees` | Employee Service | 8082 | None |
| `/api` (catch-all) | Hospital Service | 8100 | None |

Services **not** behind the Vite proxy (hardcoded absolute URLs):
- Inventory Service — `http://localhost:8090`
- Lab Test Service — `http://localhost:8086`
- Order Service — `http://localhost:8096`
- Notification Service (user endpoint) — `http://localhost:8085`
- Location/Favourites hospital calls — `http://localhost:8100`
- Google Gemini — managed by `@google/genai` SDK
