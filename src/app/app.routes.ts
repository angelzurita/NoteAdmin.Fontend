import { Routes } from '@angular/router';

import { authGuard } from './core/guards';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  // ── Public ──
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // ── Protected (layout wrapper) ──
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'notes',
        loadChildren: () =>
          import('./features/notes/notes.routes').then((m) => m.NOTES_ROUTES),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // ── Fallback ──
  { path: '**', redirectTo: 'dashboard' },
];
