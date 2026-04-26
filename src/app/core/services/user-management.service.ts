import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ManagedUser, Role } from '../models/user-management.model';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Users
  getUsers(): Observable<ManagedUser[]> {
    return this.http.get<ManagedUser[]>(`${this.api}/user`);
  }
  createUser(item: ManagedUser): Observable<any> {
    const { id, role, ...payload } = item;
    return this.http.post(`${this.api}/user`, payload);
  }
  updateUser(id: number, item: ManagedUser): Observable<any> {
    const { id: _id, role, ...payload } = item;
    return this.http.put(`${this.api}/user/${id}`, payload);
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.api}/user/${id}`);
  }

  // Roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.api}/role`);
  }
}
