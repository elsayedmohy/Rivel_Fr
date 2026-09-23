import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TuiButton, TuiDialogContext, TuiIcon } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';

import {
  Vessel,
  VesselPayload,
  VesselType,
  VESSEL_TYPES,
  VESSEL_TYPE_KEY,
} from '../data/vessel.model';

export interface VesselDialogData {
  vessel: Vessel | null;
}

@Component({
  selector: 'rl-vessel-dialog',
  standalone: true,
  imports: [TranslatePipe, TuiButton, TuiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="dialog" (submit)="submit($event)" novalidate>
      <header class="dialog__head">
        <div>
          <p class="rl-eyebrow">{{ 'vessels.dialog.eyebrow' | translate }}</p>
          <h2 class="dialog__title">
            @if (isEdit()) {
              {{ 'vessels.dialog.editTitle' | translate }}
            } @else {
              {{ 'vessels.dialog.addTitle' | translate }}
            }
          </h2>
        </div>
      </header>

      <div class="grid">
        <div class="field field--wide">
          <label class="rl-label" for="v-name">{{ 'vessels.field.name' | translate }}</label>
          <input
            id="v-name"
            class="rl-control"
            type="text"
            maxlength="120"
            autocomplete="off"
            [value]="name()"
            (input)="name.set(value($event))"
          />
        </div>

        <div class="field">
          <label class="rl-label" for="v-reg">{{ 'vessels.field.registration' | translate }}</label>
          <input
            id="v-reg"
            class="rl-control rl-num"
            type="text"
            maxlength="50"
            autocomplete="off"
            [value]="registration()"
            (input)="registration.set(value($event))"
          />
        </div>

        <div class="field">
          <label class="rl-label" for="v-type">{{ 'vessels.field.type' | translate }}</label>
          <select
            id="v-type"
            class="rl-control"
            [value]="type()"
            (change)="type.set(+value($event))"
          >
            @for (t of types; track t) {
              <option [value]="t">{{ typeKey[t] | translate }}</option>
            }
          </select>
        </div>

        <div class="field">
          <label class="rl-label" for="v-capacity">
            {{ 'vessels.field.capacity' | translate }}
          </label>
          <div class="suffixed">
            <input
              id="v-capacity"
              class="rl-control rl-num"
              type="number"
              min="1"
              max="20000"
              step="1"
              inputmode="numeric"
              [value]="capacity()"
              (input)="capacity.set(value($event))"
            />
            <span class="suffixed__unit">{{ 'common.ton' | translate }}</span>
          </div>
          @if (capacityLocked()) {
            <p class="hint">{{ 'vessels.dialog.capacityLocked' | translate }}</p>
          }
        </div>

        <div class="field">
          <label class="rl-label" for="v-year">
            {{ 'vessels.field.yearBuilt' | translate }}
            <span class="field__optional">{{ 'common.optional' | translate }}</span>
          </label>
          <input
            id="v-year"
            class="rl-control rl-num"
            type="number"
            min="1900"
            [max]="thisYear"
            step="1"
            inputmode="numeric"
            [value]="yearBuilt()"
            (input)="yearBuilt.set(value($event))"
          />
        </div>
      </div>

      @if (error(); as message) {
        <p class="notice notice--error" role="alert">
          <tui-icon icon="@tui.circle-alert" />
          <span>{{ message }}</span>
        </p>
      }

      <footer class="dialog__foot">
        <button tuiButton type="button" appearance="outline" size="m" (click)="cancel()">
          {{ 'common.cancel' | translate }}
        </button>
        <button tuiButton type="submit" appearance="primary" size="m" [disabled]="!valid()">
          {{ 'common.save' | translate }}
        </button>
      </footer>
    </form>
  `,
  styles: [
    `
      .dialog {
        display: flex;
        flex-direction: column;
        gap: var(--rl-s6);
      }

      .dialog__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--rl-s4);
      }

      .dialog__title {
        margin: 6px 0 0;
        font-size: 24px;
        line-height: 30px;
        font-weight: 700;
        color: var(--rl-ink);
      }

      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--rl-s4);
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }

      .field--wide {
        grid-column: 1 / -1;
      }

      .field__optional {
        margin-inline-start: var(--rl-s1);
        font-weight: 400;
        color: var(--rl-ink-3);
      }

      .suffixed {
        position: relative;
      }

      .suffixed__unit {
        position: absolute;
        inset-inline-end: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12.5px;
        color: var(--rl-ink-3);
        pointer-events: none;
      }

      .suffixed .rl-control {
        width: 70%;
      }

      .hint {
        margin: 2px 0 0;
        font-size: 12px;
        color: var(--rl-ink-3);
      }

      .notice {
        margin: 0;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: var(--rl-s2);
        border-radius: var(--rl-r-md);
        font-size: 13.5px;
      }

      .notice--error {
        background: var(--rl-danger-soft);
        color: var(--rl-danger);
      }

      .dialog__foot {
        display: flex;
        justify-content: flex-end;
        gap: var(--rl-s2);
      }

      @media (max-width: 560px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class VesselDialogComponent {
  private readonly context =
    inject<TuiDialogContext<VesselPayload | null, VesselDialogData>>(POLYMORPHEUS_CONTEXT);

  protected readonly types = VESSEL_TYPES;
  protected readonly typeKey = VESSEL_TYPE_KEY;
  protected readonly thisYear = new Date().getFullYear();

  private readonly existing = this.context.data.vessel;

  protected readonly isEdit = signal(this.existing !== null);
  protected readonly name = signal(this.existing?.name ?? '');
  protected readonly registration = signal(this.existing?.registrationNumber ?? '');
  protected readonly type = signal<VesselType>(this.existing?.type ?? VesselType.Barge);
  protected readonly capacity = signal(this.existing ? String(this.existing.capacity) : '');
  protected readonly yearBuilt = signal(
    this.existing?.yearBuilt != null ? String(this.existing.yearBuilt) : '',
  );
  protected readonly error = signal<string | null>(null);

  protected readonly capacityLocked = computed(
    () =>
      !!this.existing && (!!this.existing.activeShipment || this.existing.pendingOfferCount > 0),
  );

  protected readonly valid = computed(() => {
    const cap = Number(this.capacity());
    return (
      this.name().trim().length > 0 &&
      this.registration().trim().length > 0 &&
      Number.isFinite(cap) &&
      cap > 0
    );
  });

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (!this.valid()) {
      return;
    }

    const year = this.yearBuilt().trim();

    this.context.completeWith({
      name: this.name().trim(),
      registrationNumber: this.registration().trim(),
      type: this.type(),
      capacity: Number(this.capacity()),
      yearBuilt: year.length ? Number(year) : null,
    });
  }

  protected cancel(): void {
    this.context.completeWith(null);
  }
}
