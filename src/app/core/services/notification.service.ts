import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private counter = 0;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  success(message: string, duration = 3500) {
    this.add('success', message, duration);
  }

  error(message: string, duration = 5000) {
    this.add('error', message, duration);
  }

  warning(message: string, duration = 4000) {
    this.add('warning', message, duration);
  }

  info(message: string, duration = 3500) {
    this.add('info', message, duration);
  }

  dismiss(id: number) {
    const current = this.notificationsSubject.getValue();
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }

  private add(type: NotificationType, message: string, duration: number) {
    const id = ++this.counter;
    const current = this.notificationsSubject.getValue();
    this.notificationsSubject.next([...current, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }
}
