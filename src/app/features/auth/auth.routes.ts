import { Routes } from '@angular/router';

import { noAuthGuard } from '../../core/guards';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
