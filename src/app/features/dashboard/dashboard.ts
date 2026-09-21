import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TokenService } from '../../core/http/token.service';
import type { QuickAction } from './dashboard.models';
import { RlCard } from '../../shared/components/rl-card/rl-card';

@Component({
  selector: 'rl-dashboard',
  imports: [RouterLink, TuiIcon, TranslatePipe, RlCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  readonly user = inject(TokenService).userSignal;
  private readonly translate = inject(TranslateService);

  readonly actions: QuickAction[] = [
    {
      routerLink: '/requests',
      icon: '@tui.package',
      label: this.translate.translate('dashboard.action.browseRequests'),
      hint: this.translate.translate('dashboard.action.browseRequestsHint'),
      role: 'Carrier',
    },
    {
      routerLink: '/requests/new',
      icon: '@tui.plus',
      label: this.translate.translate('dashboard.action.postRequest'),
      hint: this.translate.translate('dashboard.action.postRequestHint'),
      role: 'CargoOwner',
    },
    {
      routerLink: '/offers',
      icon: '@tui.handshake',
      label: this.translate.translate('dashboard.action.myOffers'),
      hint: this.translate.translate('dashboard.action.myOffersHint'),
      role: 'Carrier',
    },
    {
      routerLink: '/shipments',
      icon: '@tui.anchor',
      label: this.translate.translate('dashboard.action.trackShipments'),
      hint: this.translate.translate('dashboard.action.trackShipmentsHint'),
    },
    {
      routerLink: '/vessels',
      icon: '@tui.ship',
      label: this.translate.translate('dashboard.action.myVessels'),
      hint: this.translate.translate('dashboard.action.myVesselsHint'),
      role: 'Carrier',
    },
    {
      routerLink: '/ratings',
      icon: '@tui.star',
      label: this.translate.translate('dashboard.action.ratings'),
      hint: this.translate.translate('dashboard.action.ratingsHint'),
      role: 'CargoOwner',
    },
  ];

  visibleActions(): QuickAction[] {
    const role = this.user()?.role;
    return role
      ? this.actions.filter((action) => !action.role || action.role === role)
      : this.actions;
  }
}
