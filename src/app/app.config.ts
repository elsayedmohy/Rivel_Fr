import {
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  type ApplicationConfig,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTaiga, TUI_DARK_MODE_KEY } from '@taiga-ui/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { APP_CONFIG, appConfig as defaultAppConfig } from './core/config/app-config';
import { ThemeService } from './core/config/theme.service';
import { LanguageService } from './core/config/language.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { routes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';

registerLocaleData(localeAr);
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideTaiga(),
    { provide: APP_CONFIG, useValue: defaultAppConfig },
    { provide: TUI_DARK_MODE_KEY, useFactory: () => inject(APP_CONFIG).themeStorageKey },
    provideTranslateService({ fallbackLang: 'en', lang: 'en' }),
    provideTranslateHttpLoader({
      prefix: 'assets/i18n/',
      suffix: '.json',
    }),
    provideAppInitializer(() => {
      inject(ThemeService).initialize();
      inject(LanguageService).initialize();
    }),
  ],
};
