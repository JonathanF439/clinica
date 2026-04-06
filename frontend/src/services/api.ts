import axios from "axios";
import type { Doctor, Patient, Appointment, Procedure, Permission, User, CreateUserPayload } from "@/types/clinic";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Doctor Service ────────────────────────────────────────────────────────────
export const doctorService = {
  findAll: () => api.get<Doctor[]>("/doctors").then((r) => r.data),
  findById: (id: string) => api.get<Doctor>(`/doctors/${id}`).then((r) => r.data),
  create: (data: Omit<Doctor, "id">) =>
    api.post<Doctor>("/doctors", data).then((r) => r.data),
  update: (id: string, data: Partial<Omit<Doctor, "id">>) =>
    api.patch<Doctor>(`/doctors/${id}`, data).then((r) => r.data),
};

// ─── Patient Service ───────────────────────────────────────────────────────────
export const patientService = {
  findAll: (search?: string) =>
    api.get<Patient[]>("/patients", { params: search ? { search } : {} }).then((r) => r.data),
  findById: (id: string) => api.get<Patient>(`/patients/${id}`).then((r) => r.data),
  create: (data: Omit<Patient, "id">) =>
    api.post<Patient>("/patients", data).then((r) => r.data),
  update: (id: string, data: Partial<Omit<Patient, "id">>) =>
    api.patch<Patient>(`/patients/${id}`, data).then((r) => r.data),
};

// ─── Appointment Service ───────────────────────────────────────────────────────
export const appointmentService = {
  findByDate: (date?: string, doctorId?: string) =>
    api
      .get<Appointment[]>("/appointments", { params: { date, doctorId } })
      .then((r) => r.data),
  findById: (id: string) =>
    api.get<Appointment>(`/appointments/${id}`).then((r) => r.data),
  findByPatient: (patientId: string) =>
    api.get<Appointment[]>(`/appointments/patient/${patientId}`).then((r) => r.data),
  create: (data: Omit<Appointment, "id" | "patient" | "doctor">) =>
    api.post<Appointment>("/appointments", data).then((r) => r.data),
  update: (id: string, data: Partial<Omit<Appointment, "patient" | "doctor">>) =>
    api.patch<Appointment>(`/appointments/${id}`, data).then((r) => r.data),
};

// ─── Procedure Service ─────────────────────────────────────────────────────────
export const procedureService = {
  findAll: () => api.get<Procedure[]>("/procedures").then((r) => r.data),
};

// ─── Appointment Status ────────────────────────────────────────────────────────
export const appointmentStatusService = {
  update: (id: string, status: string) =>
    api.patch<Appointment>(`/appointments/${id}/status`, { status }).then((r) => r.data),
};

// ─── Permission Service ────────────────────────────────────────────────────────
export const permissionService = {
  findAll: () => api.get<Permission[]>("/permissions").then((r) => r.data),
  update: (role: string, resource: string, action: string, allowed: boolean) =>
    api.patch<Permission>("/permissions", { role, resource, action, allowed }).then((r) => r.data),
};

// ─── User Service ──────────────────────────────────────────────────────────────
export const userService = {
  findAll: () => api.get<User[]>("/users").then((r) => r.data),
  create: (data: CreateUserPayload) => api.post<User>("/users", data).then((r) => r.data),
  update: (id: string, data: Partial<CreateUserPayload>) => api.patch<User>(`/users/${id}`, data).then((r) => r.data),
};
