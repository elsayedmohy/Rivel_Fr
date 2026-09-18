import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/config/language.service';
import { toApiErrorResponse } from '../../core/http/api-error.util';
import { ShipmentService } from '../../core/http/shipment.service';
import { TokenService } from '../../core/http/token.service';
import { SHIPMENT_TRANSITIONS } from '../../models/enums';
import type { ShipmentStatus } from '../../models/enums';
import type { ShipmentDto } from '../../models/shipment/shipment';

@Component({
  selector: 'rl-shipments-page',
  imports: [TuiButton, TuiButtonLoading, TuiIcon, TranslatePipe],
  templateUrl: './shipments-page.html',
  styleUrl: './shipments-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentsPage {
  private readonly service = inject(ShipmentService);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly user = inject(TokenService).userSignal;

  readonly shipments = signal<ShipmentDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly updatingId = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);

  readonly isCarrier = computed(() => this.user()?.role === 'Carrier');

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.actionError.set(null);

    this.service.list().subscribe({
      next: (shipments) => {
        this.shipments.set(shipments);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(toApiErrorResponse(error).message);
        this.loading.set(false);
      },
    });
  }

  nextStatus(shipment: ShipmentDto): ShipmentStatus | null {
    return SHIPMENT_TRANSITIONS[shipment.shipmentStatus];
  }

  advance(shipment: ShipmentDto): void {
    const next = SHIPMENT_TRANSITIONS[shipment.shipmentStatus];
    if (!next) {
      return;
    }

    this.updatingId.set(shipment.id);
    this.actionError.set(null);

    this.service.updateStatus(shipment.id, next).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.reload();
      },
      error: (error: unknown) => {
        this.updatingId.set(null);
        this.actionError.set(toApiErrorResponse(error).message);
      },
    });
  }

  weightText(weight: number): string {
    return new Intl.NumberFormat(this.language.current(), { maximumFractionDigits: 1 }).format(weight);
  }

  priceText(price: number): string {
    return new Intl.NumberFormat(this.language.current(), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  }

  statusLabel(status: ShipmentStatus): string {
    return this.translate.translate(`shipments.status.${status}`)();
  }

  advanceLabel(status: ShipmentStatus): string {
    return this.translate.translate(`shipments.action.to.${status}`)();
  }
}