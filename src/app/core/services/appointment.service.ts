import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Appointment,
  AppointmentStatus,
  AppointmentStatusHistory,
  CreateAppointmentPayload,
  ChangeStatusPayload,
  AppUser,
} from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<any>(`${this.base}/appointment`).pipe(
      map(res => (Array.isArray(res) ? res : res?.data ?? []))
    );
  }

  getAppointment(id: number): Observable<Appointment> {
    return this.http.get<any>(`${this.base}/appointment/${id}`).pipe(
      map(res => res?.data ?? res)
    );
  }

  createAppointment(payload: CreateAppointmentPayload): Observable<Appointment> {
    return this.http.post<any>(`${this.base}/appointment`, payload).pipe(
      map(res => res?.data ?? res)
    );
  }

  changeStatus(id: number, payload: ChangeStatusPayload): Observable<Appointment> {
    return this.http.patch<any>(`${this.base}/appointment/${id}/status`, payload).pipe(
      map(res => res?.data ?? res)
    );
  }

  getHistory(id: number): Observable<AppointmentStatusHistory[]> {
    return this.http.get<any>(`${this.base}/appointment/${id}/history`).pipe(
      map(res => (Array.isArray(res) ? res : res?.data ?? []))
    );
  }

  getStatuses(): Observable<AppointmentStatus[]> {
    return this.http.get<any>(`${this.base}/appointmentStatus`).pipe(
      map(res => (Array.isArray(res) ? res : res?.data ?? []))
    );
  }

  getUsers(): Observable<AppUser[]> {
    return this.http.get<any>(`${this.base}/user`).pipe(
      map(res => (Array.isArray(res) ? res : res?.data ?? []))
    );
  }
}
