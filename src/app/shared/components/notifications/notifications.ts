import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TuiButton, TuiDropdown, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiBadgedContent, TuiBadgeNotification } from '@taiga-ui/kit';

import {
  AppNotification,
  NotificationService,
} from '../../../core/services/notification.service';
import { FALLBACK, LOCALE, META, NotificationType } from '../../../models/notifications';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    TranslatePipe,
    TuiDropdown,
    TuiButton,
    TuiIcon,
    TuiLoader,
    TuiBadgedContent,
    TuiBadgeNotification,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'notifications.html',
  styleUrl: 'notifications.scss',
})
export class NotificationsComponent {
  private readonly router = inject(Router);
  protected readonly notifService = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  protected readonly open = signal(false);

  protected toggle(event: any): void {
    const next = event;
    this.open.set(next);

    if (next) {
      this.notifService.load();
    }
  }

  protected notificationBody(n: AppNotification): string {
    return this.translate.instant(`notifications.type.${n.type}`, this.notifService.params(n));
  }

  protected timeAgo(iso: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) {
      return '';
    }

    const seconds = Math.round((then - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });

    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ['second', 60],
      ['minute', 60],
      ['hour', 24],
      ['day', 7],
      ['week', 4.35],
      ['month', 12],
    ];

    let value = seconds;
    for (const [unit, step] of units) {
      if (Math.abs(value) < step) {
        return rtf.format(Math.round(value), unit);
      }
      value /= step;
    }

    return rtf.format(Math.round(value), 'year');
  }

  protected activate(n: AppNotification): void {
    this.notifService.markRead(n.id);
    this.open.set(false);

    const meta = META[n.type] ?? FALLBACK;
    void this.router.navigate(meta.link(n.entityId));
  }

  protected markAllRead(): void {
    this.notifService.markAllRead();
  }

  protected loadMore(): void {
    this.notifService.loadMore();
  }
}
