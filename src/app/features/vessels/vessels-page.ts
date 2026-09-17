import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PagePlaceholder } from '../../shared/ui/page-placeholder/page-placeholder';

@Component({
  selector: 'rl-vessels-page',
  imports: [PagePlaceholder, TranslatePipe],
  template: `
    <rl-page-placeholder
      [title]="'vessels.title' | translate"
      [description]="'vessels.description' | translate"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VesselsPage {}