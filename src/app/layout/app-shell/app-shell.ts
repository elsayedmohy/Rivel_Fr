import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { MobileNavigation } from '../mobile-navigation/mobile-navigation';
import { NotificationService } from '../../core/services/notification.service';
import { TokenService } from '../../core/http/token.service';

@Component({
  selector: 'rl-app-shell',
  imports: [RouterOutlet, Sidebar, Topbar, MobileNavigation],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  notificationService = inject(NotificationService);
  private readonly tokenService = inject(TokenService);
  constructor(){
    if(this.tokenService.isAuthenticated()) {
      this.notificationService.connect(this.tokenService.tokenSignal()!);
    }
  }
}
