import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // With the lab account there is no local login page: go straight to it
  if (authService.usesLabAccount) {
    authService.signInWithLabAccount();
    return false;
  }

  return router.createUrlTree(['/auth/login']);
};
