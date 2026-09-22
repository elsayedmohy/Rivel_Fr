import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiDialogService, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/config/language.service';
import { toApiErrorResponse } from '../../core/http/api-error.util';
import { RatingService } from '../../core/http/rating.service';
import { ShipmentService } from '../../core/http/shipment.service';
import { TokenService } from '../../core/http/token.service';
import type { CreateRatingDto, RatingDto, RatingsSummary } from '../../models/rating/rating';
import type { ShipmentDto } from '../../models/shipment/shipment';
import {
  RateCarrierData,
  RateCarrierDialogComponent,
  RateCarrierResult,
} from '../shipments/rate-carrier-dialog/rate-carrier-dialog.component';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { EMPTY, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'rl-ratings-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TuiButton,
    TuiButtonLoading,
    TuiIcon,
    TranslatePipe,
    TuiLoader,
  ],
  templateUrl: './ratings-page.html',
  styleUrl: './ratings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingsPage {
  private readonly shipmentsService = inject(ShipmentService);
  private readonly ratingsService = inject(RatingService);
  private readonly language = inject(LanguageService);
  private readonly translate = inject(TranslateService);
  private readonly user = inject(TokenService).userSignal;

  readonly isOwner = computed(() => this.user()?.role === 'CargoOwner');
  readonly ownId = computed(() => this.user()?.id ?? '');

  readonly shipments = signal<ShipmentDto[]>([]);
  readonly ratings = signal<RatingDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly submittingFor = signal<string | null>(null);
  readonly formError = signal<string | null>(null);

  readonly deliveredShipments = computed(() =>
    this.shipments().filter((s) => s.shipmentStatus === 'Delivered'),
  );

  private readonly dialogs = inject(TuiDialogService);
  private readonly ratingsApi = inject(RatingService);

  protected readonly scale = [1, 2, 3, 4, 5];
  protected readonly scaleDesc = [5, 4, 3, 2, 1];

  protected readonly ratedCount = computed(
    () => this.deliveredShipments().filter((s) => !!s.rating).length,
  );

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
      .open<RateCarrierResult | null>(new PolymorpheusComponent(RateCarrierDialogComponent), {
        data,
        size: 's',
        dismissible: true,
      })
      .pipe(
        switchMap((result) => {
          if (!result) {
            return EMPTY;
          }
          this.submittingFor.set(shipment.id);
          return this.ratingsApi.create({ shipmentId: shipment.id, ...result });
        }),
      )
      .subscribe({
        next: (rating) => {
          this.submittingFor.set(null);
          this.shipments.update((list) =>
            list.map((s) => (s.id === shipment.id ? { ...s, rating } : s)),
          );
        },
        error: (err: HttpErrorResponse) => {
          this.submittingFor.set(null);
          if (err.status === 409) {
            this.reload();
            return;
          }
          this.formError.set(err.error?.message ?? this.translate.instant('ratings.error'));
        },
      });
  }


  protected readonly ratingCount = computed(
    () => this.summary()?.ratingCount ?? this.ratings().length,
  );

  protected readonly overallRating = computed(() => {
    const fromServer = this.summary()?.overallRating;
    if (fromServer != null) {
      return fromServer;
    }
    const list = this.ratings();
    return list.length ? list.reduce((sum, r) => sum + r.score, 0) / list.length : 0;
  });

  protected readonly roundedOverall = computed(() => Math.round(this.overallRating()));

  private readonly localDistribution = computed(() => {
    const map: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of this.ratings()) {
      map[r.score] = (map[r.score] ?? 0) + 1;
    }
    return map;
  });

  protected distribution(score: number): number {
    return this.summary()?.distribution?.[score] ?? this.localDistribution()[score] ?? 0;
  }

  protected readonly summary = signal<RatingsSummary | null>(null);

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.formError.set(null);

    if (this.isOwner()) {
      this.shipmentsService.list().subscribe({
        next: (shipments) => {
          this.shipments.set(shipments);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.error.set(toApiErrorResponse(error).message);
          this.loading.set(false);
        },
      });
      return;
    }

    this.ratingsService.listForCarrier(this.ownId()).subscribe({
      next: (response) => {
        this.summary.set(response);
        this.ratings.set(response.items);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        if ((error as { status?: number }).status === 404) {
          this.ratings.set([]);
        } else {
          this.error.set(toApiErrorResponse(error).message);
        }
        this.loading.set(false);
      },
    });
  }

  submit(shipment: ShipmentDto, form: FormGroup): void {
    this.formError.set(null);
    const raw = form.getRawValue();
    const payload: CreateRatingDto = {
      shipmentId: shipment.id,
      score: Number(raw.score),
      comment: raw.comment.trim() || undefined,
    };

    this.submittingFor.set(shipment.id);
    this.ratingsService.create(payload).subscribe({
      next: () => {
        this.submittingFor.set(null);
        form.reset({ score: '5', comment: '' });
        this.reload();
      },
      error: (error: unknown) => {
        this.submittingFor.set(null);
        this.formError.set(toApiErrorResponse(error).message);
      },
    });
  }

  scoreText(score: number): string {
    return new Intl.NumberFormat(this.language.current(), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(score);
  }
}

