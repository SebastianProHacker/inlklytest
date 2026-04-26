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
  styleUrls: ['./text-input.component.css']
})
export class TextInputComponent {
  @Input({ required: true }) parentForm!: FormGroup;
  @Input({ required: true }) controlName!: string;
  @Input({ required: true }) label!: string;
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'email' = 'text';
}