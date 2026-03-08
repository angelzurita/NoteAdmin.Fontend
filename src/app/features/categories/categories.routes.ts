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
    loadComponent: () =>
      import('./components/categories-create/categories-create.component').then(
        (m) => m.CategoriesCreateComponent,
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/categories-edit/categories-edit.component').then(
        (m) => m.CategoriesEditComponent,
      ),
  },
];
