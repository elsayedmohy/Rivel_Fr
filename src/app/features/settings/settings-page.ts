import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PagePlaceholder } from '../../shared/ui/page-placeholder/page-placeholder';

@Component({
  selector: 'rl-settings-page',
  imports: [PagePlaceholder, TranslatePipe],
  template: `
    <rl-page-placeholder
      [title]="'settings.title' | translate"
      [description]="'settings.description' | translate"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {}