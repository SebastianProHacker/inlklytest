// src/app/shared/components/action-button/action-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="action-btn"
      [ngClass]="[variant, isLoading ? 'loading' : '']"
      [disabled]="disabled || isLoading"
      [attr.type]="type"
      (click)="onClick.emit()">
      <span *ngIf="isLoading" class="spinner"></span>
      <span class="btn-text">{{text}}</span>
    </button>
  `,
  styleUrls: ['./action-button.component.css']
})
export class ActionButtonComponent {
  @Input() text: string = '';
  @Input() icon: string = '';
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'secondary';
  @Input() disabled: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() onClick = new EventEmitter<void>();
}