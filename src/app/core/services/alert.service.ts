import { inject, Injectable } from '@angular/core';
import { TuiNotificationService } from '@taiga-ui/core';

@Injectable({ providedIn: 'root' })
export class AlertService {
  protected readonly notifications = inject(TuiNotificationService);

  show(title: string, message: string) {
    this.notifications.open(title, { label: message }).subscribe();
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
