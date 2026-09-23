import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TuiNotificationService } from '@taiga-ui/core';

@Injectable({ providedIn: 'root' })
export class AlertService {
  protected readonly notifications = inject(TuiNotificationService);
  private readonly translate = inject(TranslateService);

  show(title: string, message: Record<string, unknown>) {
    const label = Object.values(message ?? {})
      .map((value) => (value === null || value === undefined ? '' : String(value)))
      .filter(Boolean)
      .join(' · ');
    this.notifications.open(this.translate.instant(title), { label }).subscribe();
  }
  success(message: string): void {
    this.notifications
      .open(message, {
        appearance: 'positive',
      })
      .subscribe();
  }

  error(message: string): void {
    this.notifications
      .open(message, {
        appearance: 'negative',
      })
      .subscribe();
  }
}
