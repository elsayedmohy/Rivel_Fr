import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PagePlaceholder } from '../../shared/ui/page-placeholder/page-placeholder';

@Component({
  selector: 'rl-requests-page',
  imports: [PagePlaceholder, TranslatePipe],
  template: `
    <rl-page-placeholder
      [title]="'requests.title' | translate"
      [description]="'requests.description' | translate"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestsPage {}