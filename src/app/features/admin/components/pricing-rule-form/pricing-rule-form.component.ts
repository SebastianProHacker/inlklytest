import { Component, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { PricingService } from '../../../../core/services/pricing.service';
import { PricingRule } from '../../../../core/models/pricing.model';

@Component({
  selector: 'app-pricing-rule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicModalComponent, ActionButtonComponent],
  template: `
    <app-dynamic-modal [data]="{ title: isEdit ? 'Edit Pricing Rule' : 'New Pricing Rule' }">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="field">
          <label>Rule Name</label>
          <input formControlName="ruleName" placeholder="e.g. Weekend surcharge" />
          <span class="field-error" *ngIf="form.get('ruleName')?.touched && form.get('ruleName')?.hasError('required')">Name is required.</span>
        </div>
        <div class="field">
          <label>Multiplier</label>
          <input type="number" step="0.01" formControlName="multiplier" placeholder="1.00" />
          <span class="field-error" *ngIf="form.get('multiplier')?.touched && form.get('multiplier')?.hasError('required')">Multiplier is required.</span>
        </div>
        <div class="field toggle-field">
          <label>Active</label>
          <label class="toggle">
            <input type="checkbox" formControlName="isActive" />
            <span class="slider"></span>
          </label>
        </div>

        <div *ngIf="errorMessage" class="form-error">{{ errorMessage }}</div>

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
      color: var(--text-primary); font-size: 14px; font-family: inherit; width: 100%; box-sizing: border-box;
    }
    .field input:focus { outline: none; border-color: var(--accent-color); }
    .field-error { font-size: 12px; color: var(--status-cancelled-text); }
    .toggle-field { flex-direction: row; align-items: center; justify-content: space-between; }
    .toggle { position: relative; display: inline-block; width: 40px; height: 22px; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background: var(--border-color); border-radius: 22px; transition: .2s; }
    .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: .2s; }
    input:checked + .slider { background: var(--accent-color); }
    input:checked + .slider:before { transform: translateX(18px); }
    .form-error { padding: 8px 12px; background: var(--status-cancelled-bg); color: var(--status-cancelled-text); border-radius: var(--radius-md); font-size: 13px; margin-bottom: 12px; }
    .form-actions { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 8px; }
    .right-actions { display: flex; gap: 8px; margin-left: auto; }
  `]
})
export class PricingRuleFormComponent {
  form: FormGroup;
  isEdit: boolean;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    public dialogRef: DialogRef,
    private pricingService: PricingService,
    @Optional() @Inject(DIALOG_DATA) public dialogData: { item?: PricingRule }
  ) {
    this.isEdit = !!dialogData.item?.id;
    this.form = this.fb.group({
      ruleName: [dialogData.item?.ruleName ?? '', Validators.required],
      multiplier: [dialogData.item?.multiplier ?? null, Validators.required],
      isActive: [dialogData.item?.isActive ?? true]
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: PricingRule = this.form.value;
    const obs = this.isEdit
      ? this.pricingService.updatePricingRule(this.dialogData.item!.id!, payload)
      : this.pricingService.createPricingRule(payload);

    obs.subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.errorMessage = 'Error saving. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onDelete() {
    if (!this.dialogData.item?.id) return;
    this.isSubmitting = true;
    this.pricingService.deletePricingRule(this.dialogData.item.id).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.errorMessage = 'Error deleting. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
