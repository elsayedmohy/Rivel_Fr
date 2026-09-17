import type { Route } from '@angular/router';
import { RequestsPage } from './requests-page';

export default [
  { path: '', component: RequestsPage },
] satisfies Route[];