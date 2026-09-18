import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';
import type { AppLanguage } from '../../models/enums';

export interface AppConfig {
  readonly apiBaseUrl: string;
  readonly production: boolean;
  readonly appName: string;
  readonly defaultLanguage: AppLanguage;
  readonly supportedLanguages: readonly AppLanguage[];
  readonly tokenStorageKey: string;
  readonly userStorageKey: string;
  readonly themeStorageKey: string;
  readonly knownUsersKey: string;
  readonly vesselsStorageKey: string;
}

export const appConfig: AppConfig = {
  ...environment,
  appName: 'Rivel',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ar'],
  tokenStorageKey: 'rl:access_token',
  userStorageKey: 'rl:user',
  themeStorageKey: 'tuiDark',
  knownUsersKey: 'rl:known_users',
  vesselsStorageKey: 'rl:vessels',
};

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  factory: () => appConfig,
});