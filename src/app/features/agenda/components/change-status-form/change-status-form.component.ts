import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { InventoryService } from '../../../../core/services/inventory.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentStatus } from '../../../../core/models/appointment.model';
import { Material } from '../../../../core/models/inventory.model';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-change-status-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionButtonComponent, DynamicModalComponent],
  template: `
    <app-dynamic-modal [data]="{ title: 'Cambiar Estado de Cita' }">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="change-status-form">

        <div class="form-group">
          <label>Nuevo Estado *</label>
          <select formControlName="statusId" (change)="onStatusChange()">
            <option value="">Seleccionar estado...</option>
            <option *ngFor="let s of statuses" [value]="s.id">{{ s.name }}</option>
          </select>
        </div>

        <!-- Consumo de materiales (solo si es estado "completada") -->
        <div *ngIf="isCompleted" class="materials-section">
          <h4 class="section-title">Consumo de Materiales</h4>
          <p class="section-hint">Registra las cantidades reales utilizadas en esta sesión.</p>

          <div formArrayName="consumptions">
            <div *ngFor="let row of consumptionRows.controls; let i = index"
                 [formGroupName]="i"
                 class="material-row">
              <span class="material-name">{{ rowMaterial(i)?.name }}</span>
              <span class="material-unit">{{ rowMaterial(i)?.unitMeasure }}</span>
              <input
                type="number"
                formControlName="quantityUsed"
                placeholder="0"
                min="0"
                step="0.01"
                class="qty-input">
              <button
                type="button"
                class="remove-btn"
                (click)="removeMaterialRow(i)"
                title="Quitar material">
                ×
              </button>
            </div>
          </div>

          <div class="add-material-row" *ngIf="availableMaterials().length > 0">
            <select
              class="add-select"
              [value]="pendingAddId"
              (change)="pendingAddId = $any($event.target).value">
              <option value="">+ Agregar otro material...</option>
              <option *ngFor="let m of availableMaterials()" [value]="m.id">
                {{ m.name }} ({{ m.unitMeasure }}){{ !m.isActive ? ' — inactivo' : '' }}
              </option>
            </select>
            <button
              type="button"
              class="add-btn"
              (click)="addMaterialRow(pendingAddId); pendingAddId = ''"
              [disabled]="!pendingAddId">
              Agregar
            </button>
          </div>
        </div>

        <div *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <footer class="form-actions">
          <app-action-button text="Cancelar" variant="secondary" (click)="onCancel()"></app-action-button>
          <app-action-button
            text="Confirmar"
            variant="primary"
            type="submit"
            [disabled]="form.invalid || isSubmitting">
          </app-action-button>
        </footer>
      </form>
    </app-dynamic-modal>
  `,
  styles: [`
    .change-status-form { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 14px; font-weight: 500; color: var(--text-main); }
    .form-group select {
      padding: 10px 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      font-size: 14px;
      background: var(--bg-surface, #fff);
      color: var(--text-main);
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;
      cursor: pointer;
    }
    .form-group select:focus { outline: none; border-color: var(--primary-purple); }
    .materials-section { border-top: 1px solid var(--border-color, #eee); padding-top: 14px; }
    .section-title { font-size: 13px; font-weight: 600; margin: 0 0 4px; }
    .section-hint { font-size: 12px; color: var(--text-muted, #888); margin: 0 0 12px; }
    .material-row { display: grid; grid-template-columns: 1fr 60px 100px 28px; gap: 10px; align-items: center; padding: 6px 0; border-bottom: 1px dashed var(--border-color, #eee); }
    .material-name { font-size: 14px; }
    .material-unit { font-size: 12px; color: var(--text-muted, #888); }
    .qty-input { padding: 7px 10px; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-size: 14px; width: 100%; box-sizing: border-box; }
    .qty-input:focus { outline: none; border-color: var(--primary-purple); }
    .remove-btn { width: 24px; height: 24px; border-radius: 50%; border: none; background: transparent; color: var(--text-muted, #888); font-size: 18px; line-height: 1; cursor: pointer; padding: 0; }
    .remove-btn:hover { background: #ffeaea; color: #e53935; }
    .add-material-row { display: flex; gap: 8px; align-items: center; margin-top: 12px; padding-top: 10px; }
    .add-select { flex: 1; padding: 8px 10px; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-size: 13px; background: var(--bg-surface, #fff); color: var(--text-main); cursor: pointer; }
    .add-select:focus { outline: none; border-color: var(--primary-purple); }
    .add-btn { padding: 8px 14px; border-radius: var(--radius-md); border: 1px solid var(--primary-purple, #6e48aa); background: var(--primary-purple, #6e48aa); color: #fff; font-size: 13px; cursor: pointer; }
    .add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .error-msg { font-size: 13px; color: #e53935; background: #ffeaea; padding: 8px 12px; border-radius: var(--radius-md); }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid var(--border-color, #eee); }
  `]
})
export class ChangeStatusFormComponent implements OnInit {
  form: FormGroup;
  statuses: AppointmentStatus[] = [];
  materials: Material[] = [];
  isSubmitting = false;
  errorMsg = '';
  pendingAddId = '';

  get isCompleted(): boolean {
    const selected = this.statuses.find(s => s.id === Number(this.form.value.statusId));
    return !!selected && /complet/i.test(selected.name);
  }

  get consumptionRows(): FormArray {
    return this.form.get('consumptions') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: { appointmentId: number },
    private appointmentService: AppointmentService,
    private inventoryService: InventoryService,
    private authService: AuthService,
    private notifications: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      statusId: ['', Validators.required],
      consumptions: this.fb.array([])
    });
  }

  ngOnInit() {
    forkJoin({
      statuses: this.appointmentService.getStatuses(),
      materials: this.inventoryService.getMaterials()
    }).subscribe(({ statuses, materials }) => {
      this.statuses = statuses;
      this.materials = materials;
      this.buildConsumptionRows();
      this.cdr.markForCheck();
    });
  }

  buildConsumptionRows() {
    const array = this.form.get('consumptions') as FormArray;
    array.clear();
    this.materials.filter(m => m.isActive).forEach(m => {
      array.push(this.fb.group({
        materialId: [m.id],
        quantityUsed: [0, [Validators.min(0)]]
      }));
    });
  }

  rowMaterial(index: number): Material | undefined {
    const id = Number(this.consumptionRows.at(index)?.value?.materialId);
    return this.materials.find(m => m.id === id);
  }

  availableMaterials(): Material[] {
    const usedIds = new Set(
      this.consumptionRows.controls.map(c => Number(c.value.materialId))
    );
    return this.materials.filter(m => m.id != null && !usedIds.has(Number(m.id)));
  }

  addMaterialRow(materialIdRaw: string | number) {
    const id = Number(materialIdRaw);
    if (!id) return;
    if (this.consumptionRows.controls.some(c => Number(c.value.materialId) === id)) return;
    this.consumptionRows.push(this.fb.group({
      materialId: [id],
      quantityUsed: [0, [Validators.min(0)]]
    }));
    this.cdr.markForCheck();
  }

  removeMaterialRow(index: number) {
    this.consumptionRows.removeAt(index);
    this.cdr.markForCheck();
  }

  onStatusChange() {
    // Trigger re-evaluation of isCompleted
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isSubmitting = true;
    this.errorMsg = '';

    const userId = this.authService.getCurrentUserId();
    const consumptions: { materialId: number; quantityUsed: number }[] = this.isCompleted
      ? (this.form.value.consumptions as any[]).filter(c => c.quantityUsed > 0).map(c => ({
          materialId: c.materialId,
          quantityUsed: c.quantityUsed
        }))
      : [];

    const payload: any = {
      statusId: Number(this.form.value.statusId),
      changedBy: userId,
      ...(consumptions.length ? { materialConsumptions: consumptions } : {})
    };

    this.appointmentService.changeStatus(this.data.appointmentId, payload).pipe(
      switchMap(updated => {
        if (!consumptions.length) return of({ updated, movements: [] });
        const movementCalls = consumptions.map(c =>
          this.inventoryService.addInventoryMovement({
            materialId: c.materialId,
            movementType: 'salida',
            quantity: c.quantityUsed,
            referenceType: 'appointment',
            referenceId: this.data.appointmentId,
          }).pipe(catchError(() => of(null)))
        );
        return forkJoin(movementCalls).pipe(
          switchMap(movements => of({ updated, movements }))
        );
      })
    ).subscribe({
      next: ({ updated, movements }) => {
        this.isSubmitting = false;
        const moved = (movements as any[]).filter(Boolean).length;
        if (moved > 0) {
          this.notifications.success(`Estado actualizado. ${moved} material(es) descontado(s) del inventario.`);
        } else {
          this.notifications.success('Estado de la cita actualizado.');
        }
        this.dialogRef.close(updated);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMsg = 'Error al actualizar el estado. Intenta de nuevo.';
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
