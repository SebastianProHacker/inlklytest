import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Material, MaterialType, InventoryMovement, MonthlyMaterialUsage } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private materialUrl = `${environment.apiUrl}/Material`;
  private typeUrl = `${environment.apiUrl}/MaterialType`;
  private movementUrl = `${environment.apiUrl}/InventoryMovement`;
  private monthlyUsageUrl = `${environment.apiUrl}/MonthlyMaterialUsage`;

  constructor(private http: HttpClient) {}

  // --- Materiales ---
  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(this.materialUrl);
  }

  addMaterial(material: any): Observable<any> {
    const { id, currentStock, stockStatus, ...payload } = material;
    return this.http.post(this.materialUrl, payload);
  }

  // --- Tipos de Material ---
  getMaterialTypes(): Observable<MaterialType[]> {
    return this.http.get<MaterialType[]>(this.typeUrl);
  }

  addMaterialType(type: MaterialType): Observable<any> {
    return this.http.post(this.typeUrl, { Name: type.name });
  }

  // --- Movimientos de Inventario ---
  getInventoryMovements(): Observable<InventoryMovement[]> {
    return this.http.get<InventoryMovement[]>(this.movementUrl);
  }

  addInventoryMovement(movement: Omit<InventoryMovement, 'id' | 'material'>): Observable<any> {
    return this.http.post(this.movementUrl, movement);
  }

  // --- Uso Mensual de Materiales ---
  getMonthlyMaterialUsages(): Observable<MonthlyMaterialUsage[]> {
    return this.http.get<MonthlyMaterialUsage[]>(this.monthlyUsageUrl);
  }
}