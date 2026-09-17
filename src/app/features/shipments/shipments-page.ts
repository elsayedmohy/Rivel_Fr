import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PagePlaceholder } from '../../shared/ui/page-placeholder/page-placeholder';

@Component({
  selector: 'rl-shipments-page',
  imports: [PagePlaceholder, TranslatePipe],
  template: `
    <rl-page-placeholder
      [title]="'shipments.title' | translate"
      [description]="'shipments.description' | translate"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentsPage {}