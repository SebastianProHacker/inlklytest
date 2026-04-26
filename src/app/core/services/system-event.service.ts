import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SystemEvent {
  id: number;
  eventType?: string;
  description?: string;
  userId?: number;
  createdAt?: string;
  user?: { id: number; fullName: string };
}

@Injectable({ providedIn: 'root' })
export class SystemEventService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSystemEvents(): Observable<SystemEvent[]> {
    return this.http.get<any>(`${this.base}/systemEvent`).pipe(
      map(res => (Array.isArray(res) ? res : res?.data ?? []))
    );
  }
}
