import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TokenService } from '../../core/http/token.service';
import { LanguageService } from '../../core/config/language.service';
import { ShipmentRequestService } from '../../core/http/shipment-request.service';
import type { ShipmentRequestDto } from '../../models/request/shipment-request';
import type { ShipmentRequestStatus } from '../../models/enums';

@Component({
  selector: 'rl-requests-page',
  imports: [RouterLink, TuiButton, TuiIcon, TranslatePipe],
  templateUrl: './requests-page.html',
  styleUrl: './requests-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestsPage {
  private readonly service = inject(ShipmentRequestService);
  private readonly user = inject(TokenService).userSignal;
  private readonly translate = inject(TranslateService);
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

  weightText(weight: number): string {
    return new Intl.NumberFormat(this.language.current(), {
      maximumFractionDigits: 1,
    }).format(weight);
  }

  statusLabel(status: ShipmentRequestStatus): string {
    return this.translate.translate(`requests.status.${status}`)();
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