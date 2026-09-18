import type { Route } from '@angular/router';
import { RequestsPage } from './requests-page';
import { CreateRequestPage } from './create-request/create-request-page';
import { RequestDetailPage } from './request-detail/request-detail-page';
import { roleGuard } from '../../core/guards/role.guard';

export default [
  { path: '', component: RequestsPage },
  { path: 'new', component: CreateRequestPage, canActivate: [roleGuard('CargoOwner')] },
  { path: ':id', component: RequestDetailPage },
] satisfies Route[];