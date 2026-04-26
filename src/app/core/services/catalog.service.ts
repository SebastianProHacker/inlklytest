import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TattooStyle, TattooTechnique, TattooSize, BodyPart, MaterialType } from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // TattooStyle
  getStyles(): Observable<TattooStyle[]> {
    return this.http.get<TattooStyle[]>(`${this.api}/tattooStyle`);
  }
  createStyle(item: TattooStyle): Observable<any> {
    const { id, ...payload } = item;
    return this.http.post(`${this.api}/tattooStyle`, payload);
  }
  updateStyle(id: number, item: TattooStyle): Observable<any> {
    const { id: _id, ...payload } = item;
    return this.http.put(`${this.api}/tattooStyle/${id}`, payload);
  }
  deleteStyle(id: number): Observable<any> {
    return this.http.delete(`${this.api}/tattooStyle/${id}`);
  }

  // TattooTechnique
  getTechniques(): Observable<TattooTechnique[]> {
    return this.http.get<TattooTechnique[]>(`${this.api}/tattooTechnique`);
  }
  createTechnique(item: TattooTechnique): Observable<any> {
    const { id, ...payload } = item;
    return this.http.post(`${this.api}/tattooTechnique`, payload);
  }
  updateTechnique(id: number, item: TattooTechnique): Observable<any> {
    const { id: _id, ...payload } = item;
    return this.http.put(`${this.api}/tattooTechnique/${id}`, payload);
  }
  deleteTechnique(id: number): Observable<any> {
    return this.http.delete(`${this.api}/tattooTechnique/${id}`);
  }

  // TattooSize
  getSizes(): Observable<TattooSize[]> {
    return this.http.get<TattooSize[]>(`${this.api}/tattooSize`);
  }
  createSize(item: TattooSize): Observable<any> {
    const { id, ...payload } = item;
    return this.http.post(`${this.api}/tattooSize`, payload);
  }
  updateSize(id: number, item: TattooSize): Observable<any> {
    const { id: _id, ...payload } = item;
    return this.http.put(`${this.api}/tattooSize/${id}`, payload);
  }
  deleteSize(id: number): Observable<any> {
    return this.http.delete(`${this.api}/tattooSize/${id}`);
  }

  // BodyPart
  getBodyParts(): Observable<BodyPart[]> {
    return this.http.get<BodyPart[]>(`${this.api}/bodyPart`);
  }
  createBodyPart(item: BodyPart): Observable<any> {
    const { id, ...payload } = item;
    return this.http.post(`${this.api}/bodyPart`, payload);
  }
  updateBodyPart(id: number, item: BodyPart): Observable<any> {
    const { id: _id, ...payload } = item;
    return this.http.put(`${this.api}/bodyPart/${id}`, payload);
  }
  deleteBodyPart(id: number): Observable<any> {
    return this.http.delete(`${this.api}/bodyPart/${id}`);
  }

  // MaterialType
  getMaterialTypes(): Observable<MaterialType[]> {
    return this.http.get<MaterialType[]>(`${this.api}/materialType`);
  }
  createMaterialType(item: MaterialType): Observable<any> {
    const { id, ...payload } = item;
    return this.http.post(`${this.api}/materialType`, payload);
  }
  updateMaterialType(id: number, item: MaterialType): Observable<any> {
    const { id: _id, ...payload } = item;
    return this.http.put(`${this.api}/materialType/${id}`, payload);
  }
  deleteMaterialType(id: number): Observable<any> {
    return this.http.delete(`${this.api}/materialType/${id}`);
  }
}
