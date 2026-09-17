import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { createNavItems } from '../../core/config/nav';
import { TokenService } from '../../core/http/token.service';

@Component({
  selector: 'rl-sidebar',
  imports: [RouterLink, RouterLinkActive, TuiIcon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  private readonly translate = inject(TranslateService);
  private readonly user = inject(TokenService).userSignal;

  readonly items = computed(() => createNavItems(this.translate, this.user()?.role ?? null));
}