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
        <button type="button" class="eye-btn" (click)="toggleVisibility()">
          <span *ngIf="hidePassword">&#128065;</span> <span *ngIf="!hidePassword">&#128064;</span> </button>
      </div>
    </div>
  `,
  styles: [`
    /* ... estilos base similares a text-input ... */
    .input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; width: 100%; }
    label { font-size: 14px; font-weight: 500; color: var(--text-main); }
    .password-wrapper { position: relative; width: 100%; }
    input { width: 100%; padding: 12px 45px 12px 16px; border-radius: 30px; border: 1px solid #c7bfff; background-color: white; font-size: 14px; outline: none; box-sizing: border-box; }
    input:focus { border-color: var(--primary-purple); }
    .eye-btn { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 0; font-size: 18px; }
  `]
})
export class PasswordInputComponent {
  @Input({ required: true }) parentForm!: FormGroup;
  @Input({ required: true }) controlName!: string;
  @Input({ required: true }) label!: string;
  @Input() placeholder: string = '********';
  
  hidePassword = true;

  toggleVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}