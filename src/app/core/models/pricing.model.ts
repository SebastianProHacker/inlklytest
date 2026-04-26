export interface BasePrice {
  id?: number;
  tattooSizeId: number;
  basePrice1?: number;
  tattooSize?: { id: number; name?: string };
}

export interface PricingRule {
  id?: number;
  ruleName?: string;
  multiplier?: number;
  isActive?: boolean;
}

export interface PricingConfiguration {
  id?: number;
  hourlyRate?: number | null;
  sessionCost?: number | null;
}

export interface StylePricing {
  id: number;
  name: string;
  priceModifier?: number | null;
  priceMultiplier?: number | null;
}

export interface BodyPartPricing {
  id: number;
  name: string;
  priceModifier?: number | null;
  priceMultiplier?: number | null;
}
