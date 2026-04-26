import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { ActionButtonComponent } from '../../components/shared/action-button/action-button.component';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';
import { TableColumn } from '../../components/interfaces/table-config.interface';
import { InventoryService } from '../../core/services/inventory.service';
import { Material, InventoryMovement, MonthlyMaterialUsage } from '../../core/models/inventory.model';
import { NewMaterialFormComponent } from './components/new-material-form/new-material-form.component';
import { InventoryMovementFormComponent } from './components/inventory-movement-form/inventory-movement-form.component';

type ActiveTab = 'inventory' | 'movements' | 'report';

@Component({
  selector: 'app-warehouse',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    ActionButtonComponent,
    PaginationComponent,
    DialogModule,
  ],
  template: `
    <div class="view-container">

      <!-- Tab bar -->
      <div class="tab-bar">
        <button class="tab-btn" [class.active]="activeTab === 'inventory'" (click)="setTab('inventory')">
          Inventory
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'movements'" (click)="setTab('movements')">
          Movements
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'report'" (click)="setTab('report')">
          Monthly Report
        </button>
      </div>

      <!-- ======== INVENTORY TAB ======== -->
      <ng-container *ngIf="activeTab === 'inventory'">
        <div class="action-bar">
          <div class="stock-legend">
            <span class="legend-item"><span class="stock-dot ok"></span> OK</span>
            <span class="legend-item"><span class="stock-dot low"></span> Low Stock</span>
            <span class="legend-item"><span class="stock-dot out"></span> Out of Stock</span>
          </div>
          <app-action-button text="New Product" variant="primary" (onClick)="openNewMaterialModal()">
          </app-action-button>
        </div>

        <div class="table-wrapper" *ngIf="!isLoading">
          <table class="custom-table" *ngIf="materials.length > 0; else emptyMaterials">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Material Name</th>
                <th>Category</th>
                <th>Qty. Actual</th>
                <th>Unit</th>
                <th>Unit Cost</th>
                <th>Avg. Consumption</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of pagedMaterials; let i = index" [class.even]="i % 2 !== 0">
                <td>
                  <span class="stock-dot" [ngClass]="m.stockStatus || 'ok'"></span>
                </td>
                <td>{{ m.name }}</td>
                <td>{{ m.materialType?.name || '—' }}</td>
                <td class="qty-cell">{{ m.currentStock ?? 0 }}</td>
                <td>{{ m.unitMeasure }}</td>
                <td>{{ m.unitCost | currency:'MXN':'symbol-narrow':'1.0-2' }} MXN</td>
                <td>{{ m.averageConsumption ?? '—' }}</td>
                <td>
                  <span class="status-badge" [ngClass]="m.isActive ? 'active' : 'inactive'">
                    {{ m.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #emptyMaterials>
            <div class="empty-state">No materials found.</div>
          </ng-template>
        </div>

        <div class="skeleton-placeholder" *ngIf="isLoading">Loading...</div>

        <app-pagination
          *ngIf="!isLoading && materials.length > 0"
          [totalPages]="totalPages"
          [currentPage]="currentPage"
          (pageChanged)="onPageChange($event)">
        </app-pagination>
      </ng-container>

      <!-- ======== MOVEMENTS TAB ======== -->
      <ng-container *ngIf="activeTab === 'movements'">
        <div class="action-bar">
          <span class="tab-hint">Track material entries and exits.</span>
          <app-action-button text="New Movement" variant="primary" (onClick)="openMovementModal()">
          </app-action-button>
        </div>

        <div class="table-wrapper" *ngIf="!isLoading">
          <table class="custom-table" *ngIf="movements.length > 0; else emptyMovements">
            <thead>
              <tr>
                <th>Type</th>
                <th>Material</th>
                <th>Quantity</th>
                <th>Reference</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let mv of movements; let i = index" [class.even]="i % 2 !== 0">
                <td>
                  <span class="movement-badge" [ngClass]="mv.movementType">
                    {{ mv.movementType === 'entrada' ? '▲ Entry' : '▼ Exit' }}
                  </span>
                </td>
                <td>{{ getMaterialName(mv.materialId) }}</td>
                <td>{{ mv.quantity }}</td>
                <td>{{ mv.referenceType || '—' }}</td>
                <td>{{ mv.createdAt ? (mv.createdAt | date:'dd/MM/yyyy HH:mm') : '—' }}</td>
              </tr>
            </tbody>
          </table>
          <ng-template #emptyMovements>
            <div class="empty-state">No movements registered yet.</div>
          </ng-template>
        </div>

        <div class="skeleton-placeholder" *ngIf="isLoading">Loading...</div>
      </ng-container>

      <!-- ======== MONTHLY REPORT TAB ======== -->
      <ng-container *ngIf="activeTab === 'report'">
        <div class="action-bar">
          <span class="tab-hint">Monthly material usage summary.</span>
        </div>

        <div class="table-wrapper" *ngIf="!isLoading">
          <table class="custom-table" *ngIf="monthlyUsages.length > 0; else emptyReport">
            <thead>
              <tr>
                <th>Material</th>
                <th>Year</th>
                <th>Month</th>
                <th>Total Used</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of monthlyUsages; let i = index" [class.even]="i % 2 !== 0">
                <td>{{ getMaterialName(u.materialId) }}</td>
                <td>{{ u.year }}</td>
                <td>{{ getMonthName(u.month) }}</td>
                <td>{{ u.totalUsed ?? '—' }}</td>
                <td>{{ getMaterialUnit(u.materialId) }}</td>
              </tr>
            </tbody>
          </table>
          <ng-template #emptyReport>
            <div class="empty-state">No monthly usage data available.</div>
          </ng-template>
        </div>

        <div class="skeleton-placeholder" *ngIf="isLoading">Loading...</div>
      </ng-container>

    </div>
  `,
  styles: [`
    .view-container { padding: 20px 0; }

    .tab-bar {
      display: flex;
      gap: 4px;
      margin-bottom: 20px;
      border-bottom: 2px solid var(--border-color);
    }

    .tab-btn {
      padding: 8px 20px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary, #888);
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
      font-family: inherit;
    }

    .tab-btn.active {
      color: var(--primary-purple, #5f55ee);
      border-bottom-color: var(--primary-purple, #5f55ee);
    }

    .tab-btn:hover:not(.active) { color: var(--text-main, #222); }

    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .stock-legend {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--text-secondary, #888);
      align-items: center;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .stock-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .stock-dot.ok  { background-color: #22c55e; }
    .stock-dot.low { background-color: #f59e0b; }
    .stock-dot.out { background-color: #ef4444; }

    .tab-hint {
      font-size: 13px;
      color: var(--text-secondary, #888);
    }

    .table-wrapper { overflow-x: auto; }

    .custom-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .custom-table th {
      text-align: left;
      padding: 10px 12px;
      font-weight: 600;
      color: var(--text-secondary, #888);
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      white-space: nowrap;
    }

    .custom-table td {
      padding: 10px 12px;
      color: var(--text-main, #111);
      border-bottom: 1px solid var(--border-color, #f3f4f6);
    }

    .custom-table tr.even td { background-color: var(--bg-subtle, #f9fafb); }

    .qty-cell {
      font-weight: 600;
      color: var(--text-main, #111);
    }

    .status-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.active   { background-color: #dcfce7; color: #16a34a; }
    .status-badge.inactive { background-color: #fee2e2; color: #dc2626; }

    .movement-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
    }

    .movement-badge.entrada { background-color: #dcfce7; color: #15803d; }
    .movement-badge.salida  { background-color: #fee2e2; color: #b91c1c; }

    .empty-state {
      padding: 40px;
      text-align: center;
      color: var(--text-secondary, #888);
      font-size: 14px;
    }

    .skeleton-placeholder {
      padding: 20px;
      text-align: center;
      color: var(--text-secondary, #888);
      font-size: 14px;
    }

  `]
})
export class WarehouseComponent implements OnInit {
  activeTab: ActiveTab = 'inventory';

  materials: Material[] = [];
  movements: InventoryMovement[] = [];
  monthlyUsages: MonthlyMaterialUsage[] = [];

  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  readonly pageSize = 10;

  private readonly MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(
    private inventoryService: InventoryService,
    private dialog: Dialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  setTab(tab: ActiveTab) {
    this.activeTab = tab;
  }

  loadAll() {
    this.isLoading = true;

    forkJoin({
      materials: this.inventoryService.getMaterials().pipe(catchError(() => of([]))),
      movements: this.inventoryService.getInventoryMovements().pipe(catchError(() => of([]))),
      monthly: this.inventoryService.getMonthlyMaterialUsages().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ materials, movements, monthly }) => {
        this.movements = movements;
        this.monthlyUsages = monthly;
        this.materials = this.computeStockStatuses(materials, movements);
        this.totalPages = Math.ceil(this.materials.length / this.pageSize) || 1;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private computeStockStatuses(materials: Material[], movements: InventoryMovement[]): Material[] {
    const stockMap = new Map<number, number>();

    for (const mv of movements) {
      const current = stockMap.get(mv.materialId) ?? 0;
      const delta = mv.movementType === 'entrada' ? mv.quantity : -mv.quantity;
      stockMap.set(mv.materialId, current + delta);
    }

    return materials.map(m => {
      const stock = stockMap.get(m.id!) ?? 0;
      const threshold = m.averageConsumption ?? 5;
      let stockStatus: 'ok' | 'low' | 'out' = 'ok';
      if (stock <= 0) stockStatus = 'out';
      else if (stock <= threshold) stockStatus = 'low';

      return { ...m, currentStock: stock, stockStatus };
    });
  }

  get pagedMaterials(): Material[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.materials.slice(start, start + this.pageSize);
  }

  openNewMaterialModal() {
    const ref = this.dialog.open(NewMaterialFormComponent, {
      width: '500px',
      data: { title: 'Add New Material' }
    });
    ref.closed.subscribe(result => { if (result) this.loadAll(); });
  }

  openMovementModal() {
    const ref = this.dialog.open(InventoryMovementFormComponent, {
      width: '480px',
      data: { title: 'Register Movement' }
    });
    ref.closed.subscribe(result => { if (result) this.loadAll(); });
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  getMaterialName(materialId: number): string {
    return this.materials.find(m => m.id === materialId)?.name ?? `Material #${materialId}`;
  }

  getMaterialUnit(materialId: number): string {
    return this.materials.find(m => m.id === materialId)?.unitMeasure ?? '—';
  }

  getMonthName(month: number): string {
    return this.MONTH_NAMES[month] ?? `Month ${month}`;
  }
}
