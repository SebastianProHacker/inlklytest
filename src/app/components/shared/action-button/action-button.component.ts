// src/app/shared/components/action-button/action-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="action-btn" [class]="variant" (click)="onClick.emit()">
      {{text}}
    </button>
  `,
  styleUrls: ['./action-button.component.css']
})
export class ActionButtonComponent {
  @Input() text: string = '';
  @Input() icon: string = ''; // Entidad HTML o clase de icono
  @Input() variant: 'primary' | 'secondary' = 'secondary';
  @Output() onClick = new EventEmitter<void>();
}