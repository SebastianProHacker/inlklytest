import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) localStorage.setItem('token', res.token);
      })
    );
  }

  register(userData: any): Observable<any> {
    // Ajustamos el objeto para que coincida con RegisterDto
    const payload = {
      full_name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || "0000000000", // Valor temporal si no hay campo en el form
      role_id: 1 // Por defecto 1 (ajustar según tus roles de BD)
    };
    return this.http.post(`${this.apiUrl}/Auth/register`, payload);
  }
}