import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AXIS_KEY, BERTH_TYPE_KEY, SuggestedRequest } from '../../carrier-routes/routes.model';
import { LanguageService } from '../../../core/config/language.service';


@Component({
  selector: 'rl-suggested-request-card',
  standalone: true,
  imports: [DatePipe, DecimalPipe, TuiIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card rl-card" [class.card--blocked]="overCapacity()">
      <div class="card__glyph" [class.card__glyph--muted]="overCapacity()">
        <tui-icon [icon]="cargoIcon()" [style.font-size.px]="22" />
      </div>

      <div class="card__body">
        <div class="card__titles">
          <span class="card__cargo">{{ request().cargoType }}</span>

          @if (request().isNew) {
            <span class="rl-chip rl-chip--new">{{ 'suggested.new' | translate }}</span>
          }

          @if (overCapacity()) {
            <span class="rl-chip rl-chip--over">
              <tui-icon icon="@tui.circle-alert" [style.font-size.px]="11" />
              {{
                'suggested.overCapacity'
                  | translate: { capacity: request().maxVesselCapacity | number }
              }}
            </span>
          } @else {
            <span class="rl-chip rl-chip--fits">
              <tui-icon icon="@tui.check" [style.font-size.px]="11" />
              {{ fitsLabel() }}
            </span>
          }
        </div>

        <div class="card__route">
          <span class="card__berth">{{ request().originNileBerth.arabicName }}</span>
          <svg
            class="rl-arrow"
            width="8"
            height="9"
            viewBox="0 0 9 10"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6.5 1 2 5l4.5 4"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="card__berth">{{ request().destinationNileBerth.arabicName }}</span>
          <span class="card__route-meta">· {{ berthPair() }} · {{ axisLabel() }}</span>
        </div>

        <div class="card__meta">
          {{ request().weight | number }} {{ 'common.ton' | translate }} · {{ 'common.pickup' | translate }}
          {{ request().pickupDate | date: 'd MMMM' : undefined : language.current() }} ·
          {{ offersLabel() }}
          @if (request().lowestOfferPrice !== null) {
            ·
            {{ 'suggested.lowestOffer' | translate: { price: request().lowestOfferPrice | number } }}
          }
        </div>
      </div>

      <div class="card__actions">
        <button type="button" class="btn btn--ghost" (click)="details.emit(request().id)">
          {{ 'common.details' | translate }}
        </button>

        <button
          type="button"
          class="btn btn--primary"
          [disabled]="overCapacity()"
          [attr.title]="overCapacity() ? ('suggested.noVesselForCargo' | translate) : null"
          (click)="makeOffer.emit(request().id)"
        >
          {{ 'offers.form.submit' | translate }}
        </button>
      </div>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .card {
        min-height: 132px;
        padding: 18px 22px;
        display: flex;
        align-items: center;
        gap: 16px;

        &--blocked {
          background: var(--rl-surface-soft);
        }
      }

      .card__glyph {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        border-radius: 13px;
        background: var(--rl-teal-tint);
        color: var(--rl-teal);

        &--muted {
          background: var(--rl-surface-muted);
          color: var(--rl-ink-2);
        }
      }

      .card__body {
        flex-grow: 1;
        min-width: 0;
      }

      .card__titles {
        display: flex;
        align-items: center;
        gap: 9px;
        flex-wrap: wrap;
      }

      .card__cargo {

        font-size: 17px;
        font-weight: 600;
        color: var(--rl-ink);
      }

      .card__route {
        margin-top: 7px;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 13.5px;
        color: var(--rl-ink);
      }

      .card__berth {
        font-weight: 600;
      }

      .card__route-meta {
        color: var(--rl-ink-3);
        font-size: 12.5px;
      }

      .card__meta {
        margin-top: 6px;
        font-size: 12.5px;
        color: var(--rl-ink-2);
      }

      .card__actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }

      .btn {
        height: 44px;
        border-radius: var(--rl-radius-sm);
        font-family: inherit;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;

        &--ghost {
          padding: 0 16px;
          background: var(--rl-surface);
          color: var(--rl-ink);
          border: 1px solid var(--rl-border-strong);

          &:hover {
            background: var(--rl-surface-muted);
          }
        }

        &--primary {
          padding: 0 18px;
          background: var(--rl-clay);
          color: #fff;
          border: none;

          &:hover:not(:disabled) {
            background: var(--rl-clay-hover);
          }

          &:disabled {
            background: var(--rl-surface-muted);
            color: var(--rl-ink-2);
            border: 1px solid var(--rl-border);
            cursor: not-allowed;
          }
        }
      }
    `,
  ],
})
export class SuggestedRequestCardComponent {
  readonly request = input.required<SuggestedRequest>();

  readonly details = output<string>();
  readonly makeOffer = output<string>();

  private readonly translate = inject(TranslateService);
  protected readonly language = inject(LanguageService);

  protected readonly overCapacity = computed(() => this.request().fittingVesselsCount === 0);

  protected readonly fitsLabel = computed(() => {
    const count = this.request().fittingVesselsCount;
    if (count === 1) return this.translate.translate('suggested.fits.one')();
    if (count === 2) return this.translate.translate('suggested.fits.two')();
    return this.translate.translate('suggested.fits.many', { count: String(count) })();
  });

  protected readonly offersLabel = computed(() => {
    const count = this.request().offersCount;
    if (count === 0) return this.translate.translate('offers.count.zero')();
    if (count === 1) return this.translate.translate('offers.count.one')();
    if (count === 2) return this.translate.translate('offers.count.two')();
    return this.translate.translate('offers.count.many', { count: String(count) })();
  });

  protected readonly berthPair = computed(
    () =>
      `${this.translate.instant(BERTH_TYPE_KEY[this.request().originNileBerth.type])} ← ${
        this.translate.instant(BERTH_TYPE_KEY[this.request().destinationNileBerth.type])
      }`,
  );

  protected readonly axisLabel = computed(() =>
    this.translate.translate(AXIS_KEY[this.request().originNileBerth.axis])(),
  );

  protected readonly cargoIcon = computed(() => {
    const type = this.request().cargoType;
    if (type.includes('حديد')) return '@tui.package';
    if (type.includes('أسمدة') || type.includes('سماد')) return '@tui.layers';
    if (type.includes('أسمنت')) return '@tui.warehouse';
    return '@tui.box';
  });
}
