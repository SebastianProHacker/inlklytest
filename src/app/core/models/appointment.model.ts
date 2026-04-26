export interface AppointmentStatus {
  id: number;
  name: string;
}

export interface AppointmentStatusHistory {
  id: number;
  appointmentId: number;
  statusId: number;
  changedBy?: number;
  createdAt?: string;
  status?: AppointmentStatus;
  changedByNavigation?: { id: number; fullName: string };
}

export interface MaterialConsumption {
  id: number;
  appointmentId: number;
  materialId: number;
  quantityUsed?: number;
  material?: { id: number; name: string; unitMeasure: string };
}

export interface Appointment {
  id: number;
  clientId: number;
  tattooArtistId: number;
  statusId: number;
  quotationId?: number;
  appointmentStart: string;
  appointmentEnd: string;
  notes?: string;
  client?: { id: number; fullName: string; email?: string };
  tattooArtist?: { id: number; fullName: string };
  status?: AppointmentStatus;
  tattooMaterialConsumptions?: MaterialConsumption[];
  appointmentStatusHistories?: AppointmentStatusHistory[];
}

export interface CreateAppointmentPayload {
  clientId: number;
  tattooArtistId: number;
  statusId: number;
  quotationId?: number;
  appointmentStart: string;
  appointmentEnd: string;
  notes?: string;
}

export interface ChangeStatusPayload {
  statusId: number;
  changedBy?: number;
  materialConsumptions?: { materialId: number; quantityUsed: number }[];
}

export interface AppUser {
  id: number;
  fullName: string;
  email: string;
  roleId?: number;
  isActive?: boolean;
}
