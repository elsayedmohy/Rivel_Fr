import { inject, Injectable } from '@angular/core';
import { TuiNotificationService } from '@taiga-ui/core';

@Injectable({ providedIn: 'root' })
export class PopoverNotificationService {
  protected readonly popOverNotifications = inject(TuiNotificationService);

  protected readonly popOverNotification = this.popOverNotifications
  show(title :string, message :string) {
    this.popOverNotifications.open(title, {label: message}).subscribe()
  }

}
