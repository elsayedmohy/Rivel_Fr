import { Routes } from '@angular/router';

export const CARRIER_ROUTES: Routes = [
  {
    path: '',
    title: 'Shipping routes',
    loadComponent: () =>
      import('./carrier-routes-page').then(
        (m) => m.CarrierRoutesPage,
      ),
  },
];
