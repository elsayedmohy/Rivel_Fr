import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { LanguageService } from '../../core/config/language.service';
import { ThemeService } from '../../core/config/theme.service';
import { TokenService } from '../../core/http/token.service';
import type { AppLanguage, Theme } from '../../models/enums';

interface ChoiceOption<T extends string> {
  readonly value: T;
  readonly icon: string;
  readonly labelKey: string;
}

const THEME_OPTIONS: readonly ChoiceOption<Theme>[] = [
  { value: 'light', icon: '@tui.sun', labelKey: 'common.theme.light' },
  { value: 'dark', icon: '@tui.moon', labelKey: 'common.theme.dark' },
  { value: 'system', icon: '@tui.monitor', labelKey: 'common.theme.system' },
];

const LANGUAGE_OPTIONS: readonly ChoiceOption<AppLanguage>[] = [
  { value: 'en', icon: '@tui.globe', labelKey: 'settings.language.english' },
  { value: 'ar', icon: '@tui.globe', labelKey: 'settings.language.arabic' },
];

@Component({
  selector: 'rl-settings-page',
  imports: [TuiButton, TuiIcon, TranslatePipe],
  template: `
    <main class="rl-page">
      <header class="header">
        <div class="headings">
          <h1>{{ 'settings.title' | translate }}</h1>
          <p>{{ 'settings.description' | translate }}</p>
        </div>
      </header>

      @if (profile(); as profile) {
        <section class="card">
          <div class="card-head">
            <h2>{{ 'settings.profile.title' | translate }}</h2>
            <p>{{ 'settings.profile.subtitle' | translate }}</p>
          </div>

          <div class="profile">
            <div class="avatar">{{ profile.initials }}</div>
            <div class="profile-body">
              <p class="name">{{ profile.name }}</p>
              <p class="email">{{ profile.email }}</p>
              <p class="role">{{ profile.roleKey | translate }}</p>
              @if (profile.company) {
                <p class="company">
                  <tui-icon [icon]="'@tui.briefcase'" />
                  {{ profile.company }}
                </p>
              }
            </div>
          </div>
        </section>
      }

      <section class="card">
        <div class="card-head">
          <h2>{{ 'settings.appearance.title' | translate }}</h2>
          <p>{{ 'settings.appearance.subtitle' | translate }}</p>
        </div>

        <div class="options">
          @for (option of themeOptions; track option.value) {
            <button
              tuiButton
              type="button"
              appearance="flat"
              [iconStart]="option.icon"
              [class.active]="theme() === option.value"
              (click)="setTheme(option)"
            >
              {{ option.labelKey | translate }}
            </button>
          }
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <h2>{{ 'settings.language.title' | translate }}</h2>
          <p>{{ 'settings.language.subtitle' | translate }}</p>
        </div>

        <div class="options">
          @for (option of languageOptions; track option.value) {
            <button
              tuiButton
              type="button"
              appearance="flat"
              [iconStart]="option.icon"
              [class.active]="language() === option.value"
              (click)="setLanguage(option)"
            >
              {{ option.labelKey | translate }}
            </button>
          }
        </div>
      </section>
    </main>
  `,
  styles: `
    .page {
      display: flex;
      flex-direction: column;
      gap: var(--tui-padding-m);
      max-inline-size: 48rem;
      margin: 0 auto;
      padding: var(--tui-padding-l) var(--tui-padding-m);
    }

    .header {
      display: flex;
      margin-block-end: var(--tui-padding-m);
    }

    .headings h1 {
      font: var(--tui-font-heading-3);
      margin: 0;
    }

    .headings p {
      margin: 0.25rem 0 0;
      color: var(--tui-text-secondary);
    }

    .card {
      background: var(--tui-background-base);
      border: 1px solid var(--tui-border-normal);
      border-radius: var(--tui-radius-m);
      padding: var(--tui-padding-m);
    }

    .card-head h2 {
      font: var(--tui-font-heading-5);
      margin: 0;
    }

    .card-head p {
      margin: 0.25rem 0 0;
      color: var(--tui-text-secondary);
    }

    .profile {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-block-start: var(--tui-padding-m);
    }

    .avatar {
      display: grid;
      place-items: center;
      inline-size: 3rem;
      block-size: 3rem;
      border-radius: var(--tui-radius-m);
      background: var(--tui-background-accent-1);
      color: var(--tui-text-on-accent-1);
      font-weight: 600;
    }

    .profile-body .name {
      font-weight: 600;
      margin: 0;
    }

    .profile-body .email {
      margin: 0.125rem 0 0;
      color: var(--tui-text-secondary);
    }

    .profile-body .role,
    .profile-body .company {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      margin: 0.375rem 0 0;
      color: var(--tui-text-secondary);
    }

    .options {
      display: flex;
      flex-wrap: wrap;
      gap: var(--tui-padding-s);
      margin-block-start: var(--tui-padding-m);
    }

    .options [tuiButton].active {
      box-shadow: inset 0 0 0 1px var(--tui-border-focus);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);
  private readonly tokenService = inject(TokenService);

  readonly themeOptions = THEME_OPTIONS;
  readonly languageOptions = LANGUAGE_OPTIONS;
  readonly user = this.tokenService.userSignal;
  readonly theme = this.themeService.current;
  readonly language = this.languageService.current;

  readonly profile = computed(() => {
    const user = this.user();
    if (!user) return null;
    const name = user.name?.trim() || user.email;
    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
    const roleKey =
      user.role === 'Carrier' ? 'auth.register.role.carrier' : 'auth.register.role.cargoOwner';
    return {
      name,
      email: user.email,
      initials,
      roleKey,
      company: user.companyName?.trim() || null,
    };
  });

  setTheme(option: ChoiceOption<Theme>): void {
    this.themeService.setTheme(option.value);
  }

  setLanguage(option: ChoiceOption<AppLanguage>): void {
    this.languageService.setLanguage(option.value);
  }
}
