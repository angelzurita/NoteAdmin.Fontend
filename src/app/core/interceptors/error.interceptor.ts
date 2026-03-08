import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          authService.logout();
          break;
        case 403:
          router.navigate(['/dashboard']);
          break;
        case 404:
          console.error(`[API 404] Recurso no encontrado: ${req.url}`);
          break;
        case 500:
          console.error(`[API 500] Error interno del servidor: ${req.url}`);
          break;
        default:
          console.error(`[API ${error.status}] ${error.message}`);
      }

      return throwError(() => error);
    }),
  );
};
