import { ChangeDetectorRef, Component, Inject, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { PricingService } from '../../../../core/services/pricing.service';
import { CatalogService } from '../../../../core/services/catalog.service';
import { BasePrice } from '../../../../core/models/pricing.model';
import { TattooSize } from '../../../../core/models/catalog.model';

@Component({
  selector: 'app-base-price-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicModalComponent, ActionButtonComponent],
  template: `
    <app-dynamic-modal [data]="{ title: isEdit ? 'Edit Base Price' : 'New Base Price' }">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="field">
          <label>Tattoo Size</label>
          <select formControlName="tattooSizeId">
            <option value="" disabled>Select a size</option>
            <option *ngFor="let s of sizes" [value]="s.id">{{ s.name }}</option>
          </select>
          <span class="field-error" *ngIf="form.get('tattooSizeId')?.touched && form.get('tattooSizeId')?.hasError('required')">Size is required.</span>
        </div>
        <div class="field">
          <label>Base Price (MXN)</label>
          <input type="number" formControlName="basePrice1" placeholder="0.00" />
          <span class="field-error" *ngIf="form.get('basePrice1')?.touched && form.get('basePrice1')?.hasError('required')">Price is required.</span>
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
    .field input, .field select {
      padding: 8px 12px; border-radius: var(--radius-md);
      border: 1px solid var(--border-color); background: var(--bg-input);
      color: var(--text-primary); font-size: 14px; font-family: inherit; width: 100%; box-sizing: border-box;
    }
    .field input:focus, .field select:focus { outline: none; border-color: var(--accent-color); }
    .field-error { font-size: 12px; color: var(--status-cancelled-text); }
    .form-error { padding: 8px 12px; background: var(--status-cancelled-bg); color: var(--status-cancelled-text); border-radius: var(--radius-md); font-size: 13px; margin-bottom: 12px; }
    .form-actions { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 8px; }
    .right-actions { display: flex; gap: 8px; margin-left: auto; }
  `]
})
export class BasePriceFormComponent implements OnInit {
  form: FormGroup;
  isEdit: boolean;
  isSubmitting = false;
  errorMessage = '';
  sizes: TattooSize[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: DialogRef,
    private pricingService: PricingService,
    private catalogService: CatalogService,
    private cdr: ChangeDetectorRef,
    @Optional() @Inject(DIALOG_DATA) public dialogData: { item?: BasePrice }
  ) {
    this.isEdit = !!dialogData.item?.id;
    this.form = this.fb.group({
      tattooSizeId: [dialogData.item?.tattooSizeId ?? '', Validators.required],
      basePrice1: [dialogData.item?.basePrice1 ?? null, Validators.required]
    });
  }

  ngOnInit() {
    this.catalogService.getSizes().subscribe({
      next: (data) => { this.sizes = data; this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: BasePrice = { ...this.form.value, tattooSizeId: Number(this.form.value.tattooSizeId) };
    const obs = this.isEdit
      ? this.pricingService.updateBasePrice(this.dialogData.item!.id!, payload)
      : this.pricingService.createBasePrice(payload);

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
    this.pricingService.deleteBasePrice(this.dialogData.item.id).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.errorMessage = 'Error deleting. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
