import { Routes } from '@angular/router';

export const SUGGESTED_ROUTES: Routes = [
  {
    path: 'suggested-requests',
    title: 'Suggested Requests',
    loadComponent: () => import('./suggested-requests-page').then((m) => m.SuggestedRequestsPage),
  },
];
