import { Component, Inject, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';
import { ClientService } from '../../../../core/services/client.service';
import { Client } from '../../../../core/models/client.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionButtonComponent, DynamicModalComponent],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  private existingClients: Client[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: DialogRef,
    private clientService: ClientService,
    private notifications: NotificationService,
    @Optional() @Inject(DIALOG_DATA) public dialogData?: { client?: Client; existingClients?: Client[] }
  ) {
    const client = dialogData?.client;
    this.isEditMode = !!client;
    this.existingClients = dialogData?.existingClients ?? [];

    this.clientForm = this.fb.group({
      fullName: [client?.fullName ?? '', Validators.required],
      email: [
        client?.email ?? '',
        [Validators.required, Validators.email],
      ],
      phone: [client?.phone ?? ''],
      notes: [client?.notes ?? '']
    }, { validators: this.uniqueEmailValidator.bind(this) });
  }

  ngOnInit(): void {}

  private uniqueEmailValidator(group: AbstractControl): ValidationErrors | null {
    const email = group.get('email')?.value?.toLowerCase().trim();
    if (!email) return null;

    const editingId = this.dialogData?.client?.id;
    const duplicate = this.existingClients.some(
      c => c.email.toLowerCase().trim() === email && c.id !== editingId
    );
    return duplicate ? { duplicateEmail: true } : null;
  }

  get fullNameError() {
    const ctrl = this.clientForm.get('fullName');
    if (ctrl?.touched && ctrl.hasError('required')) return 'Name is required.';
    return null;
  }

  get emailErrors() {
    const ctrl = this.clientForm.get('email');
    if (!ctrl?.touched) return null;
    if (ctrl.hasError('required')) return 'Email is required.';
    if (ctrl.hasError('email')) return 'Enter a valid email address.';
    if (this.clientForm.hasError('duplicateEmail')) return 'This email is already registered.';
    return null;
  }

  onSubmit() {
    this.clientForm.markAllAsTouched();
    if (this.clientForm.invalid) return;

    this.isSubmitting = true;

    const payload: Client = this.clientForm.value;

    if (this.isEditMode && this.dialogData?.client?.id != null) {
      this.clientService.updateClient(this.dialogData.client.id, payload).subscribe({
        next: () => {
          this.notifications.success('Cliente actualizado correctamente.');
          this.dialogRef.close(true);
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.clientService.createClient(payload).subscribe({
        next: () => {
          this.notifications.success('Cliente creado correctamente.');
          this.dialogRef.close(true);
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
