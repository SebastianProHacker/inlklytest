import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog'; // Fundamental para el modal
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { ActionButtonComponent } from '../../components/shared/action-button/action-button.component';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';
import { TableColumn } from '../../components/interfaces/table-config.interface';
import { InventoryService } from '../../core/services/inventory.service';
import { Material } from '../../core/models/inventory.model';
import { NewMaterialFormComponent } from './components/new-material-form/new-material-form.component';

@Component({
  selector: 'app-warehouse',
  standalone: true,
  // Agregamos DialogModule y NewMaterialFormComponent a los imports
  imports: [
    CommonModule, 
    DataTableComponent, 
    ActionButtonComponent, 
    PaginationComponent, 
    DialogModule,
  ],
  template: `
    <div class="view-container">
      <div class="action-bar">
        <div class="left-actions">
          <app-action-button text="Sort"></app-action-button>
          <app-action-button text="Filter"></app-action-button>
        </div>
        <app-action-button 
          text="New Product" 
          variant="primary" 
          (click)="openNewMaterialModal()">
        </app-action-button>
      </div>

      <app-data-table 
        title="Inventory" 
        [columns]="columns" 
        [data]="materials">
      </app-data-table>

      <app-pagination></app-pagination>
    </div>
  `,
  styles: [`
    .view-container { padding: 20px 0; }
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .left-actions { display: flex; gap: 12px; }
  `]
})
export class WarehouseComponent implements OnInit {
  materials: Material[] = [];
  
  // Usamos la interfaz TableColumn que importaste
  columns: TableColumn[] = [
    { key: 'name', label: 'Material Name', type: 'text' },
    { key: 'unitMeasure', label: 'Unit', type: 'text' },
    { key: 'unitCost', label: 'Unit Cost', type: 'amount' },
    { key: 'isActive', label: 'Status', type: 'text' }
  ];

  constructor(
    private inventoryService: InventoryService, 
    private dialog: Dialog
  ) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  loadMaterials() {
    this.inventoryService.getMaterials().subscribe({
      next: (data) => {
        this.materials = data;
      },
      error: (err) => console.error('Error loading inventory', err)
    });
  }

  openNewMaterialModal() {
    const dialogRef = this.dialog.open(NewMaterialFormComponent, {
      width: '500px',
      // Mantenemos el objeto data por si el componente lo usa
      data: { title: 'Add New Material' }
    });

    dialogRef.closed.subscribe(result => {
      // Si el modal devolvió 'true' (éxito), recargamos la lista del back
      if (result) {
        this.loadMaterials();
      }
    });
  }
}