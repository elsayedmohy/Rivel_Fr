import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TuiButton, TuiDropdown, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiBadgedContent, TuiBadgeNotification } from '@taiga-ui/kit';

import {
  AppNotification,
  NotificationService,
  NotificationType,
} from '../../../core/services/notification.service';

const META: Record<NotificationType, { icon: string; link: (id: string) => string[] }> = {
  [NotificationType.OfferReceived]: {
    icon: '@tui.inbox',
    link: (id) => ['/requests', id],
  },
  [NotificationType.OfferAccepted]: {
    icon: '@tui.circle-check',
    link: (id) => ['/shipments', id],
  },
  [NotificationType.OfferRejected]: {
    icon: '@tui.circle-x',
    link: () => ['/offers'],
  },
  [NotificationType.OfferWithdrawn]: {
    icon: '@tui.undo-2',
    link: (id) => ['/requests', id],
  },
  [NotificationType.RequestMatched]: {
    icon: '@tui.route',
    link: () => ['/carrier/suggested'],
  },
  [NotificationType.RequestExpired]: {
    icon: '@tui.clock-alert',
    link: (id) => ['/requests', id],
  },
  [NotificationType.ShipmentStatusChanged]: {
    icon: '@tui.ship',
    link: (id) => ['/shipments', id],
  },
  [NotificationType.ShipmentCancelled]: {
    icon: '@tui.ban',
    link: (id) => ['/shipments', id],
  },
  [NotificationType.RatingReceived]: {
    icon: '@tui.star',
    link: () => ['/ratings'],
  },
};

const FALLBACK = { icon: '@tui.bell', link: () => ['/'] };

const LOCALE = 'ar-EG-u-nu-latn';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T|$)/;

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

  protected readonly open = signal(false);

  protected toggle(): void {
    const next = !this.open();
    this.open.set(next);

    if (next) {
      this.notifService.load();
    }
  }

  protected iconFor(n: AppNotification): string {
    return (META[n.type] ?? FALLBACK).icon;
  }

  protected params(n: AppNotification): Record<string, unknown> {
    const out: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(n.data ?? {})) {
      if (typeof value === 'number') {
        out[key] = value.toLocaleString(LOCALE);
      } else if (typeof value === 'string' && ISO_DATE.test(value)) {
        const date = new Date(value);
        out[key] = Number.isNaN(date.getTime())
          ? value
          : date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
      } else {
        out[key] = value;
      }
    }

    return out;
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
