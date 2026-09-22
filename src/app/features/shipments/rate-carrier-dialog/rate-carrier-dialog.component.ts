import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TuiButton, TuiDialogContext, TuiIcon } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';

export interface RateCarrierData {
  carrierName: string;
  cargoType: string;
  route: string;
}

export interface RateCarrierResult {
  score: number;
  comment?: string;
}

const MAX_COMMENT = 500;

@Component({
  selector: 'rl-rate-carrier-dialog',
  standalone: true,
  imports: [TranslatePipe, TuiButton, TuiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="dialog" (submit)="submit($event)" novalidate>
      <header class="dialog__head">
        <div>
          <p class="rl-eyebrow">{{ 'ratings.dialog.eyebrow' | translate }}</p>
          <h2 class="dialog__title">{{ data.carrierName }}</h2>
          <p class="dialog__sub">{{ data.cargoType }} · {{ data.route }}</p>
        </div>
        <button
          type="button"
          class="rl-icon-btn"
          [attr.aria-label]="'common.close' | translate"
          (click)="cancel()"
        >
          <tui-icon icon="@tui.x" />
        </button>
      </header>

      <fieldset class="stars" (mouseleave)="hovered.set(null)">
        <legend class="rl-label">{{ 'ratings.dialog.scoreLabel' | translate }}</legend>

        <div class="stars__row">
          @for (n of scale; track n) {
            <label
              class="star"
              [class.star--on]="n <= shown()"
              (mouseenter)="hovered.set(n)"
            >
              <input
                type="radio"
                name="score"
                class="star__input"
                [value]="n"
                [checked]="score() === n"
                (change)="score.set(n)"
              />
              <svg class="star__svg" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8L12 3.6Z" />
              </svg>
              <span class="sr-only">{{ n }} / 5</span>
            </label>
          }
        </div>

        <p class="stars__caption" aria-live="polite">
          @if (shown() > 0) {
            {{ ('ratings.scale.' + shown()) | translate }}
          } @else {
            {{ 'ratings.dialog.pick' | translate }}
          }
        </p>
      </fieldset>

      <div class="field">
        <label class="rl-label" for="rating-comment">
          {{ 'ratings.dialog.commentLabel' | translate }}
          <span class="field__optional">{{ 'common.optional' | translate }}</span>
        </label>
        <textarea
          id="rating-comment"
          class="field__input"
          rows="4"
          [attr.maxlength]="maxComment"
          [value]="comment()"
          (input)="onComment($event)"
          [attr.placeholder]="'ratings.dialog.commentPlaceholder' | translate"
        ></textarea>
        <span class="field__count rl-num">{{ comment().length }}/{{ maxComment }}</span>
      </div>

      <footer class="dialog__foot">
        <button tuiButton type="button" appearance="outline" size="m" (click)="cancel()">
          {{ 'common.cancel' | translate }}
        </button>
        <button tuiButton type="submit" appearance="primary" size="m" [disabled]="score() === 0">
          {{ 'ratings.dialog.submit' | translate }}
        </button>
      </footer>
    </form>
  `,
  styles: [
    `
      .dialog { display: flex; flex-direction: column; gap: var(--rl-s6); }

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

      .dialog__sub { margin: 4px 0 0; font-size: 13.5px; color: var(--rl-ink-2); }

      .stars { margin: 0; padding: 0; border: none; }

      .stars__row { display: flex; gap: var(--rl-s1); margin-top: var(--rl-s2); }

      .star {
        position: relative;
        width: 48px;
        height: 48px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--rl-r-md);
        cursor: pointer;
        color: var(--rl-line-control);
        transition: color 0.12s, transform 0.12s;

        &:hover { background: var(--rl-quiet-hover); }
        &:has(.star__input:focus-visible) { outline: 2px solid var(--rl-focus); outline-offset: 2px; }
      }

      /* برّه الـ nesting عمداً: &--on مش CSS صالح لو inlineStyleLanguage مش scss */
      .star.star--on { color: var(--rl-ink); }

      .star__input { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: pointer; }

      .star__svg {
        width: 30px;
        height: 30px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.5;
        stroke-linejoin: round;

        .star--on & { fill: currentColor; }
      }

      .stars__caption { margin: var(--rl-s2) 0 0; min-height: 20px; font-size: 13.5px; color: var(--rl-ink-2); }

      .field { position: relative; }

      .field__optional { margin-inline-start: var(--rl-s1); font-weight: 400; color: var(--rl-ink-3); }

      .field__input {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 14px 28px;
        background: var(--rl-raised);
        border: 1px solid var(--rl-line-control);
        border-radius: var(--rl-r-md);
        font-family: inherit;
        font-size: 14px;
        line-height: 22px;
        color: var(--rl-ink);
        resize: vertical;

        &::placeholder { color: var(--rl-ink-3); }
        &:focus { outline: none; border: 2px solid var(--rl-line-strong); padding: 11px 13px 27px; }
      }

      .field__count {
        position: absolute;
        inset-inline-end: 12px;
        bottom: 10px;
        font-size: 11.5px;
        font-weight: 500;
        color: var(--rl-ink-3);
      }

      .dialog__foot { display: flex; justify-content: flex-end; gap: var(--rl-s2); }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }

      @media (prefers-reduced-motion: reduce) {
        .star { transition: none; }
      }
    `,
  ],
})
export class RateCarrierDialogComponent {
  private readonly context =
    inject<TuiDialogContext<RateCarrierResult | null, RateCarrierData>>(POLYMORPHEUS_CONTEXT);

  protected readonly data = this.context.data;
  protected readonly scale = [1, 2, 3, 4, 5];
  protected readonly maxComment = MAX_COMMENT;

  protected readonly score = signal(0);
  protected readonly hovered = signal<number | null>(null);
  protected readonly comment = signal('');

  protected readonly shown = computed(() => this.hovered() ?? this.score());

  protected onComment(event: Event): void {
    this.comment.set((event.target as HTMLTextAreaElement).value.slice(0, MAX_COMMENT));
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (this.score() === 0) {
      return;
    }
    const text = this.comment().trim();
    this.context.completeWith({ score: this.score(), comment: text.length ? text : "" });
  }

  protected cancel(): void {
    this.context.completeWith(null);
  }
}
