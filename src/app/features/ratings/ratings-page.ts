import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/config/language.service';
import { toApiErrorResponse } from '../../core/http/api-error.util';
import { RatingService } from '../../core/http/rating.service';
import { ShipmentService } from '../../core/http/shipment.service';
import { TokenService } from '../../core/http/token.service';
import type { CreateRatingDto, RatingDto } from '../../models/rating/rating';
import type { ShipmentDto } from '../../models/shipment/shipment';

@Component({
  selector: 'rl-ratings-page',
  imports: [ReactiveFormsModule, RouterLink, TuiButton, TuiButtonLoading, TuiIcon, TranslatePipe],
  templateUrl: './ratings-page.html',
  styleUrl: './ratings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingsPage {
  private readonly shipmentsService = inject(ShipmentService);
  private readonly ratingsService = inject(RatingService);
  private readonly language = inject(LanguageService);
  private readonly user = inject(TokenService).userSignal;

  readonly scoreOptions = [1, 2, 3, 4, 5];

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
  readonly averageScore = computed(() => {
    const ratings = this.ratings();
    if (ratings.length === 0) {
      return 0;
    }
    return ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length;
  });

  private readonly forms = new Map<string, FormGroup>();

  constructor() {
    this.reload();
  }

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
      next: (ratings) => {
        this.ratings.set(ratings);
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

  formFor(id: string): FormGroup {
    let group = this.forms.get(id);
    if (!group) {
      group = new FormGroup({
        score: new FormControl('5', { nonNullable: true }),
        comment: new FormControl('', { nonNullable: true }),
      });
      this.forms.set(id, group);
    }
    return group;
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

  routeText(origin: string, destination: string): string {
    return `${origin} → ${destination}`;
  }
}