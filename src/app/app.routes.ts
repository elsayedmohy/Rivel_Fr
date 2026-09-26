import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'carriers/:id',
    loadComponent: () =>
      import('./features/carriers/carrier-profile-page').then((m) => m.CarrierProfilePage),
  },
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
