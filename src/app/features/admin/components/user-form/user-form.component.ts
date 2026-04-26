import { ChangeDetectorRef, Component, Inject, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { UserManagementService } from '../../../../core/services/user-management.service';
import { ManagedUser, Role } from '../../../../core/models/user-management.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicModalComponent, ActionButtonComponent],
  template: `
    <app-dynamic-modal [data]="{ title: isEdit ? 'Edit User' : 'New User' }">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="field">
          <label>Full Name</label>
          <input formControlName="fullName" placeholder="Full name" />
          <span class="field-error" *ngIf="form.get('fullName')?.touched && form.get('fullName')?.hasError('required')">Name is required.</span>
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" formControlName="email" placeholder="email@example.com" />
          <span class="field-error" *ngIf="form.get('email')?.touched && form.get('email')?.hasError('email')">Enter a valid email.</span>
        </div>
        <div class="field">
          <label>Phone</label>
          <input formControlName="phone" placeholder="Phone number" />
        </div>
        <div class="field">
          <label>{{ isEdit ? 'New Password (leave blank to keep)' : 'Password' }}</label>
          <input type="password" formControlName="password" placeholder="Password" />
          <span class="field-error" *ngIf="!isEdit && form.get('password')?.touched && form.get('password')?.hasError('required')">Password is required.</span>
        </div>
        <div class="field">
          <label>Role</label>
          <select formControlName="roleId">
            <option value="" disabled>Select a role</option>
            <option *ngFor="let r of roles" [value]="r.id">{{ r.name }}</option>
          </select>
          <span class="field-error" *ngIf="form.get('roleId')?.touched && form.get('roleId')?.hasError('required')">Role is required.</span>
        </div>
        <div class="field toggle-field">
          <label>Active</label>
          <label class="toggle">
            <input type="checkbox" formControlName="isActive" />
            <span class="slider"></span>
          </label>
        </div>



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
export class UserFormComponent implements OnInit {
  form: FormGroup;
  isEdit: boolean;
  isSubmitting = false;
  roles: Role[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: DialogRef,
    private userService: UserManagementService,
    private notifications: NotificationService,
    private cdr: ChangeDetectorRef,
    @Optional() @Inject(DIALOG_DATA) public dialogData: { item?: ManagedUser }
  ) {
    this.isEdit = !!dialogData.item?.id;
    this.form = this.fb.group({
      fullName: [dialogData.item?.fullName ?? '', Validators.required],
      email: [dialogData.item?.email ?? '', Validators.email],
      phone: [dialogData.item?.phone ?? ''],
      password: [
        '',
        this.isEdit ? [] : [Validators.required]
      ],
      roleId: [dialogData.item?.roleId ?? '', Validators.required],
      isActive: [dialogData.item?.isActive ?? true]
    });
  }

  ngOnInit() {
    this.userService.getRoles().subscribe({
      next: (data) => { this.roles = data; this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting = true;

    const raw = this.form.value;
    const payload: ManagedUser = {
      ...raw,
      roleId: Number(raw.roleId)
    };

    // In edit mode, omit password if empty
    if (this.isEdit && !raw.password) {
      delete payload.password;
    }

    const obs = this.isEdit
      ? this.userService.updateUser(this.dialogData.item!.id!, payload)
      : this.userService.createUser(payload);

    obs.subscribe({
      next: () => {
        this.notifications.success(this.isEdit ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  onDelete() {
    if (!this.dialogData.item?.id) return;
    this.isSubmitting = true;
    this.userService.deleteUser(this.dialogData.item.id).subscribe({
      next: () => {
        this.notifications.success('Usuario eliminado.');
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
