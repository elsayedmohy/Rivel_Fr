import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';

import { appConfig } from '../config/app-config';
import { AlertService } from './alert.service';

export enum NotificationType {
  OfferReceived = 0,
  OfferAccepted = 1,
  OfferRejected = 2,
  OfferWithdrawn = 3,
  RequestMatched = 4,
  RequestExpired = 5,
  ShipmentStatusChanged = 6,
  ShipmentCancelled = 7,
  RatingReceived = 8,
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  entityId: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPage {
  items: AppNotification[];
  unreadCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly alert = inject(AlertService);
  private readonly base = `${appConfig.apiBaseUrl}/notifications`;

  private hub?: signalR.HubConnection;

  readonly notifications = signal<AppNotification[]>([]);
  readonly unreadCount = signal(0);
  readonly loading = signal(false);
  readonly hasMore = signal(false);

  private page = 1;
  private loaded = false;

  connect(tokenFactory: () => string | null): void {
    if (this.hub) {
      return;
    }

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(`${appConfig.notificationBaseUrl}/hubs/notifications`, {
        accessTokenFactory: () => tokenFactory() ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.hub.on('notification', (n: AppNotification) => {
      this.notifications.update((list) => [n, ...list]);
      this.unreadCount.update((c) => c + 1);
      this.alert.show(this.textKeyFor(n), n.data);
    });

    this.hub.onreconnected(() => this.load(true));

    this.hub.start().catch((err) => console.error('SignalR failed', err));
  }

  disconnect(): void {
    this.hub?.stop();
    this.hub = undefined;

    this.notifications.set([]);
    this.unreadCount.set(0);
    this.page = 1;
    this.loaded = false;
    this.hasMore.set(false);
  }

  load(force = false): void {
    if (this.loading() || (this.loaded && !force)) {
      return;
    }

    this.loading.set(true);
    this.page = 1;

    this.http.get<NotificationPage>(`${this.base}?page=1&pageSize=${PAGE_SIZE}`).subscribe({
      next: (res) => {
        this.notifications.set(res.items);
        this.unreadCount.set(res.unreadCount);
        this.hasMore.set(res.hasMore);
        this.loading.set(false);
        this.loaded = true;
      },
      error: () => this.loading.set(false),
    });
  }

  loadMore(): void {
    if (this.loading() || !this.hasMore()) {
      return;
    }

    this.loading.set(true);
    const next = this.page + 1;

    this.http.get<NotificationPage>(`${this.base}?page=${next}&pageSize=${PAGE_SIZE}`).subscribe({
      next: (res) => {
        const known = new Set(this.notifications().map((n) => n.id));
        const fresh = res.items.filter((n) => !known.has(n.id));

        this.notifications.update((list) => [...list, ...fresh]);
        this.unreadCount.set(res.unreadCount);
        this.hasMore.set(res.hasMore);
        this.page = next;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  refreshUnreadCount(): void {
    this.http.get<number>(`${this.base}/unread-count`).subscribe({
      next: (count) => this.unreadCount.set(count),
      error: () => {},
    });
  }

  markRead(id: string): void {
    const target = this.notifications().find((n) => n.id === id);
    if (!target || target.isRead) {
      return;
    }

    this.notifications.update((list) =>
      list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    this.unreadCount.update((c) => Math.max(0, c - 1));

    this.http.post(`${this.base}/${id}/read`, {}).subscribe({
      error: () => this.refreshUnreadCount(), // فشل؟ هات الحقيقة من السيرفر
    });
  }

  markAllRead(): void {
    if (this.unreadCount() === 0) {
      return;
    }

    this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
    this.unreadCount.set(0);

    this.http.post(`${this.base}/read-all`, {}).subscribe({
      error: () => this.refreshUnreadCount(),
    });
  }

  private textKeyFor(n: AppNotification): string {
    return `notifications.type.${n.type}`;
  }
}
