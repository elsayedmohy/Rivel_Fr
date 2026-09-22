import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TokenService } from '../../core/http/token.service';
import { LanguageService } from '../../core/config/language.service';
import { ShipmentRequestService } from '../../core/http/shipment-request.service';
import type { ShipmentRequestDto } from '../../models/request/shipment-request';
import { RequestCard } from './components/request-card/request-card';

@Component({
  selector: 'rl-requests-page',
  imports: [RouterLink, TuiButton, TuiIcon, TranslatePipe, RequestCard],
  templateUrl: './requests-page.html',
  styleUrl: './requests-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestsPage {
  private readonly service = inject(ShipmentRequestService);
  private readonly router = inject(Router);
  private readonly user = inject(TokenService).userSignal;
  private readonly language = inject(LanguageService);

  readonly role = computed(() => this.user()?.role ?? null);
  readonly isOwner = computed(() => this.role() === 'CargoOwner');
  readonly requests = signal<ShipmentRequestDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  reload(): void {
    void this.load();
  }

  details(requestId:string) {
    this.router.navigate([`/requests/${requestId}`]);
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    const source =
      this.role() === 'CargoOwner' ? this.service.listMine() : this.service.listOpen();

    source.subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set((error as { message?: string }).message ?? 'Unknown error');
        this.loading.set(false);
      },
    });
  }
}
