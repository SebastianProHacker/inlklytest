export interface TattooStyle {
  id?: number;
  name: string;
  priceModifier?: number | null;
  priceMultiplier?: number | null;
}

export interface TattooTechnique {
  id?: number;
  name: string;
}

export interface TattooSize {
  id?: number;
  name?: string;
  sizeCmMin?: number;
  sizeCmMax?: number;
}

export interface BodyPart {
  id?: number;
  name?: string;
  priceModifier?: number | null;
  priceMultiplier?: number | null;
}

export interface MaterialType {
  id?: number;
  name: string;
}
