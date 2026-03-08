import { Routes } from '@angular/router';

export const FILES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/files-manager/files-manager.component').then(
        (m) => m.FilesManagerComponent,
      ),
  },
];
