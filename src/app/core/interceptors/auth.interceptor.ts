import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  0:   'No se pudo conectar al servidor. Verifica tu conexión.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso solicitado no fue encontrado.',
  500: 'Error interno del servidor. Intenta nuevamente.',
  503: 'Servicio no disponible. Intenta más tarde.',
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);
  const authService = inject(AuthService);
  const notifications = inject(NotificationService);

  const cloned = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        authService.redirectMessage = 'Your session has expired. Please sign in again.';
        router.navigate(['/login']);
      } else {
        const message = HTTP_ERROR_MESSAGES[error.status]
          ?? `Error inesperado (${error.status}). Intenta nuevamente.`;
        notifications.error(message);
      }
      return throwError(() => error);
    })
  );
};