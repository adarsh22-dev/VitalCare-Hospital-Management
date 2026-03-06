export type PatientStatus = 'Stable' | 'Critical' | 'Recovering' | 'Discharged';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  status: PatientStatus;
  lastVisit: string;
  doctor: string;
  condition: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  availability: 'Available' | 'On Break' | 'In Surgery' | 'Offline';
  patients: number;
  image: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'Checkup' | 'Surgery' | 'Consultation' | 'Emergency';
  status: 'Confirmed' | 'Pending' | 'Completed';
}

export interface DashboardStats {
  totalPatients: number;
  activeDoctors: number;
  appointmentsToday: number;
  availableBeds: number;
}
