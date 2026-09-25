import type { Route } from '@angular/router';
import { LoginPage } from './login/login-page';
import { RegisterPage } from './register/register-page';
import { ForgotPasswordPage } from './forgot-password/forgot-password-page';
import { ResetPasswordPage } from './reset-password/reset-password-page';
import { ConfirmEmailPage } from './confirm-email/confirm-email-page';
import { guestGuard } from '../../core/guards/guest.guard';

export default [
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: 'register', component: RegisterPage, canActivate: [guestGuard] },
  { path: 'forgot-password', component: ForgotPasswordPage, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPasswordPage, canActivate: [guestGuard] },
  { path: 'confirm-email', component: ConfirmEmailPage },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
] satisfies Route[];