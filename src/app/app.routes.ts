import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./layout/app-shell/app-shell.routes').then((m) => m.appShellRoutes),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.default),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
