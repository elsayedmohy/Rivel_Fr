import type { Route } from '@angular/router';
import { VesselsPage } from './vessels-page';
import { roleGuard } from '../../core/guards/role.guard';

export default [
  { path: '', component: VesselsPage, canActivate: [roleGuard('Carrier')] },
] satisfies Route[];