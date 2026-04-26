import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let n of notifications"
        class="toast toast--{{ n.type }}"
        [class.toast--visible]="true"
        role="alert"
      >
        <span class="toast__icon">{{ icons[n.type] }}</span>
        <span class="toast__message">{{ n.message }}</span>
        <button class="toast__close" (click)="dismiss(n.id)" aria-label="Cerrar">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      max-width: 360px;
      width: 100%;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: var(--radius-md, 12px);
      box-shadow: var(--shadow-lg);
      font-size: 13px;
      font-family: inherit;
      pointer-events: all;
      animation: slideIn 0.25s ease forwards;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .toast--success {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      color: #166534;
    }

    .toast--error {
      background: #fff1f1;
      border-left: 4px solid #ef4444;
      color: #a30000;
    }

    .toast--warning {
      background: #fff9e6;
      border-left: 4px solid #f59e0b;
      color: #a38100;
    }

    .toast--info {
      background: var(--secondary-purple, #f0ecff);
      border-left: 4px solid var(--primary-purple, #6343d8);
      color: var(--primary-purple, #6343d8);
    }

    .toast__icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    .toast__message {
      flex: 1;
      line-height: 1.4;
    }

    .toast__close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 0 2px;
      opacity: 0.6;
      color: inherit;
      flex-shrink: 0;
    }

    .toast__close:hover {
      opacity: 1;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  icons: Record<string, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  private sub!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.sub = this.notificationService.notifications$.subscribe(
      n => (this.notifications = n)
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  dismiss(id: number) {
    this.notificationService.dismiss(id);
  }
}
