import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import {
  ACCURACY_KEY,
  AXIS_KEY,
  BERTH_TYPE_KEY,
  NavigationAxis,
  NileBerth,
} from '../routes.model';

interface BerthGroup {
  axis: NavigationAxis;
  label: string;
  berths: NileBerth[];
}

@Component({
  selector: 'rl-berth-picker',
  standalone: true,
  imports: [TuiIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(keydown.escape)': 'close()',
  },
  template: `
    <div class="picker">
      @if (label()) {
        <label class="picker__label" [attr.for]="inputId">{{ label() }}</label>
      }

      <div class="picker__field" [class.picker__field--open]="open()">
        <span class="picker__dot" [class.picker__dot--filled]="!!value()"></span>

        <input
          [id]="inputId"
          class="picker__input"
          type="text"
          role="combobox"
          autocomplete="off"
          [attr.aria-expanded]="open()"
          [attr.aria-controls]="listId"
          [placeholder]="placeholder() | translate"
          [value]="displayText()"
          (input)="onInput($event)"
          (focus)="open.set(true)"
        />

        @if (value() && !open()) {
          <button
            type="button"
            class="picker__clear"
            [attr.aria-label]="'routes.picker.clear' | translate: { name: value()!.arabicName }"
            (click)="clear()"
          >
            <tui-icon icon="@tui.x" [style.font-size.px]="16" />
          </button>
        }

        <tui-icon
          class="picker__chevron"
          [icon]="open() ? '@tui.chevron-up' : '@tui.chevron-down'"
          [style.font-size.px]="16"
        />
      </div>

      @if (open()) {
        <div class="picker__dropdown" [id]="listId" role="listbox">
          @for (group of groups(); track group.axis) {
            <div class="picker__group-label">{{ group.label }}</div>

            @for (berth of group.berths; track berth.id) {
              <button
                type="button"
                role="option"
                class="picker__option"
                [class.picker__option--active]="berth.id === value()?.id"
                [attr.aria-selected]="berth.id === value()?.id"
                (click)="select(berth)"
              >
                <span
                  class="picker__option-dot"
                  [class.picker__option-dot--active]="berth.id === value()?.id"
                ></span>

                <span class="picker__option-body">
                  <span class="picker__option-name">{{ berth.arabicName }}</span>
                  <span class="picker__option-meta">
                    {{ typeLabel(berth) }} · {{ 'common.governorate' | translate }} {{ berth.governorate }}
                  </span>
                </span>

                <span
                  class="rl-chip"
                  [class.rl-chip--axis]="berth.coordinateAccuracy === 'Exact'"
                  [class.picker__chip-soft]="berth.coordinateAccuracy !== 'Exact'"
                >
                  {{ accuracyLabel(berth) }}
                </span>
              </button>
            } @empty {
              <p class="picker__no-results">{{ 'common.noResults' | translate }}</p>
            }
          } @empty {
            <p class="picker__no-results">{{ 'routes.picker.noBerth' | translate }}</p>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
      }

      .picker__label {
        display: block;
        font-size: 12.5px;
        font-weight: 600;
        color: var(--rl-ink);
        margin-bottom: 7px;
      }

      .picker__field {
        position: relative;
        display: flex;
        align-items: center;
        height: 48px;
        padding-inline: 14px 12px;
        background: var(--tui-background-base);
        border: 1px solid var(--rl-border-strong);
        border-radius: 11px;
        transition: border-color 0.15s;

        &--open {
          border: 2px solid var(--rl-feature);
          padding-inline: 13px 11px;
        }
      }

      .picker__dot {
        width: 8px;
        height: 8px;
        flex-shrink: 0;
        border-radius: 50%;
        background: var(--rl-rule);
        margin-inline-end: 10px;

        &--filled {
          background: var(--rl-feature);
        }
      }

      .picker__input {
        flex-grow: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        font-family: inherit;
        font-size: 14px;
        color: var(--tui-text-tertiary);

        &::placeholder {
          color: var(--rl-ink-3);
        }
      }

      .picker__clear,
      .picker__chevron {
        flex-shrink: 0;
        color: var(--rl-ink-3);
      }

      .picker__clear {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        margin-inline-end: 2px;
        background: transparent;
        border: none;
        border-radius: 8px;
        cursor: pointer;

        &:hover {
          background: var(--rl-surface-muted);
          color: var(--rl-ink-3);
        }
      }

      .picker__dropdown {
        position: absolute;
        inset-inline: 0;
        top: calc(100% + 6px);
        z-index: 20;
        max-height: 280px;
        overflow-y: auto;
        padding: 6px;
        background: var(--tui-background-base);
        border: 1px solid var(--tui-border-normal);
        border-radius: 12px;
        box-shadow: var(--tui-shadow-card);
      }

      .picker__group-label {
        padding: 8px 12px 6px;
        font-size: 11px;
        font-weight: 600;
        color: var(--rl-ink-3);
      }

      .picker__option {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        box-sizing: border-box;
        padding: 10px 12px;
        text-align: start;
        background: transparent;
        border: none;
        border-radius: 9px;
        cursor: pointer;
        font-family: inherit;

        &:hover,
        &--active {
          background: var(--rl-line-subtle);
        }
      }

      .picker__option-dot {
        width: 8px;
        height: 8px;
        flex-shrink: 0;
        border-radius: 50%;
        background: #c7bfb1;

        &--active {
          background: var(--rl-feature);
        }
      }

      .picker__option-body {
        flex-grow: 1;
        min-width: 0;
      }

      .picker__option-name {
        display: block;
        font-size: 14.5px;
        font-weight: 600;
        color: var(--rl-ink);
      }

      .picker__option-meta {
        display: block;
        margin-top: 2px;
        font-size: 12px;
        color: var(--rl-ink-2);
      }

      .picker__chip-soft {
        color: var(--rl-ink-2);
      }

      .picker__no-results {
        margin: 0;
        padding: 16px 12px;
        font-size: 13px;
        color: var(--rl-ink-3);
        text-align: center;
      }
    `,
  ],
})
export class BerthPickerComponent {
  private static nextId = 0;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly translate = inject(TranslateService);

  readonly berths = input.required<NileBerth[]>();
  readonly label = input('');
  readonly placeholder = input('routes.picker.placeholder');
  readonly excludeId = input<string | null>(null);

  readonly value = model<NileBerth | null>(null);

  protected readonly open = signal(false);
  protected readonly query = signal('');

  protected readonly inputId = `rl-berth-${BerthPickerComponent.nextId++}`;
  protected readonly listId = `${this.inputId}-list`;

  protected readonly displayText = computed(() =>
    this.open() ? this.query() : (this.value()?.arabicName ?? ''),
  );

  protected readonly groups = computed<BerthGroup[]>(() => {
    const term = this.query().trim();
    const excluded = this.excludeId();

    const matches = this.berths().filter(
      (b) =>
        b.id !== excluded && (!term || b.arabicName.includes(term) || b.governorate.includes(term)),
    );

    const byAxis = new Map<NavigationAxis, NileBerth[]>();
    for (const berth of matches) {
      const bucket = byAxis.get(berth.axis) ?? [];
      bucket.push(berth);
      byAxis.set(berth.axis, bucket);
    }

    return [...byAxis.entries()].map(([axis, berths]) => ({
      axis,
      label: this.translate.translate(AXIS_KEY[axis])(),
      berths,
    }));
  });

  protected typeLabel(berth: NileBerth): string {
    return this.translate.translate(BERTH_TYPE_KEY[berth.type])();
  }

  protected accuracyLabel(berth: NileBerth): string {
    return this.translate.translate(ACCURACY_KEY[berth.coordinateAccuracy])();
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.open.set(true);
  }

  protected select(berth: NileBerth): void {
    this.value.set(berth);
    this.query.set('');
    this.open.set(false);
  }

  protected clear(): void {
    this.value.set(null);
    this.query.set('');
  }

  protected close(): void {
    this.query.set('');
    this.open.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
