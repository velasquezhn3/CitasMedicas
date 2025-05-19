export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO string
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}
