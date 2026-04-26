import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private clientUrl = `${environment.apiUrl}/client`;

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.clientUrl);
  }

  createClient(client: Client): Observable<any> {
    const { id, ...payload } = client;
    return this.http.post(this.clientUrl, payload);
  }

  updateClient(id: number, client: Client): Observable<any> {
    const { id: _id, ...payload } = client;
    return this.http.put(`${this.clientUrl}/${id}`, payload);
  }
}
