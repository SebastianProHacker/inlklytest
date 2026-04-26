import { Component, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { CatalogService } from '../../../../core/services/catalog.service';
import { TattooSize } from '../../../../core/models/catalog.model';

@Component({
  selector: 'app-tattoo-size-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicModalComponent, ActionButtonComponent],
  template: `
    <app-dynamic-modal [data]="{ title: isEdit ? 'Edit Size' : 'New Size' }">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="field">
          <label>Name</label>
          <input formControlName="name" placeholder="e.g. Small" />
          <span class="field-error" *ngIf="form.get('name')?.touched && form.get('name')?.hasError('required')">Name is required.</span>
        </div>
        <div class="row">
          <div class="field">
            <label>Min (cm)</label>
            <input type="number" formControlName="sizeCmMin" placeholder="0" />
          </div>
          <div class="field">
            <label>Max (cm)</label>
            <input type="number" formControlName="sizeCmMax" placeholder="10" />
          </div>
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
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-error { padding: 8px 12px; background: var(--status-cancelled-bg); color: var(--status-cancelled-text); border-radius: var(--radius-md); font-size: 13px; margin-bottom: 12px; }
    .form-actions { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 8px; }
    .right-actions { display: flex; gap: 8px; margin-left: auto; }
  `]
})
export class TattooSizeFormComponent {
  form: FormGroup;
  isEdit: boolean;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    public dialogRef: DialogRef,
    private catalogService: CatalogService,
    @Optional() @Inject(DIALOG_DATA) public dialogData: { item?: TattooSize }
  ) {
    this.isEdit = !!dialogData.item?.id;
    this.form = this.fb.group({
      name: [dialogData.item?.name ?? '', Validators.required],
      sizeCmMin: [dialogData.item?.sizeCmMin ?? null],
      sizeCmMax: [dialogData.item?.sizeCmMax ?? null]
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: TattooSize = this.form.value;
    const obs = this.isEdit
      ? this.catalogService.updateSize(this.dialogData.item!.id!, payload)
      : this.catalogService.createSize(payload);

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
    this.catalogService.deleteSize(this.dialogData.item.id).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.errorMessage = 'Error deleting. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
