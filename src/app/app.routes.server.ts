import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'auth/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  {
    path: 'notes/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'categories/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'files/**',
    renderMode: RenderMode.Client,
  },
  {
    // Raíz y cualquier otra ruta: Client para evitar que authGuard
    // falle en el servidor (sin localStorage) y genere bucles de redirección.
    path: '**',
    renderMode: RenderMode.Client,
  },
];
