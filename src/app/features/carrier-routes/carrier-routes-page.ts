import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiDialogService, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { switchMap } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AddRouteDialogComponent } from './components/add-route-dialog.component';
import { RouteCardComponent } from './components/route-card.component';
import { CarrierRoute, CreateCarrierRouteDto, NileBerth, SuggestedRequest } from './routes.model';
import { CarrierRouteService } from './data/carrier-route.service';
import { NileBerthService } from './data/nile-berth.service';
import { AlertService } from '../../core/services/alert.service';
import { LanguageService } from '../../core/config/language.service';

@Component({
  selector: 'rl-carrier-routes-page',
  standalone: true,
  imports: [RouterLink, TuiButton, TuiIcon, TuiLoader, RouteCardComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rl-page">
      <header class="head">
        <div>
          <h1 class="rl-page__title">{{ 'routes.title' | translate }}</h1>
          <p class="rl-page__subtitle">
            {{ 'routes.subtitle' | translate }}
          </p>
        </div>

        <button
          tuiButton
          type="button"
          size="l"
          iconStart="@tui.plus"
          class="cta"
          [disabled]="berths().length === 0"
          (click)="openAddDialog()"
        >
          {{ 'routes.add' | translate }}
        </button>
      </header>

      @if (loading()) {
        <tui-loader class="loader" size="l" [textContent]="'common.loading' | translate" />
      } @else if (routes().length === 0) {
        <div class="empty">
          <div class="empty__glyph">
            <tui-icon icon="@tui.git-fork" [style.font-size.px]="30" />
          </div>

          <h2 class="empty__title">{{ 'routes.empty.title' | translate }}</h2>
          <p class="empty__text">
            {{ 'routes.empty.text' | translate }}
          </p>

          <button tuiButton type="button" size="l" iconStart="@tui.plus" (click)="openAddDialog()">
            {{ 'routes.empty.cta' | translate }}
          </button>
        </div>
      } @else {
        <h2 class="section">
          {{ 'routes.saved' | translate: { count: routes().length } }}
        </h2>

        <div class="grid">
          @for (route of routes(); track route.id) {
            <rl-route-card
              [route]="route"
              [deleting]="deletingId() === route.id"
              (remove)="deleteRoute($event)"
            />
          }
        </div>

        @if (suggestedCount() > 0) {
          <a class="banner" routerLink="/carrier/suggested-requests">
            <span class="banner__glyph">
              <tui-icon icon="@tui.sparkles" [style.font-size.px]="21" />
            </span>

            <span class="banner__body">
              <span class="banner__title">
                {{ 'routes.banner.title' | translate: { count: suggestedCount() } }}
              </span>
              @if (latestSuggested(); as latest) {
                <span class="banner__meta">
                  {{ bannerLatest(latest) }}
                </span>
              }
            </span>

            <span class="banner__cta">
              {{ 'routes.banner.view' | translate }}
              <tui-icon icon="@tui.chevron-left" [style.font-size.px]="15" />
            </span>
          </a>
        }
      }
    </section>
  `,
  styles: [
    `
      .head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 28px;
      }

      .loader {
        margin-top: 60px;
      }

      .section {
        margin: 34px 0 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--rl-ink);
      }

      .section__count {
        color: var(--rl-ink-3);
        font-weight: 500;
      }

      .grid {
        margin-top: 16px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
        gap: 24px;
      }

      .banner {
        margin-top: 26px;
        box-sizing: border-box;
        min-height: 84px;
        padding: 14px 22px;
        display: flex;
        align-items: center;
        gap: 16px;
        background: var(--rl-teal);
        border-radius: var(--rl-radius);
        color: #fff;
        text-decoration: none;

        &:hover .banner__cta {
          background: #eb9a71;
        }
      }

      .banner__glyph {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 46px;
        height: 46px;
        border-radius: 12px;
        background: rgb(255 255 255 / 13%);
      }

      .banner__body {
        flex-grow: 1;
        min-width: 0;
      }

      .banner__title {
        display: block;
        font-size: 16px;
        font-weight: 600;
      }

      .banner__meta {
        display: block;
        margin-top: 5px;
        font-size: 13px;
        color: var(--rl-on-teal-body);
      }

      .banner__cta {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        height: 44px;
        padding: 0 18px;
        background: var(--rl-clay-light);
        color: var(--rl-teal-deep);
        border-radius: var(--rl-radius-sm);
        font-size: 13.5px;
        font-weight: 600;
        transition: background 0.15s;
      }

      .empty {
        margin-top: 28px;
        min-height: 372px;
        padding: 32px 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: var(--rl-surface);
        border: 1px dashed var(--rl-rule);
        border-radius: 16px;
      }

      .empty__glyph {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        border-radius: 18px;
        background: var(--rl-teal-tint);
        color: var(--rl-teal);
      }

      .empty__title {
        margin: 20px 0 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--rl-ink);
      }

      .empty__text {
        margin: 9px 0 22px;
        max-width: 430px;
        font-size: 14px;
        line-height: 1.7;
        color: var(--rl-ink-2);
      }
    `,
  ],
})
export class CarrierRoutesPage implements OnInit {
  private readonly routeService = inject(CarrierRouteService);
  private readonly berthService = inject(NileBerthService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(AlertService);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);

  protected readonly routes = signal<CarrierRoute[]>([]);
  protected readonly berths = signal<NileBerth[]>([]);
  protected readonly loading = signal(true);
  protected readonly deletingId = signal<string | null>(null);

  protected readonly suggestedCount = signal(0);
  protected readonly latestSuggested = signal<SuggestedRequest | null>(null);

  private formatNumber(value: number): string {
    return new Intl.NumberFormat(this.language.current(), {
      maximumFractionDigits: 1,
    }).format(value);
  }

  protected bannerLatest(latest: SuggestedRequest): string {
    return this.translate.translate('routes.banner.latest', {
      cargo: latest.cargoType,
      origin: latest.originNileBerth.arabicName,
      destination: latest.destinationNileBerth.arabicName,
      weight: this.formatNumber(latest.weight),
    })();
  }

  ngOnInit(): void {
    this.berthService.getAll().subscribe({
      next: (berths) => this.berths.set(berths),
      error: () => this.alerts.error(this.translate.instant('routes.alerts.berthsFailed')),
    });

    this.loadRoutes();
  }

  private loadRoutes(): void {
    this.loading.set(true);

    this.routeService.getMyRoutes().subscribe({
      next: (routes) => {
        this.routes.set(routes);
        this.loading.set(false);
        if (routes.length) {
          this.loadSuggestedSummary();
        } else {
          this.suggestedCount.set(0);
          this.latestSuggested.set(null);
        }
      },
      error: () => {
        this.loading.set(false);
        this.alerts.error(this.translate.instant('routes.alerts.routesFailed'));
      },
    });
  }

  private loadSuggestedSummary(): void {
    this.routeService.getSuggestedRequests({ page: 1, pageSize: 1, sort: 'newest' }).subscribe({
      next: (page) => {
        this.suggestedCount.set(page.totalCount);
        this.latestSuggested.set(page.items[0] ?? null);
      },
      error: () => {
        this.suggestedCount.set(0);
        this.latestSuggested.set(null);
      },
    });
  }

  protected openAddDialog(): void {
    this.dialogs
      .open<CreateCarrierRouteDto | null>(new PolymorpheusComponent(AddRouteDialogComponent), {
        data: this.berths(),
        size: 'm',
        dismissible: true,
      })
      .pipe(
        switchMap((dto) => {
          if (!dto) {
            throw new Error('cancelled');
          }
          return this.routeService.addRoute(dto);
        }),
      )
      .subscribe({
        next: () => {
          this.alerts.success(this.translate.instant('routes.alerts.added'));
          this.loadRoutes();
        },
        error: (err: unknown) => {
          if (err instanceof Error && err.message === 'cancelled') {
            return;
          }
          const message =
            (err as { error?: { message?: string } })?.error?.message ??
            this.translate.instant('routes.alerts.addFailed');
          this.alerts.error(message);
        },
      });
  }

  protected deleteRoute(id: string): void {
    this.deletingId.set(id);

    this.routeService.deleteRoute(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.routes.update((list) => list.filter((r) => r.id !== id));
        if (this.routes().length === 0) {
          this.suggestedCount.set(0);
        } else {
          this.loadSuggestedSummary();
        }
      },
      error: () => {
        this.deletingId.set(null);
        this.alerts.error(this.translate.instant('routes.alerts.deleteFailed'));
      },
    });
  }
}
