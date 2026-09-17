import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PagePlaceholder } from '../../shared/ui/page-placeholder/page-placeholder';

@Component({
  selector: 'rl-offers-page',
  imports: [PagePlaceholder, TranslatePipe],
  template: `
    <rl-page-placeholder
      [title]="'offers.title' | translate"
      [description]="'offers.description' | translate"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersPage {}