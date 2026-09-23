import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TuiAlertService, TuiDataList, TuiDropdown, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiPagination, TuiSwitch } from '@taiga-ui/kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { SuggestedRequestCardComponent } from './components/suggested-request-card.component';
import {
  RouteFilterOption,
  SORT_KEY,
  SuggestedRequest,
  SuggestedSort,
} from '../carrier-routes/routes.model';
import { CarrierRouteService } from '../carrier-routes/data/carrier-route.service';
import { AlertService } from '../../core/services/alert.service';


const PAGE_SIZE = 4;

@Component({
  selector: 'rl-suggested-requests-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    TuiDataList,
    TuiDropdown,
    TuiIcon,
    TuiLoader,
    TuiPagination,
    TuiSwitch,
    SuggestedRequestCardComponent,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rl-page">
      <header>
        <h1 class="rl-page__title">{{ 'suggested.title' | translate }}</h1>
        <p class="rl-page__subtitle">
          {{ 'suggested.subtitle' | translate }}
          <a routerLink="/carrier/routes" class="link">{{ 'suggested.editRoutes' | translate }}</a>
          {{ 'suggested.subtitleHint' | translate }}
        </p>
      </header>

      @if (routeFilters().length > 1) {
        <div class="filters" role="group" [attr.aria-label]="'suggested.filterAria' | translate">
          @for (filter of routeFilters(); track filter.routeId) {
            <button
              type="button"
              class="chip"
              [class.chip--active]="activeRouteId() === filter.routeId"
              [attr.aria-pressed]="activeRouteId() === filter.routeId"
              (click)="selectRoute(filter.routeId)"
            >
              {{ filter.label }}
              <span class="chip__count">{{ filter.count }}</span>
            </button>
          }
        </div>
      }

      <div class="toolbar">
        <span class="toolbar__count">{{ rangeLabel() }}</span>

        <div class="toolbar__controls">
          <label class="toggle">
            <input
              tuiSwitch
              type="checkbox"
              [ngModel]="fittingOnly()"
              (ngModelChange)="setFittingOnly($event)"
            />
            <span>{{ 'suggested.fittingOnly' | translate }}</span>
          </label>

          <button
            type="button"
            class="sort"
            [tuiDropdown]="sortMenu"
            [(tuiDropdownOpen)]="sortOpen"
          >
            <span class="sort__prefix">{{ 'suggested.sortPrefix' | translate }}</span>
            <span>{{ sortLabel() | translate }}</span>
            <tui-icon icon="@tui.chevron-down" [style.font-size.px]="13" />
          </button>

          <ng-template #sortMenu>
            <tui-data-list>
              @for (option of sortOptions; track option) {
                <button tuiOption type="button" (click)="selectSort(option)">
                  {{ sortLabels[option] | translate }}
                </button>
              }
            </tui-data-list>
          </ng-template>
        </div>
      </div>

      @if (loading()) {
        <tui-loader class="loader" size="l" [textContent]="'common.loading' | translate" />
      } @else if (items().length === 0) {
        <div class="empty rl-card">
          <div class="empty__glyph">
            <tui-icon icon="@tui.inbox" [style.font-size.px]="28" />
          </div>
          <h2 class="empty__title">{{ emptyTitle() }}</h2>
          <p class="empty__text">{{ emptyText() }}</p>
        </div>
      } @else {
        <div class="list">
          @for (request of items(); track request.id) {
            <rl-suggested-request-card
              [request]="request"
              (details)="openDetails($event)"
              (makeOffer)="openOfferForm($event)"
            />
          }
        </div>

        @if (pageCount() > 1) {
          <div class="pager">
            <span class="pager__label">{{
              'suggested.pageLabel' | translate: { current: page(), total: pageCount() }
            }}</span>
            <tui-pagination
              [length]="pageCount()"
              [index]="page() - 1"
              (indexChange)="goToPage($event + 1)"
            />
          </div>
        }
      }
    </section>
  `,
  styles: [
    `
      .link {
        color: var(--rl-clay);
        font-weight: 600;
        text-decoration: none;

        &:hover {
          color: var(--rl-clay-hover);
        }
      }

      .filters {
        margin-top: 28px;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .chip {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        height: 44px;
        padding: 0 16px;
        background: var(--rl-surface);
        color: var(--rl-ink);
        border: 1px solid var(--rl-border-strong);
        border-radius: var(--rl-radius-pill);
        font-family: inherit;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;

        &__count {
          color: var(--rl-ink-3);
        }

        &--active {
          background: var(--rl-teal);
          color: #fff;
          border-color: var(--rl-teal);

          .chip__count {
            color: rgb(255 255 255 / 72%);
          }
        }
      }

      .toolbar {
        margin-top: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .toolbar__count {
        font-size: 13px;
        color: var(--rl-ink-2);
      }

      .toolbar__controls {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .toggle {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        height: 44px;
        font-size: 13px;
        font-weight: 600;
        color: var(--rl-ink);
        cursor: pointer;
      }

      .sort {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 44px;
        padding: 0 14px;
        background: var(--rl-surface);
        border: 1px solid var(--rl-border-strong);
        border-radius: var(--rl-radius-sm);
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        color: var(--rl-ink);
        cursor: pointer;

        &__prefix {
          color: var(--rl-ink-3);
          font-weight: 500;
        }
      }

      .list {
        margin-top: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .loader {
        margin-top: 60px;
      }

      .pager {
        margin-top: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .pager__label {
        font-size: 12.5px;
        color: var(--rl-ink-3);
      }

      .empty {
        margin-top: 16px;
        padding: 48px 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .empty__glyph {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        border-radius: 17px;
        background: var(--rl-teal-tint);
        color: var(--rl-teal);
      }

      .empty__title {
        margin: 18px 0 0;

        font-size: 19px;
        font-weight: 600;
        color: var(--rl-ink);
      }

      .empty__text {
        margin: 8px 0 0;
        max-width: 420px;
        font-size: 14px;
        line-height: 1.7;
        color: var(--rl-ink-2);
      }
    `,
  ],
})
export class SuggestedRequestsPage implements OnInit {
  private readonly routeService = inject(CarrierRouteService);
  private readonly alerts = inject(AlertService);
  private readonly router = inject(Router);

  protected readonly sortOptions: SuggestedSort[] = [
    'newest',
    'pickupSoonest',
    'weightAsc',
    'weightDesc',
  ];
  protected readonly sortLabels = SORT_KEY;

  private readonly translate = inject(TranslateService);

  protected readonly items = signal<SuggestedRequest[]>([]);
  protected readonly routeFilters = signal<RouteFilterOption[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly loading = signal(true);

  protected readonly page = signal(1);
  protected readonly activeRouteId = signal<string | null>(null);
  protected readonly fittingOnly = signal(false);
  protected readonly sort = signal<SuggestedSort>('newest');

  protected sortOpen = false;

  protected readonly sortLabel = computed(() => SORT_KEY[this.sort()]);

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / PAGE_SIZE)),
  );

  protected readonly rangeLabel = computed(() => {
    const total = this.totalCount();
    if (total === 0) {
      return this.translate.translate('suggested.range.empty')();
    }
    const from = (this.page() - 1) * PAGE_SIZE + 1;
    const to = Math.min(this.page() * PAGE_SIZE, total);
    return this.translate.translate('suggested.range.summary', {
      from: String(from),
      to: String(to),
      total: String(total),
    })();
  });

  protected readonly emptyTitle = computed(() =>
    this.translate.translate(
      this.fittingOnly() ? 'suggested.empty.fittingTitle' : 'suggested.empty.allTitle',
    )(),
  );

  protected readonly emptyText = computed(() =>
    this.translate.translate(
      this.fittingOnly() ? 'suggested.empty.fittingText' : 'suggested.empty.allText',
    )(),
  );

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);

    this.routeService
      .getSuggestedRequests({
        page: this.page(),
        pageSize: PAGE_SIZE,
        routeId: this.activeRouteId(),
        fittingOnly: this.fittingOnly(),
        sort: this.sort(),
      })
      .subscribe({
        next: (result) => {
          this.items.set(result.items);
          this.totalCount.set(result.totalCount);
          if (result.routeFilters?.length) {
            this.routeFilters.set(result.routeFilters);
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.alerts.error(this.translate.instant('suggested.alerts.loadFailed'))
        },
      });
  }

  protected selectRoute(routeId: string | null): void {
    if (this.activeRouteId() === routeId) {
      return;
    }
    this.activeRouteId.set(routeId);
    this.page.set(1);
    this.load();
  }

  protected setFittingOnly(value: boolean): void {
    this.fittingOnly.set(value);
    this.page.set(1);
    this.load();
  }

  protected selectSort(sort: SuggestedSort): void {
    this.sortOpen = false;
    if (this.sort() === sort) {
      return;
    }
    this.sort.set(sort);
    this.page.set(1);
    this.load();
  }

  protected goToPage(page: number): void {
    this.page.set(page);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected openDetails(requestId: string): void {
    this.router.navigate(['/carrier/shipment-requests', requestId]);
  }

  protected openOfferForm(requestId: string): void {
    this.router.navigate(['/carrier/shipment-requests', requestId, 'offer']);
  }
}
