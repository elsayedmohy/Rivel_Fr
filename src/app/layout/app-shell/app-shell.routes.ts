import type { Route } from '@angular/router';
import { AppShell } from './app-shell';
import { authGuard } from '../../core/guards/auth.guard';

export const appShellRoutes: Route[] = [
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('../../features/dashboard/dashboard.routes').then((m) => m.default),
      },
      {
        path: 'requests',
        loadChildren: () =>
          import('../../features/requests/requests.routes').then((m) => m.default),
      },
      {
        path: 'offers',
        loadChildren: () => import('../../features/offers/offers.routes').then((m) => m.default),
      },
      {
        path: 'vessels',
        loadChildren: () => import('../../features/vessels/vessels.routes').then((m) => m.default),
      },
      {
        path: 'shipments',
        loadChildren: () =>
          import('../../features/shipments/shipments.routes').then((m) => m.default),
      },
      {
        path: 'ratings',
        loadChildren: () => import('../../features/ratings/ratings.routes').then((m) => m.default),
      },
      {
        path: 'routes',
        loadChildren: () =>
          import('../../features/carrier-routes/carrier.routes').then((m) => m.CARRIER_ROUTES),
      },
      {
        path: 'suggested',
        loadChildren: () =>
          import('../../features/suggested-requests/suggested-requests.routes').then(
            (m) => m.SUGGESTED_ROUTES,
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('../../features/settings/settings.routes').then((m) => m.default),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'profile', redirectTo: 'settings', pathMatch: 'full' },
    ],
  },
];
