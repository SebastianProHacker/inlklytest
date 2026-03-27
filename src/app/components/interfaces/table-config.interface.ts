// src/app/shared/interfaces/table-config.interface.ts
export interface TableColumn {
    key: string;      // La propiedad del objeto de datos
    label: string;    // El texto de la cabecera
    type?: 'text' | 'amount' | 'date' | 'avatar-text' | 'status'; // Para formatear
  }