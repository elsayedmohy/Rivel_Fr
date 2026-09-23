import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TuiButton, TuiDialogContext, TuiIcon } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TranslatePipe } from '@ngx-translate/core';
import { BerthPickerComponent } from './berth-picker.component';
import { CreateCarrierRouteDto, NileBerth } from '../routes.model';


@Component({
  selector: 'rl-add-route-dialog',
  standalone: true,
  imports: [TuiButton, TuiIcon, BerthPickerComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dialog">
      <header class="dialog__head">
        <div>
          <h2 class="dialog__title">{{ 'routes.dialog.title' | translate }}</h2>
          <p class="dialog__sub">{{ 'routes.dialog.subtitle' | translate }}</p>
        </div>
      </header>

      <rl-berth-picker
        [label]="'routes.dialog.origin' | translate"
        [berths]="berths"
        [excludeId]="destination()?.id ?? null"
        [(value)]="origin"
      />

      <div class="dialog__swap">
        <span class="dialog__rule"></span>
        <button
          type="button"
          class="dialog__swap-btn"
          [attr.aria-label]="'routes.dialog.swap' | translate"
          [disabled]="!origin() && !destination()"
          (click)="swap()"
        >
          <tui-icon icon="@tui.repeat" [style.font-size.px]="17" />
        </button>
        <span class="dialog__rule"></span>
      </div>

      <rl-berth-picker
        [label]="'routes.dialog.destination' | translate"
        [berths]="berths"
        [excludeId]="origin()?.id ?? null"
        [(value)]="destination"
      />

      @if (error(); as message) {
        <p class="dialog__error" role="alert">{{ message | translate }}</p>
      }

      <footer class="dialog__foot">
        <button tuiButton type="button" appearance="outline" size="m" (click)="cancel()">
          {{ 'common.cancel' | translate }}
        </button>
        <button
          tuiButton
          appearance="primary"
          type="button"
          size="m"
          [disabled]="!canSave()"
          (click)="save()"
        >
          {{ 'common.save' | translate }}
        </button>
      </footer>
    </div>
  `,
  styles: [
    `
      .dialog {
        display: block;
      }

      .dialog__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 22px;
      }

      .dialog__title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--rl-ink);
      }

      .dialog__sub {
        margin: 6px 0 0;
        font-size: 13px;
        line-height: 1.6;
        color: var(--rl-ink-2);
      }

      .dialog__close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        margin: -8px -8px 0 0;
        background: transparent;
        border: none;
        border-radius: 10px;
        color: var(--rl-ink-2);
        cursor: pointer;

        &:hover {
          background: var(--rl-surface-muted);
          color: var(--rl-ink);
        }
      }

      .dialog__swap {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 14px 0;
      }

      .dialog__rule {
        flex-grow: 1;
        height: 1px;
        background: #eae4da;
      }

      .dialog__swap-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        background: var(--rl-ground);
        border: 1px solid var(--rl-border);
        border-radius: 12px;
        color: var(--rl-feature);
        cursor: pointer;

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .dialog__error {
        margin: 14px 0 0;
        padding: 11px 14px;
        background: var(--rl-clay-tint);
        color: var(--rl-clay-hover);
        border-radius: var(--rl-radius-sm);
        font-size: 13px;
        font-weight: 500;
      }

      .dialog__foot {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 22px;
      }

    `,
  ],
})
export class AddRouteDialogComponent {
  private readonly context =
    inject<TuiDialogContext<CreateCarrierRouteDto | null, NileBerth[]>>(POLYMORPHEUS_CONTEXT);

  protected readonly berths = this.context.data;

  protected origin = signal<NileBerth | null>(null);
  protected destination = signal<NileBerth | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly canSave = computed(() => {
    const from = this.origin();
    const to = this.destination();
    return !!from && !!to && from.id !== to.id;
  });

  protected swap(): void {
    const from = this.origin();
    this.origin.set(this.destination());
    this.destination.set(from);
  }

  protected save(): void {
    const from = this.origin();
    const to = this.destination();

    if (!from || !to) {
      return;
    }
    if (from.id === to.id) {
      this.error.set('routes.dialog.samePort');
      return;
    }

    this.context.completeWith({
      originNileBerthId: from.id,
      destinationNileBerthId: to.id,
    });
  }

  protected cancel(): void {
    this.context.completeWith(null);
  }
}
