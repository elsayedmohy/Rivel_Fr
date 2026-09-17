import { computed, inject, Injectable, signal } from '@angular/core';
import { TUI_DARK_MODE } from '@taiga-ui/core';
import { APP_CONFIG } from './app-config';
import type { Theme } from '../../models/enums';

/**
 * Wraps the Taiga `TUI_DARK_MODE` token to expose a light/dark/system toggle.
 *
 * `TUI_DARK_MODE` is a writable signal backed by localStorage (`tuiDark`):
 * - `.set(true | false)` pins the theme and persists it.
 * - `.reset()` clears the pin and follows `prefers-color-scheme`.
 *
 * The three-state theme (`system` un-pinned, `light`/`dark` pinned) mirrors
 * exactly what the token supports, so no extra state is kept.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly darkMode = inject(TUI_DARK_MODE);
  private readonly config = inject(APP_CONFIG);
  private readonly theme = signal<Theme>(this.readInitial());
  readonly current = this.theme.asReadonly();
  readonly isDark = computed(() => this.darkMode());

  private readonly media = typeof window === 'undefined'
    ? null
    : window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.sync();
    this.media?.addEventListener('change', () => {
      if (this.theme() === 'system') {
        this.sync();
      }
    });
  }

  initialize(): void {}

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.sync();
  }

  private sync(): void {
    const theme = this.theme();
    if (theme === 'system') {
      this.darkMode.reset();
    } else {
      this.darkMode.set(theme === 'dark');
    }
  }

  private readInitial(): Theme {
    const stored = localStorage.getItem(this.config.themeStorageKey);
    if (stored === 'true') {
      return 'dark';
    }
    if (stored === 'false') {
      return 'light';
    }
    return 'system';
  }
}