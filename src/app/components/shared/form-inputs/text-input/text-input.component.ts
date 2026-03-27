// text-input.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="input-group" [formGroup]="parentForm">
      <label [for]="controlName">{{ label }}</label>
      <input 
        [id]="controlName" 
        [type]="type" 
        [formControlName]="controlName" 
        [placeholder]="placeholder">
    </div>
  `,
  styles: [`
    .input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; width: 100%; }
    label { font-size: 14px; font-weight: 500; color: var(--text-main); }
    input { padding: 12px 16px; border-radius: 30px; border: 1px solid #c7bfff; /* Color borde lila */ background-color: white; font-size: 14px; outline: none; }
    input:focus { border-color: var(--primary-purple); }
  `]
})
export class TextInputComponent {
  @Input({ required: true }) parentForm!: FormGroup;
  @Input({ required: true }) controlName!: string;
  @Input({ required: true }) label!: string;
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'email' = 'text';
}