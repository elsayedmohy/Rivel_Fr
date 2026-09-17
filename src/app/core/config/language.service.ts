import { effect, inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from './app-config';
import type { AppLanguage } from '../../models/enums';

const LANG_KEY = 'rl:lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly title = inject(Title);
  private readonly config = inject(APP_CONFIG);
  private readonly lang = signal<AppLanguage>(this.readInitial());

  constructor() {
    this.translate.use(this.lang());
    this.applyDocument();

    effect(() => {
      this.title.setTitle(this.translate.translate('app.name')());
    });
  }

  initialize(): void {}

  readonly current = this.lang.asReadonly();

  setLanguage(lang: AppLanguage): void {
    this.lang.set(lang);
    this.translate.use(lang);
    localStorage.setItem(LANG_KEY, lang);
    this.applyDocument();
  }

  private applyDocument(): void {
    const lang = this.lang();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  private readInitial(): AppLanguage {
    const stored = typeof localStorage === 'undefined' ? null : localStorage.getItem(LANG_KEY);
    const valid = stored === 'ar' || stored === 'en';
    return valid ? (stored as AppLanguage) : this.config.defaultLanguage;
  }
}