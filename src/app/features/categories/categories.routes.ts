import { cambiosPendientesGuard } from '../../core/guards/cambios-pendientes.guard';
import type { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/categories-list/categories-list.component').then(
        (m) => m.CategoriesListComponent,
      ),
  },
  {
    path: 'create',
    canDeactivate: [cambiosPendientesGuard],
    loadComponent: () =>
      import('./components/categories-create/categories-create.component').then(
        (m) => m.CategoriesCreateComponent,
      ),
  },
  {
    path: ':id/edit',
    canDeactivate: [cambiosPendientesGuard],
    loadComponent: () =>
      import('./components/categories-edit/categories-edit.component').then(
        (m) => m.CategoriesEditComponent,
      ),
  },
];
