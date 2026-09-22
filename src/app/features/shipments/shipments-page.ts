import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TuiButton, TuiDialogService, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/config/language.service';
import { toApiErrorResponse } from '../../core/http/api-error.util';
import { ShipmentService } from '../../core/http/shipment.service';
import { TokenService } from '../../core/http/token.service';
import { SHIPMENT_TRANSITIONS } from '../../models/enums';
import type { ShipmentStatus } from '../../models/enums';
import type { ShipmentDto } from '../../models/shipment/shipment';
import { RatingService } from '../../core/http/rating.service';
import {
  RateCarrierData,
  RateCarrierDialogComponent,
  RateCarrierResult,
} from './rate-carrier-dialog/rate-carrier-dialog.component';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { EMPTY, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'rl-shipments-page',
  imports: [TuiButton, TuiButtonLoading, TuiIcon, TranslatePipe, TuiLoader],
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
  private readonly dialogs = inject(TuiDialogService);
  private readonly ratings = inject(RatingService);
  protected readonly ratingId = signal<string | null>(null);

  constructor() {
    this.reload();
  }



  protected rate(shipment: ShipmentDto): void {
    const data: RateCarrierData = {
      carrierName: shipment.carrierCompanyName,
      cargoType: shipment.cargoType,
      route: `${shipment.originNileBerth.arabicName} ← ${shipment.destinationNileBerth.arabicName}`,
    };

    this.dialogs
      .open<RateCarrierResult>(new PolymorpheusComponent(RateCarrierDialogComponent), {
        data,
        size: 's',
        dismissible: true,
      })
      .pipe(
        switchMap((result) => {
          if (!result) {
            return EMPTY;
          }
          this.ratingId.set(shipment.id);
          return this.ratings.create({ shipmentId: shipment.id, ...result });
        }),
      )
      .subscribe({
        next: (rating) => {
          this.ratingId.set(null);
          this.markRated(shipment.id, rating.score);
        },
        error: (err: HttpErrorResponse) => {
          this.ratingId.set(null);
          if (err.status === 409) {
            this.markRated(shipment.id, null);
            return;
          }
          this.actionError.set(err.error?.message ?? this.translate.instant('ratings.error'));
        },
      });
  }

  private markRated(id: string, score: number | null): void {
    // لو shipments عندك signal
    this.shipments.update((list) =>
      list.map((s) => (s.id === id ? { ...s, isRated: true, ratingScore: score } : s)),
    );
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
    return new Intl.NumberFormat(this.language.current(), { maximumFractionDigits: 1 }).format(
      weight,
    );
  }

  priceText(price: number): string {
    return new Intl.NumberFormat(this.language.current(), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  }

  statusLabel(status: string): string {
    return this.translate.translate(`shipments.status.${status}`)();
  }

  advanceLabel(status: ShipmentStatus): string {
    return this.translate.translate(`shipments.action.to.${status}`)();
  }
}
