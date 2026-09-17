import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

/** Temporary empty-state shown for features not yet built (Phases 2-6). */
@Component({
  selector: 'rl-page-placeholder',
  imports: [TuiIcon],
  template: `
    <section class="grid h-full min-h-[60vh] place-content-center gap-3 px-4 text-center">
      <tui-icon [icon]="'@tui.package'" class="placeholder-icon mx-auto text-primary" />
      <h1 class="text-2xl font-bold">{{ title() }}</h1>
      @if (description(); as text) {
        <p class="mx-auto max-w-md text-secondary">{{ text }}</p>
      }
      <span class="mx-auto mt-2 rounded-full border border-border px-3 py-1 text-xs text-secondary">
        Phase 1 placeholder
      </span>
    </section>
  `,
  styles: [
    `
      .placeholder-icon {
        font-size: 3rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagePlaceholder {
  readonly title = input.required<string>();
  readonly description = input<string>('');
}