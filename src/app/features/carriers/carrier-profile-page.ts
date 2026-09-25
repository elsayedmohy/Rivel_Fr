import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TuiLoader } from '@taiga-ui/core';
import { ProfileService } from '../../core/http/profile.service';
import type { CarrierPublicProfileDto } from '../../models/profile/profile';

@Component({
  selector: 'rl-carrier-profile-page',
  imports: [DecimalPipe, TranslatePipe, TuiLoader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="rl-page">
      <a class="rl-link" href="javascript:history.back()">{{ 'requests.back' | translate }}</a>

      @if (loading()) {
        <tui-loader />
      } @else if (carrier(); as c) {
        <header class="rl-page__heading">
          <div>
            <h1 class="rl-page__title">{{ c.companyName }}</h1>
            @if (c.bio) {
              <p class="rl-page__subtitle">{{ c.bio }}</p>
            }
          </div>
        </header>

        <dl class="rl-card stats">
          <div>
            <dt>{{ 'carrier.rating' | translate }}</dt>
            <dd class="rl-num">
              @if (c.ratingCount > 0) {
                {{ c.overallRating | number: '1.1-1' }} ★ <small>({{ c.ratingCount }})</small>
              } @else {
                {{ 'carrier.noRatings' | translate }}
              }
            </dd>
          </div>
          <div>
            <dt>{{ 'carrier.completed' | translate }}</dt>
            <dd class="rl-num">{{ c.completedShipments }}</dd>
          </div>
          <div>
            <dt>{{ 'carrier.vessels' | translate }}</dt>
            <dd class="rl-num">{{ c.vesselCount }}</dd>
          </div>
        </dl>

        @if (c.activeRoutes.length) {
          <section class="rl-card routes">
            <h2>{{ 'carrier.routes' | translate }}</h2>
            <ul>
              @for (r of c.activeRoutes; track $index) {
                <li>{{ r.originName }} ← {{ r.destinationName }}</li>
              }
            </ul>
          </section>
        }

        <p class="hint">{{ 'carrier.contactHint' | translate }}</p>
      } @else {
        <p class="rl-error">{{ 'carrier.notFound' | translate }}</p>
      }
    </main>
  `,
  styles: `
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: 16px; padding: 20px; margin: 24px 0 16px; }
    dt { font-size: 13px; color: var(--rl-ink-3); }
    dd { margin: 4px 0 0; font-size: 20px; }
    small { font-size: 13px; color: var(--rl-ink-3); }
    .routes { padding: 20px; }
    .routes h2 { margin: 0 0 8px; font-size: 16px; }
    .routes ul { margin: 0; padding-inline-start: 18px; }
    .hint { margin-block-start: 16px; font-size: 13px; color: var(--rl-ink-3); }
  `,
})
export class CarrierProfilePage {
  protected readonly carrier = signal<CarrierPublicProfileDto | null>(null);
  protected readonly loading = signal(true);

  constructor() {
    const id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;
    inject(ProfileService)
      .getCarrier(id)
      .subscribe({
        next: (c) => {
          this.carrier.set(c);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
