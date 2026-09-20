import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { TuiButton, TuiDropdown, TuiIcon } from '@taiga-ui/core';
import { TuiBadgedContent, TuiBadgeNotification } from '@taiga-ui/kit';

import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    DatePipe,
    TuiDropdown,
    TuiButton,
    TuiBadgeNotification,
    TuiBadgedContent,
    TuiIcon,

  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl:'notifications.html',

  styleUrl:"notifications.scss",
})
export class NotificationsComponent {
  protected readonly notifService = inject(NotificationService);

  protected open = false;

  protected toggle(): void {
    this.open = !this.open;
  }

  protected markAllRead(): void {
    this.notifService.markAllRead();
  }
}
