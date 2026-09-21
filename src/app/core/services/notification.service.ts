import { inject, Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { appConfig } from '../config/app-config';
import { AlertService } from './alert.service';

export interface AppNotification {
  id: string;
  message: string;
  title: string;
  isRead: boolean;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private hub!: signalR.HubConnection;
  private alert: AlertService = inject(AlertService);

  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);
  connect(token: string) {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(`${appConfig.notificationBaseUrl}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    this.hub.on('NewOffer', (data: { title: string; message: string }) => {
      this.addNotification(data.title, data.message);
      this.alert.show(data.message, data.title);
    });
    this.hub.on('OfferAccepted', (data: { title: string; message: string }) => {
      this.addNotification(data.title, data.message);
      this.alert.show(data.title, data.message);
    });

    this.hub.start().catch(console.error);
  }

  disconnect() {
    this.hub?.stop();
  }

  private addNotification(title: string, message: string) {
    const notif: AppNotification = {
      id: crypto.randomUUID(),
      message,
      title,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.update((n) => [notif, ...n]);
    this.unreadCount.update((c) => c + 1);
  }

  markAllRead() {
    this.notifications.update((n) => n.map((x) => ({ ...x, isRead: true })));
    this.unreadCount.set(0);
  }
}
