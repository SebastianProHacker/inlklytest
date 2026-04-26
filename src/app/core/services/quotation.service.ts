import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Quotation,
  QuotationDesignAnalysis,
  QuotationMaterial,
  QuotationStatus,
  TattooStyle,
  TattooTechnique,
  TattooSize,
  BodyPart,
  CreateQuotationPayload,
  CreateDesignAnalysisPayload,
  CreateQuotationMaterialPayload,
  UpdateQuotationPayload,
} from '../models/quotation.model';

@Injectable({ providedIn: 'root' })
export class QuotationService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Quotation ─────────────────────────────────────────────────────────────

  getQuotations(): Observable<Quotation[]> {
    return this.http.get<any>(this.base + '/quotation').pipe(
      map(res => (Array.isArray(res) ? res : res?.data ?? []))
    );
  }

  getQuotation(id: number): Observable<Quotation> {
    return this.http.get<any>(this.base + `/quotation/${id}`).pipe(
      map(res => res?.data ?? res)
    );
  }

  createQuotation(payload: CreateQuotationPayload): Observable<Quotation> {
    return this.http.post<any>(this.base + '/quotation', payload).pipe(
      map(res => res?.data ?? res)
    );
  }

  updateQuotation(id: number, payload: UpdateQuotationPayload): Observable<any> {
    return this.http.put(this.base + `/quotation/${id}`, payload);
  }

  // ── Design Analysis ───────────────────────────────────────────────────────

  createDesignAnalysis(payload: CreateDesignAnalysisPayload): Observable<QuotationDesignAnalysis> {
    return this.http.post<any>(this.base + '/quotationDesignAnalysis', payload).pipe(
      map(res => res?.data ?? res)
    );
  }

  getDesignAnalyses(): Observable<QuotationDesignAnalysis[]> {
    return this.http.get<any>(this.base + '/quotationDesignAnalysis').pipe(
      map(res => (Array.isArray(res) ? res : res?.data ?? []))
    );
  }

  // ── Materials ─────────────────────────────────────────────────────────────

  createQuotationMaterial(payload: CreateQuotationMaterialPayload): Observable<QuotationMaterial> {
    return this.http.post<any>(this.base + '/quotationMaterial', payload).pipe(
      map(res => res?.data ?? res)
    );
  }

  getQuotationMaterials(): Observable<QuotationMaterial[]> {
    return this.http.get<any>(this.base + '/quotationMaterial').pipe(
      map(res => (Array.isArray(res) ? res : res?.data ?? []))
    );
  }

  // ── Statuses ──────────────────────────────────────────────────────────────

  getStatuses(): Observable<QuotationStatus[]> {
    return this.http.get<any>(this.base + '/quotationStatus').pipe(
      map(res => (Array.isArray(res) ? res : res?.data ?? []))
    );
  }

  // ── Lookups ───────────────────────────────────────────────────────────────

  getTattooStyles(): Observable<TattooStyle[]> {
    return this.http.get<any>(this.base + '/tattooStyle').pipe(
      map(res => (Array.isArray(res) ? res : res?.data ?? []))
    );
  }

  getTattooTechniques(): Observable<TattooTechnique[]> {
    return this.http.get<any>(this.base + '/tattooTechnique').pipe(
      map(res => (Array.isArray(res) ? res : res?.data ?? []))
    );
  }

  getTattooSizes(): Observable<TattooSize[]> {
    return this.http.get<any>(this.base + '/tattooSize').pipe(
      map(res => (Array.isArray(res) ? res : res?.data ?? []))
    );
  }

  getBodyParts(): Observable<BodyPart[]> {
    return this.http.get<any>(this.base + '/bodyPart').pipe(
      map(res => (Array.isArray(res) ? res : res?.data ?? []))
    );
  }
}
