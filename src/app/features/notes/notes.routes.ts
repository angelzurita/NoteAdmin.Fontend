import { cambiosPendientesGuard } from '../../core/guards/cambios-pendientes.guard';
import { Routes } from '@angular/router';

export const NOTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/notes-list/notes-list.component').then((m) => m.NotesListComponent),
  },
  {
    path: 'create',
    canDeactivate: [cambiosPendientesGuard],
    loadComponent: () =>
      import('./components/notes-create/notes-create.component').then((m) => m.NotesCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/notes-detail/notes-detail.component').then((m) => m.NotesDetailComponent),
  },
  {
    path: ':id/edit',
    canDeactivate: [cambiosPendientesGuard],
    loadComponent: () =>
      import('./components/notes-edit/notes-edit.component').then((m) => m.NotesEditComponent),
  },
];
