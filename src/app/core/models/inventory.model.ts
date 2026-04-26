export interface MaterialType {
  id?: number;
  name: string;
}

export interface Material {
  id?: number;
  materialTypeId: number;
  name: string;
  unitCost: number;
  averageConsumption?: number;
  unitMeasure: string;
  isActive: boolean;
  materialType?: MaterialType;
  // Computed client-side from movements
  currentStock?: number;
  stockStatus?: 'ok' | 'low' | 'out';
}

export interface InventoryMovement {
  id?: number;
  materialId: number;
  movementType: string; // 'entrada' | 'salida'
  quantity: number;
  referenceType?: string;
  referenceId?: number;
  createdAt?: string;
  material?: Material;
}

export interface MonthlyMaterialUsage {
  id?: number;
  materialId: number;
  year: number;
  month: number;
  totalUsed?: number;
  material?: Material;
}