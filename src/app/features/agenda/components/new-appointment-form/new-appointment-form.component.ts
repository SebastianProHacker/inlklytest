// src/app/features/agenda/components/new-appointment-form/new-appointment-form.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';

@Component({
  selector: 'app-new-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionButtonComponent, DynamicModalComponent],
  template: `
    <app-dynamic-modal [data]="{ title: 'New Appointment' }">
      <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()" class="appointment-form">
        <div class="form-group">
          <label>Client</label>
          <input type="text" formControlName="client" placeholder="Client Name...">
        </div>
        <div class="form-group">
          <label>Category</label>
          <input type="text" formControlName="category" placeholder="Category...">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" formControlName="date">
          </div>
          <div class="form-group">
            <label>Time</label>
            <input type="time" formControlName="time">
          </div>
        </div>
        <footer class="form-actions">
          <app-action-button text="Cancel" variant="secondary" (click)="onCancel()"></app-action-button>
          <app-action-button text="Create" variant="primary" type="submit"></app-action-button>
        </footer>
      </form>
    </app-dynamic-modal>
  `,
  styleUrls: ['./new-appointment-form.component.css']
})
export class NewAppointmentFormComponent {
  appointmentForm: FormGroup;
  constructor(private fb: FormBuilder, private dialogRef: DialogRef) {
    this.appointmentForm = this.fb.group({
      client: ['', Validators.required],
      category: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required]
    });
  }
  onSubmit() { if (this.appointmentForm.valid) this.dialogRef.close(this.appointmentForm.value); }
  onCancel() { this.dialogRef.close(); }
}