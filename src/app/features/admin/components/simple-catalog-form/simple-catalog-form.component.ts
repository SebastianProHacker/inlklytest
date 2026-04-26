import { Component, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { NotificationService } from '../../../../core/services/notification.service';

export interface SimpleCatalogDialogData {
  entityName: string;
  item?: { id?: number; name?: string; priceModifier?: number | null; priceMultiplier?: number | null };
  onSave: (payload: { name: string; priceModifier?: number | null; priceMultiplier?: number | null }) => any;
  onDelete?: (id: number) => any;
}

@Component({
  selector: 'app-simple-catalog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicModalComponent, ActionButtonComponent],
  template: `
    <app-dynamic-modal [data]="{ title: (isEdit ? 'Edit ' : 'New ') + dialogData.entityName }">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="field">
          <label>Name</label>
          <input formControlName="name" placeholder="Enter name" />
          <span class="field-error" *ngIf="form.get('name')?.touched && form.get('name')?.hasError('required')">Name is required.</span>
        </div>

        <ng-container *ngIf="hasPriceFields">
          <div class="fields-row">
            <div class="field">
              <label>Price Modifier</label>
              <input type="number" step="0.01" formControlName="priceModifier" placeholder="Fixed +/- amount (e.g. 50)" />
              <span class="field-hint">Cantidad fija sumada al precio base (puede ser negativa).</span>
            </div>
            <div class="field">
              <label>Price Multiplier</label>
              <input type="number" step="0.01" min="0" formControlName="priceMultiplier" placeholder="e.g. 1.5" />
              <span class="field-hint">Factor multiplicador del precio base. 1 = sin cambio, 1.5 = +50%.</span>
            </div>
          </div>
        </ng-container>

        <div class="form-actions">
          <app-action-button *ngIf="isEdit" text="Delete" variant="danger" [disabled]="isSubmitting" (onClick)="onDelete()"></app-action-button>
          <div class="right-actions">
            <app-action-button text="Cancel" variant="secondary" (onClick)="dialogRef.close()"></app-action-button>
            <app-action-button [text]="isEdit ? 'Save' : 'Create'" variant="primary" [disabled]="isSubmitting" (onClick)="onSubmit()"></app-action-button>
          </div>
        </div>
      </form>
    </app-dynamic-modal>
  `,
  styles: [`
    .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .field label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
    .field input {
      padding: 8px 12px; border-radius: var(--radius-md);
      border: 1px solid var(--border-color); background: var(--bg-input);
      color: var(--text-primary); font-size: 14px; font-family: inherit;
    }
    .field input:focus { outline: none; border-color: var(--accent-color); }
    .field-error { font-size: 12px; color: var(--status-cancelled-text); }
    .field-hint { font-size: 11px; color: var(--text-secondary); }
    .fields-row { display: flex; gap: 12px; }
    .fields-row .field { flex: 1; }
    .form-error { padding: 8px 12px; background: var(--status-cancelled-bg); color: var(--status-cancelled-text); border-radius: var(--radius-md); font-size: 13px; margin-bottom: 12px; }
    .form-actions { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 8px; }
    .right-actions { display: flex; gap: 8px; margin-left: auto; }
  `]
})
export class SimpleCatalogFormComponent {
  form: FormGroup;
  isEdit: boolean;
  isSubmitting = false;
  hasPriceFields: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: DialogRef,
    private notifications: NotificationService,
    @Optional() @Inject(DIALOG_DATA) public dialogData: SimpleCatalogDialogData
  ) {
    this.isEdit = !!dialogData.item?.id;
    const entity = dialogData.entityName?.toLowerCase() ?? '';
    this.hasPriceFields = entity.includes('style') || entity.includes('body');

    const group: Record<string, any> = {
      name: [dialogData.item?.name ?? '', Validators.required]
    };
    if (this.hasPriceFields) {
      group['priceModifier'] = [dialogData.item?.priceModifier ?? null];
      group['priceMultiplier'] = [dialogData.item?.priceMultiplier ?? null];
    }
    this.form = this.fb.group(group);
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting = true;

    const raw = this.form.value;
    const payload: any = { name: raw.name };
    if (this.hasPriceFields) {
      payload.priceModifier = raw.priceModifier === '' || raw.priceModifier == null ? null : Number(raw.priceModifier);
      payload.priceMultiplier = raw.priceMultiplier === '' || raw.priceMultiplier == null ? null : Number(raw.priceMultiplier);
    }

    this.dialogData.onSave(payload).subscribe({
      next: () => {
        this.notifications.success(this.isEdit ? `${this.dialogData.entityName} actualizado.` : `${this.dialogData.entityName} creado.`);
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  onDelete() {
    if (!this.dialogData.item?.id || !this.dialogData.onDelete) return;
    this.isSubmitting = true;
    this.dialogData.onDelete(this.dialogData.item.id).subscribe({
      next: () => {
        this.notifications.success(`${this.dialogData.entityName} eliminado.`);
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
