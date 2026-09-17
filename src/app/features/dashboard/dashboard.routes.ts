import type { Route } from '@angular/router';
import { DashboardPage } from './dashboard';

export default [
  { path: '', component: DashboardPage },
] satisfies Route[];