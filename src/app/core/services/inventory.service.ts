import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Material, MaterialType } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private materialUrl = `${environment.apiUrl}/Material`;
  private typeUrl = `${environment.apiUrl}/MaterialType`;

  constructor(private http: HttpClient) {}

  // --- Métodos para Materiales ---
  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(this.materialUrl);
  }

  addMaterial(material: any): Observable<any> {
    const { id, ...materialWithoutId } = material; // Extraemos el ID para no mandarlo
    return this.http.post(this.materialUrl, materialWithoutId);
  }

  // --- Métodos para Tipos de Material ---
  getMaterialTypes(): Observable<MaterialType[]> {
    return this.http.get<MaterialType[]>(this.typeUrl);
  }

  addMaterialType(type: MaterialType): Observable<any> {
    return this.http.post(this.typeUrl, {Name: type.name});
  }
}