import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  TuiButton,
  TuiDataListComponent,
  TuiDropdownDirective, TuiDropdownOpen,
  TuiDropdownOptionsDirective,
  TuiIcon,
  TuiOption,
} from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../core/config/theme.service';
import { LanguageService } from '../../core/config/language.service';
import { TokenService } from '../../core/http/token.service';
import { AuthService } from '../../core/http/auth.service';
import { NotificationsComponent } from '../../shared/components/notifications/notifications';

@Component({
  selector: 'rl-topbar',
  imports: [
    RouterLink,
    TuiButton,
    TuiDropdownDirective,
    TuiDropdownOptionsDirective,
    TuiIcon,
    TuiAvatar,
    TuiDataListComponent,
    TuiOption,
    TranslatePipe,
    TuiDropdownOpen,
    NotificationsComponent,
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Topbar {
  readonly themeService = inject(ThemeService);
  readonly languageService = inject(LanguageService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly translate = inject(TranslateService);

  readonly user = this.tokenService.userSignal;
  readonly themeIcon = computed(() => (this.themeService.isDark() ? '@tui.sun' : '@tui.moon'));
  readonly displayName = computed(() => {
    const user = this.user();
    return user?.name?.trim() ? user.name : (user?.email ?? '');
  });
  readonly lightLabel = this.translate.translate('common.theme.light');
  readonly darkLabel = this.translate.translate('common.theme.dark');
  readonly systemLabel = this.translate.translate('common.theme.system');

  setLanguage(lang: 'en' | 'ar'): void {
    this.languageService.setLanguage(lang);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/auth/login']);
  }
}
