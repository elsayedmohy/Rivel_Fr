import type { Route } from '@angular/router';
import { LoginPage } from './login/login-page';
import { RegisterPage } from './register/register-page';
import { guestGuard } from '../../core/guards/guest.guard';

export default [
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: 'register', component: RegisterPage, canActivate: [guestGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
] satisfies Route[];