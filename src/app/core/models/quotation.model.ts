// Lookup entities
export interface TattooStyle {
  id: number;
  name: string;
  priceModifier?: number | null;
  priceMultiplier?: number | null;
}

export interface TattooTechnique {
  id: number;
  name: string;
}

export interface TattooSize {
  id: number;
  name: string;
  sizeCmMin?: number;
  sizeCmMax?: number;
}

export interface BodyPart {
  id: number;
  name: string;
  priceModifier?: number | null;
  priceMultiplier?: number | null;
}

export interface QuotationStatus {
  id: number;
  name: string;
}

// Core quotation (as returned by GET /api/quotation)
export interface Quotation {
  id?: number;
  clientId: number;
  receptionistId: number;
  statusId: number;
  estimatedTotalPrice?: number;
  createdAt?: string;
  confirmedAt?: string;
}

// Design analysis (as returned by GET /api/quotationDesignAnalysis)
export interface QuotationDesignAnalysis {
  id?: number;
  quotationId: number;
  tattooStyleId?: number;
  tattooTechniqueId?: number;
  tattooSizeId?: number;
  bodyPartId?: number;
  estimatedHours?: number;
  estimatedSessions?: number;
  designNotes?: string;
  manualAdjustment?: boolean;
}

// Quotation material (as returned by GET /api/quotationMaterial)
export interface QuotationMaterial {
  id?: number;
  quotationId: number;
  materialId: number;
  estimatedQuantity?: number;
  adjustedQuantity?: number;
}

// Create payloads
export interface CreateQuotationPayload {
  clientId: number;
  receptionistId: number;
  statusId: number;
  estimatedTotalPrice?: number;
}

export interface CreateDesignAnalysisPayload {
  quotationId: number;
  tattooStyleId?: number;
  tattooTechniqueId?: number;
  tattooSizeId?: number;
  bodyPartId?: number;
  estimatedHours?: number;
  estimatedSessions?: number;
  designNotes?: string;
  manualAdjustment?: boolean;
}

export interface CreateQuotationMaterialPayload {
  quotationId: number;
  materialId: number;
  estimatedQuantity?: number;
  adjustedQuantity?: number;
}

export interface UpdateQuotationPayload {
  clientId: number;
  receptionistId: number;
  statusId: number;
  estimatedTotalPrice?: number;
}
