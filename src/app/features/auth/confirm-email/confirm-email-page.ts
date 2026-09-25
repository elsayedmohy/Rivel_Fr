import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/http/auth.service';

@Component({
  selector: 'rl-confirm-email-page',
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../login/login-page.scss',
  template: `
    <main class="page">
      <section class="card">
        <div class="headings"><h2>{{ 'auth.confirm.title' | translate }}</h2></div>

        @switch (state()) {
          @case ('pending') { <p role="status">{{ 'common.loading' | translate }}</p> }
          @case ('ok') { <p role="status">{{ 'auth.confirm.ok' | translate }}</p> }
          @default { <div class="error-box" role="alert"><p>{{ 'auth.confirm.failed' | translate }}</p></div> }
        }

        <p class="switch"><a routerLink="/dashboard">{{ 'auth.confirm.continue' | translate }}</a></p>
      </section>
    </main>
  `,
})
export class ConfirmEmailPage {
  protected readonly state = signal<'pending' | 'ok' | 'failed'>('pending');

  constructor() {
    const params = inject(ActivatedRoute).snapshot.queryParamMap;
    const userId = params.get('userId');
    const token = params.get('token');

    if (!userId || !token) {
      this.state.set('failed');
      return;
    }
    inject(AuthService)
      .confirmEmail({ userId, token })
      .subscribe({
        next: () => this.state.set('ok'),
        error: () => this.state.set('failed'),
      });
  }
}
