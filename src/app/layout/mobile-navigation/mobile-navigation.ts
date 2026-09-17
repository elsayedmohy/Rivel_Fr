import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { createNavItems } from '../../core/config/nav';
import { TokenService } from '../../core/http/token.service';

@Component({
  selector: 'rl-mobile-navigation',
  imports: [RouterLink, RouterLinkActive, TuiIcon],
  templateUrl: './mobile-navigation.html',
  styleUrl: './mobile-navigation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileNavigation {
  private readonly translate = inject(TranslateService);
  private readonly user = inject(TokenService).userSignal;

  readonly items = computed(() =>
    createNavItems(this.translate, this.user()?.role ?? null).slice(0, 5),
  );
}