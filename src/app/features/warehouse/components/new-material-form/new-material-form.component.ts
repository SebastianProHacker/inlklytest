import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';
import { InventoryService } from '../../../../core/services/inventory.service';
import { MaterialType } from '../../../../core/models/inventory.model';

@Component({
  selector: 'app-new-material-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionButtonComponent, DynamicModalComponent],
  templateUrl: './new-material-form.component.html',
  styleUrls: ['./new-material-form.component.css']
})
export class NewMaterialFormComponent implements OnInit {
  materialForm: FormGroup;
  materialTypes: MaterialType[] = [];
  showNewTypeInput = false;

  constructor(
    private fb: FormBuilder, 
    private dialogRef: DialogRef,
    private inventoryService: InventoryService
  ) {
    this.materialForm = this.fb.group({
      name: ['', Validators.required],
      materialTypeId: [null, Validators.required],
      newTypeName: [''], // Campo extra por si crean uno nuevo
      unitCost: [0, [Validators.required, Validators.min(0)]],
      unitMeasure: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadTypes();
  }

  loadTypes() {
    this.inventoryService.getMaterialTypes().subscribe(types => {
      this.materialTypes = types;
    });
  }

  onTypeChange(event: any) {
    // Si seleccionan la opción de "Añadir nuevo", mostramos el input extra
    this.showNewTypeInput = event.target.value === 'new';
    if (this.showNewTypeInput) {
      this.materialForm.get('newTypeName')?.setValidators([Validators.required]);
    } else {
      this.materialForm.get('newTypeName')?.clearValidators();
    }
    this.materialForm.get('newTypeName')?.updateValueAndValidity();
  }

  async onSubmit() {
    if (this.materialForm.invalid) return;

    const formData = this.materialForm.value;

    // Lógica: Si es un tipo nuevo, primero lo creamos en el backend
  if (this.showNewTypeInput) {
    this.inventoryService.addMaterialType({ name: formData.newTypeName }).subscribe({
      next: (res: any) => {
        this.saveMaterial(res.data.id);
      },
      error: (err) => {
        console.error('Detalle del error:', err); // Mira esto en la consola F12
        alert(`Error: ${err.error?.message || err.statusText || 'Unknown error'}`);
      }
    });
  } else {
      this.saveMaterial(formData.materialTypeId);
    }
  }

  private saveMaterial(typeId: number) {
    const payload = {
      ...this.materialForm.value,
      materialTypeId: typeId
    };
    
    this.inventoryService.addMaterial(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => alert('Error saving material')
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}