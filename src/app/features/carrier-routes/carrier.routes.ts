import { Routes } from '@angular/router';

export const CARRIER_ROUTES: Routes = [
  {
    path: '',
    title: 'خطوط السير',
    loadComponent: () =>
      import('./carrier-routes-page').then(
        (m) => m.CarrierRoutesPage,
      ),
  },
];
