import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'goal/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'profile/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'supports/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
