import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BasePrice,
  PricingRule,
  PricingConfiguration,
  StylePricing,
  BodyPartPricing
} from '../models/pricing.model';

@Injectable({ providedIn: 'root' })
export class PricingService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // BasePrice
  getBasePrices(): Observable<BasePrice[]> {
    return this.http.get<BasePrice[]>(`${this.api}/basePrice`);
  }
  createBasePrice(item: BasePrice): Observable<any> {
    const { id, tattooSize, ...payload } = item;
    return this.http.post(`${this.api}/basePrice`, payload);
  }
  updateBasePrice(id: number, item: BasePrice): Observable<any> {
    const { id: _id, tattooSize, ...payload } = item;
    return this.http.put(`${this.api}/basePrice/${id}`, payload);
  }
  deleteBasePrice(id: number): Observable<any> {
    return this.http.delete(`${this.api}/basePrice/${id}`);
  }

  // PricingRule
  getPricingRules(): Observable<PricingRule[]> {
    return this.http.get<PricingRule[]>(`${this.api}/pricingRule`);
  }
  createPricingRule(item: PricingRule): Observable<any> {
    const { id, ...payload } = item;
    return this.http.post(`${this.api}/pricingRule`, payload);
  }
  updatePricingRule(id: number, item: PricingRule): Observable<any> {
    const { id: _id, ...payload } = item;
    return this.http.put(`${this.api}/pricingRule/${id}`, payload);
  }
  deletePricingRule(id: number): Observable<any> {
    return this.http.delete(`${this.api}/pricingRule/${id}`);
  }

  // PricingConfiguration (singleton: hourly rate + session cost)
  getPricingConfiguration(): Observable<PricingConfiguration> {
    return this.http.get<PricingConfiguration>(`${this.api}/pricingConfiguration`);
  }
  updatePricingConfiguration(item: PricingConfiguration): Observable<any> {
    const payload = { hourlyRate: item.hourlyRate ?? null, sessionCost: item.sessionCost ?? null };
    return this.http.put(`${this.api}/pricingConfiguration`, payload);
  }

  // TattooStyle pricing modifiers
  updateStylePricing(item: StylePricing): Observable<any> {
    const payload = {
      name: item.name,
      priceModifier: item.priceModifier ?? null,
      priceMultiplier: item.priceMultiplier ?? null
    };
    return this.http.put(`${this.api}/tattooStyle/${item.id}`, payload);
  }

  // BodyPart pricing modifiers
  updateBodyPartPricing(item: BodyPartPricing): Observable<any> {
    const payload = {
      name: item.name,
      priceModifier: item.priceModifier ?? null,
      priceMultiplier: item.priceMultiplier ?? null
    };
    return this.http.put(`${this.api}/bodyPart/${item.id}`, payload);
  }
}
