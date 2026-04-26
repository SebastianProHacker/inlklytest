import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';
import { InventoryService } from '../../../../core/services/inventory.service';
import { Material } from '../../../../core/models/inventory.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-inventory-movement-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionButtonComponent, DynamicModalComponent],
  templateUrl: './inventory-movement-form.component.html',
  styleUrls: ['./inventory-movement-form.component.css']
})
export class InventoryMovementFormComponent implements OnInit {
  movementForm: FormGroup;
  materials: Material[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: DialogRef,
    private inventoryService: InventoryService,
    private notifications: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.movementForm = this.fb.group({
      materialId: [null, Validators.required],
      movementType: ['entrada', Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
      referenceType: ['manual']
    });
  }

  ngOnInit() {
    this.inventoryService.getMaterials().subscribe({
      next: (data) => { this.materials = data; this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  onSubmit() {
    if (this.movementForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const payload = {
      materialId: Number(this.movementForm.value.materialId),
      movementType: this.movementForm.value.movementType,
      quantity: Number(this.movementForm.value.quantity),
      referenceType: this.movementForm.value.referenceType || 'manual'
    };

    this.inventoryService.addInventoryMovement(payload).subscribe({
      next: () => {
        this.notifications.success('Movimiento registrado correctamente.');
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
