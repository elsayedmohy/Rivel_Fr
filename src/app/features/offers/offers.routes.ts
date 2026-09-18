import type { Route } from '@angular/router';
import { OffersPage } from './offers-page';
import { roleGuard } from '../../core/guards/role.guard';

export default [
  { path: '', component: OffersPage, canActivate: [roleGuard('Carrier')] },
] satisfies Route[];