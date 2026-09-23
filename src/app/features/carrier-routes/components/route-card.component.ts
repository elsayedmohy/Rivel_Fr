import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AXIS_KEY, BERTH_TYPE_KEY, CarrierRoute, NileBerth } from '../routes.model';

@Component({
  selector: 'rl-route-card',
  standalone: true,
  imports: [TuiIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card rl-card">
      <div class="card__top">
        <span class="rl-chip rl-chip--axis">{{ axisLabel() }}</span>

        <button
          type="button"
          class="card__delete"
          [attr.aria-label]="
            'routes.delete'
              | translate: { origin: originName(), destination: destinationName() }
          "
          [disabled]="deleting()"
          (click)="remove.emit(route().id)"
        >
          <tui-icon icon="@tui.trash-2" [style.font-size.px]="17" />
        </button>
      </div>

      <div class="card__route">
        <div class="card__berth">
          <div class="card__berth-name">{{ originName() }}</div>
          <div class="card__berth-meta">{{ meta(route().originNileBerth) }}</div>
        </div>

        <div class="card__line" aria-hidden="true">
          <span class="card__dot"></span>
          <span class="card__rule"></span>
          <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
            <path
              d="M6.5 1 2 5l4.5 4"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <div class="card__berth card__berth--end">
          <div class="card__berth-name">{{ destinationName() }}</div>
          <div class="card__berth-meta">{{ meta(route().destinationNileBerth) }}</div>
        </div>
      </div>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .card {
        height: 140px;
        padding: 14px 16px 18px 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .card__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .card__delete {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        margin: -10px -10px -10px 0;
        background: transparent;
        border: none;
        border-radius: 10px;
        cursor: pointer;



        &:disabled {
          opacity: 0.45;
          cursor: progress;
        }
      }

      .card__route {
        display: flex;
        align-items: flex-start;
        gap: 14px;
      }

      .card__berth {
        flex-shrink: 0;

        &--end {
          text-align: end;
        }
      }

      .card__berth-name {

        font-size: 17px;
        font-weight: 600;
      }

      .card__berth-meta {
        margin-top: 3px;
        font-size: 12px;
      }

      .card__line {
        flex-grow: 1;
        display: flex;
        align-items: center;
        gap: 6px;
        padding-top: 10px;
      }

      .card__dot {
        width: 7px;
        height: 7px;
        flex-shrink: 0;
        border-radius: 50%;
        background: currentColor;
      }

      .card__rule {
        flex-grow: 1;
        height: 1px;
      }
    `,
  ],
})
export class RouteCardComponent {
  readonly route = input.required<CarrierRoute>();
  readonly deleting = input(false);

  readonly remove = output<string>();

  private readonly translate = inject(TranslateService);

  protected originName(): string {
    return this.route().originNileBerth.arabicName;
  }

  protected destinationName(): string {
    return this.route().destinationNileBerth.arabicName;
  }

  protected axisLabel(): string {
    return this.translate.translate(AXIS_KEY[this.route().originNileBerth?.axis])();
  }

  protected meta(berth: NileBerth): string {
    return this.translate.translate('routes.berthMeta', {
      type: this.translate.instant(BERTH_TYPE_KEY[berth.type]),
      governorate: berth.governorate,
    })();
  }
}
