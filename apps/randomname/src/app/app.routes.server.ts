import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'goal/:id',
    renderMode: RenderMode.Ssr,
  },
  {
    path: 'profile/:id',
    renderMode: RenderMode.Ssr,
  },
  {
    path: 'supports/:id',
    renderMode: RenderMode.Ssr,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
