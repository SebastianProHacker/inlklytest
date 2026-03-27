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
    materialType?: MaterialType; // Para cuando el backend lo incluya
  }