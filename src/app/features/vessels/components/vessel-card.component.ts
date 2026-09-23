import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TuiIcon } from '@taiga-ui/core';

import {
  Vessel,
  VesselStatus,
  VESSEL_STATUS_KEY,
  VESSEL_TYPE_KEY,
} from '../data/vessel.model';

@Component({
  selector: 'rl-vessel-card',
  standalone: true,
  imports: [TranslatePipe, TuiIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let v = vessel();

    <article class="rl-card card" [class.card--busy]="v.status === Status.OnTrip">
      <header class="card__head">
        <div class="card__id">
          <h2 class="card__name">{{ v.name }}</h2>
          <p class="card__meta">
            <span class="rl-num">{{ v.registrationNumber }}</span>
            <span class="dot" aria-hidden="true">·</span>
            <span>{{ typeKey[v.type] | translate }}</span>
            @if (v.yearBuilt) {
              <span class="dot" aria-hidden="true">·</span>
              <bdi class="rl-num">{{ v.yearBuilt }}</bdi>
            }
          </p>
        </div>

        <span class="status" [attr.data-status]="v.status">
          <span class="status__dot" aria-hidden="true"></span>
          {{ statusKey[v.status] | translate }}
        </span>
      </header>

      <p class="capacity">
        <tui-icon icon="@tui.weight" />
        <bdi class="rl-num capacity__value">{{ v.capacity }}</bdi>
        <span class="capacity__unit">{{ 'common.ton' | translate }}</span>
      </p>

      @if (v.activeShipment; as trip) {
        <a class="trip" [routerLink]="['/shipments', trip.shipmentId]">
          <span class="rl-tile trip__tile"><tui-icon icon="@tui.package" /></span>
          <span class="trip__body">
            <span class="trip__cargo">{{ trip.cargoType }}</span>
            <span class="trip__route">
              {{ trip.origin }}
              <svg class="tip" viewBox="0 0 9 10" aria-hidden="true"><path d="M6.5 1 2 5l4.5 4" /></svg>
              {{ trip.destination }}
            </span>
          </span>
          <tui-icon class="trip__go" icon="@tui.chevron-left" />
        </a>
      } @else if (v.pendingOfferCount > 0) {
        <p class="pending">
          <tui-icon icon="@tui.clock" />
          <span>
            {{ 'vessels.pendingOffers' | translate }} ·
            <bdi class="rl-num">{{ v.pendingOfferCount }}</bdi>
          </span>
        </p>
      }

      <footer class="card__foot">
        @if (confirming()) {
          <p class="confirm">{{ 'vessels.confirmArchive' | translate }}</p>
          <div class="card__actions">
            <button type="button" class="rl-btn rl-btn--quiet" (click)="confirming.set(false)">
              {{ 'common.cancel' | translate }}
            </button>
            <button type="button" class="rl-btn rl-btn--danger" (click)="doArchive()">
              {{ 'vessels.archive' | translate }}
            </button>
          </div>
        } @else {
          <div class="card__actions">
            <button
              type="button"
              class="rl-btn rl-btn--quiet"
              [disabled]="busy()"
              (click)="edit.emit(v)"
            >
              <tui-icon icon="@tui.pencil" />
              {{ 'common.edit' | translate }}
            </button>

            <button
              type="button"
              class="rl-btn rl-btn--quiet"
              [disabled]="busy() || v.status === Status.OnTrip"
              [attr.title]="v.status === Status.OnTrip ? ('vessels.onTripLocked' | translate) : null"
              (click)="toggleStatus.emit(v)"
            >
              <tui-icon [icon]="v.status === Status.Maintenance ? '@tui.circle-check' : '@tui.wrench'" />
              @if (v.status === Status.Maintenance) {
                {{ 'vessels.markAvailable' | translate }}
              } @else {
                {{ 'vessels.markMaintenance' | translate }}
              }
            </button>

            <button
              type="button"
              class="rl-btn rl-btn--quiet danger"
              [disabled]="busy() || v.status === Status.OnTrip"
              (click)="confirming.set(true)"
            >
              <tui-icon icon="@tui.archive" />
              {{ 'vessels.archive' | translate }}
            </button>
          </div>
        }
      </footer>
    </article>
  `,
  styles: [
    `
      :host { display: block; }

      .card {
        padding: var(--rl-s6);
        display: flex;
        flex-direction: column;
        gap: var(--rl-s4);
      }

      .card--busy { background: var(--rl-sunken); }

      .card__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--rl-s4);
      }

      .card__id { min-width: 0; }

      .card__name {
        margin: 0;
        font-size: 19px;
        line-height: 26px;
        font-weight: 600;
        color: var(--rl-ink);
      }

      .card__meta {
        margin: 4px 0 0;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        font-size: 13px;
        color: var(--rl-ink-2);
      }

      .dot { color: var(--rl-ink-3); }

      .status {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 5px 11px;
        border-radius: var(--rl-r-pill);
        border: 1px solid var(--rl-line);
        font-size: 12.5px;
        font-weight: 600;
        color: var(--rl-ink-2);
        white-space: nowrap;
      }

      .status__dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--rl-ink-3);
      }

      .status[data-status='0'] .status__dot { background: var(--rl-accent-ink); }
      .status[data-status='1'] .status__dot { background: var(--rl-ink); }

      .capacity {
        margin: 0;
        display: flex;
        align-items: baseline;
        gap: var(--rl-s2);
        color: var(--rl-ink);
      }

      .capacity tui-icon {
        font-size: 16px;
        color: var(--rl-ink-3);
        align-self: center;
      }

      .capacity__value { font-size: 26px; line-height: 30px; font-weight: 600; }
      .capacity__unit { font-size: 13px; color: var(--rl-ink-2); }

      .trip {
        display: flex;
        align-items: center;
        gap: var(--rl-s3);
        padding: 12px 14px;
        border: 1px solid var(--rl-line-subtle);
        border-radius: var(--rl-r-md);
        text-decoration: none;
        color: inherit;
        transition: border-color 0.12s;
      }

      .trip:hover { border-color: var(--rl-line-strong); }
      .trip:focus-visible { outline: 2px solid var(--rl-focus); outline-offset: 2px; }

      .trip__tile { flex-shrink: 0; }
      .trip__body { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }

      .trip__cargo { font-size: 14px; font-weight: 600; color: var(--rl-ink); }

      .trip__route {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        color: var(--rl-ink-2);
      }

      .trip__go { flex-shrink: 0; font-size: 16px; color: var(--rl-ink-3); }

      .tip {
        width: 8px;
        height: 9px;
        flex-shrink: 0;
        fill: none;
        stroke: var(--rl-ink-3);
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .pending {
        margin: 0;
        display: flex;
        align-items: center;
        gap: var(--rl-s2);
        font-size: 13px;
        color: var(--rl-ink-2);
      }

      .pending tui-icon { font-size: 15px; color: var(--rl-ink-3); }

      .card__foot {
        padding-top: var(--rl-s4);
        border-top: 1px solid var(--rl-line-subtle);
      }

      .card__actions { display: flex; gap: var(--rl-s2); flex-wrap: wrap; }

      .card__actions .danger { color: var(--rl-danger); }

      .confirm {
        margin: 0 0 var(--rl-s3);
        font-size: 13.5px;
        color: var(--rl-ink-2);
      }

      @media (max-width: 560px) {
        .card__head { flex-direction: column; gap: var(--rl-s3); }
        .card__actions > * { flex-grow: 1; justify-content: center; }
      }
    `,
  ],
})
export class VesselCardComponent {
  readonly vessel = input.required<Vessel>();
  readonly busy = input(false);

  readonly edit = output<Vessel>();
  readonly toggleStatus = output<Vessel>();
  readonly archive = output<Vessel>();

  protected readonly Status = VesselStatus;
  protected readonly typeKey = VESSEL_TYPE_KEY;
  protected readonly statusKey = VESSEL_STATUS_KEY;

  protected readonly confirming = signal(false);

  protected doArchive(): void {
    this.confirming.set(false);
    this.archive.emit(this.vessel());
  }
}
