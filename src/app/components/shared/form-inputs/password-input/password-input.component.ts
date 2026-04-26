// password-input.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="input-group" [formGroup]="parentForm">
      <label [for]="controlName">{{ label }}</label>
      <div class="password-wrapper">
        <input
          [id]="controlName"
          [type]="hidePassword ? 'password' : 'text'"
          [formControlName]="controlName"
          [placeholder]="placeholder">
        <button type="button" class="eye-btn" (click)="toggleVisibility()" [title]="hidePassword ? 'Show password' : 'Hide password'">
          <svg *ngIf="hidePassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <svg *ngIf="!hidePassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./password-input.component.css']
})
export class PasswordInputComponent {
  @Input({ required: true }) parentForm!: FormGroup;
  @Input({ required: true }) controlName!: string;
  @Input({ required: true }) label!: string;
  @Input() placeholder: string = '••••••••';

  hidePassword = true;

  toggleVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}