import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  redirectMessage: string | null = null;

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/login`, credentials).pipe(
      tap((res: any) => {
        // Backend returns { token: { user, jwt } }
        const jwt = res?.token?.jwt;
        if (jwt) localStorage.setItem('token', jwt);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    const payload = this.decodeToken();
    if (!payload) return false;
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      localStorage.removeItem('token');
      return false;
    }
    return true;
  }

  private decodeToken(): any | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  getCurrentUserId(): number | null {
    const payload = this.decodeToken();
    if (!payload) return null;
    // Support both short-form ("nameid") and full Microsoft URI claims,
    // since .NET emits short names by default but some configs map to URIs.
    const longClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
    const id = payload['nameid'] ?? payload['sub'] ?? payload[longClaim];
    return id != null ? Number(id) : null;
  }

  getCurrentUserRole(): string | null {
    const payload = this.decodeToken();
    if (!payload) return null;
    const longClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    return payload['role'] ?? payload[longClaim] ?? null;
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