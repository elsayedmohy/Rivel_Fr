import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TuiButton } from '@taiga-ui/core';
import { PasswordCard } from './password-card';
import { ProfileCard } from './profile-card';
import { LanguageService } from '../../core/config/language.service';
import { ThemeService } from '../../core/config/theme.service';
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
  imports: [TuiButton, TranslatePipe, ProfileCard, PasswordCard],
  template: `
    <main class="rl-page">
      <header class="rl-page__heading">
        <div >
          <h1 class="rl-page__title">{{ 'settings.title' | translate }}</h1>
          <p class="rl-page__subtitle">{{ 'settings.description' | translate }}</p>
        </div>
      </header>

      <rl-profile-card />
      <rl-password-card />

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
    rl-profile-card,
    rl-password-card {
      display: block;
      margin-block-end: var(--tui-padding-m);
    }

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
      background: var(--tui-background-base);
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

  readonly themeOptions = THEME_OPTIONS;
  readonly languageOptions = LANGUAGE_OPTIONS;
  readonly theme = this.themeService.current;
  readonly language = this.languageService.current;

  setTheme(option: ChoiceOption<Theme>): void {
    this.themeService.setTheme(option.value);
  }

  setLanguage(option: ChoiceOption<AppLanguage>): void {
    this.languageService.setLanguage(option.value);
  }
}
