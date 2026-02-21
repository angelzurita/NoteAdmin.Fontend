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
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
