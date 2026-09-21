import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiIcon, TuiInput, TuiLoader } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../core/config/language.service';
import { TokenService } from '../../../core/http/token.service';
import { ShipmentRequestService } from '../../../core/http/shipment-request.service';
import { OfferService } from '../../../core/http/offer.service';
import { VesselService } from '../../../core/http/vessel.service';
import type { ShipmentRequestDto } from '../../../models/request/shipment-request';
import type { CreateOfferDto, OfferDto } from '../../../models/offer/offer';
import type { ShipmentRequestStatus, VesselStatus } from '../../../models/enums';
import type { VesselDto } from '../../../models/vessel/vessel';

@Component({
  selector: 'rl-request-detail-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TuiButton,
    TuiButtonLoading,
    TuiError,
    TuiIcon,
    TuiInput,
    TranslatePipe,
    TuiLoader,
  ],
  templateUrl: './request-detail-page.html',
  styleUrl: './request-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly requestsService = inject(ShipmentRequestService);
  private readonly offersService = inject(OfferService);
  private readonly vesselService = inject(VesselService);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly user = inject(TokenService).userSignal;

  readonly request = signal<ShipmentRequestDto | null>(null);
  readonly offers = signal<OfferDto[]>([]);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly error = signal<string | null>(null);
  readonly offersLoading = signal(false);
  readonly offersError = signal<string | null>(null);
  readonly acceptingId = signal<string | null>(null);

  readonly vessels = signal<VesselDto[]>([]);
  readonly vesselsLoading = signal(false);
  readonly minDate = today();
  readonly offerForm = new FormGroup({
    price: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, greaterThanZero],
    }),
    proposedPickupDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    vesselId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly offerSubmitting = signal(false);
  readonly offerError = signal<string | null>(null);
  readonly offerSuccess = signal(false);

  readonly isOwner = computed(() => this.user()?.role === 'CargoOwner');
  readonly isCarrier = computed(() => this.user()?.role === 'Carrier');
  readonly requestIsOpen = computed(() => this.request()?.status === 'Open');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    if (this.isCarrier()) {
      void this.loadVessels();
    }
    void this.load(id);
  }

  reload(): void {
    const id = this.request()?.id;
    if (id) {
      void this.load(id);
    }
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

  requestStatusLabel(status: ShipmentRequestStatus): string {
    return this.translate.translate(`requests.status.${status}`)();
  }

  offerStatusLabel(status: OfferDto['status']): string {
    return this.translate.translate(`offers.status.${status}`)();
  }

  vesselStatusLabel(status: VesselStatus): string {
    return this.translate.translate(`vessels.status.${status}`)();
  }

  offerFieldError(key: 'price' | 'proposedPickupDate' | 'vesselId'): string | null {
    const control = this.offerForm.controls[key];
    if (control.invalid && control.errors) {
      const first = Object.keys(control.errors)[0];
      return this.translate.translate(`auth.validation.${first}`)();
    }
    return null;
  }

  submitOffer(): void {
    const request = this.request();
    if (!request) {
      return;
    }

    this.offerError.set(null);
    this.offerSuccess.set(false);
    this.offerForm.markAllAsTouched();

    if (this.offerForm.invalid) {
      return;
    }

    this.offerSubmitting.set(true);
    const raw = this.offerForm.getRawValue();
    const payload: CreateOfferDto = {
      price: Number(raw.price),
      proposedPickupDate: raw.proposedPickupDate,
      vesselId: raw.vesselId,
    };

    this.offersService.create(request.id, payload).subscribe({
      next: () => {
        this.offerSubmitting.set(false);
        this.offerSuccess.set(true);
        this.offerForm.reset({ vesselId: '', price: '', proposedPickupDate: '' });
      },
      error: (error: unknown) => {
        this.offerSubmitting.set(false);
        this.offerError.set((error as { message?: string }).message ?? 'Unknown error');
      },
    });
  }

  accept(offer: OfferDto): void {
    this.acceptingId.set(offer.id);
    this.offersError.set(null);

    this.offersService.accept(offer.id).subscribe({
      next: () => {
        const requestId = this.request()?.id;
        this.acceptingId.set(null);
        if (requestId) {
          void this.refreshBoth(requestId);
        }
      },
      error: (error: unknown) => {
        this.acceptingId.set(null);
        this.offersError.set((error as { message?: string }).message ?? 'Unknown error');
      },
    });
  }

  private load(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.requestsService.getById(id).subscribe({
      next: (request) => {
        this.request.set(request);
        this.loading.set(false);
        if (this.isOwner()) {
          void this.loadOffers(id);
        }
      },
      error: (error: unknown) => {
        const status = (error as { status?: number }).status;
        this.notFound.set(status === 404);
        this.error.set((error as { message?: string }).message ?? 'Unknown error');
        this.loading.set(false);
      },
    });
  }

  private loadOffers(requestId: string): void {
    this.offersLoading.set(true);
    this.offersError.set(null);

    this.offersService.listForRequest(requestId).subscribe({
      next: (offers) => {
        this.offers.set(offers);
        this.offersLoading.set(false);
      },
      error: (error: unknown) => {
        this.offersError.set((error as { message?: string }).message ?? 'Unknown error');
        this.offersLoading.set(false);
      },
    });
  }

  private loadVessels(): void {
    this.vesselsLoading.set(true);

    this.vesselService.list().subscribe({
      next: (vessels) => {
        this.vessels.set(vessels);
        this.vesselsLoading.set(false);
      },
      error: () => {
        this.vesselsLoading.set(false);
      },
    });
  }

  private refreshBoth(requestId: string): void {
    this.requestsService.getById(requestId).subscribe({
      next: (request) => this.request.set(request),
    });
    this.loadOffers(requestId);
  }
}

function greaterThanZero(control: { value: unknown }): Record<string, boolean> | null {
  const value = Number(control.value);
  if (control.value === '' || Number.isNaN(value)) {
    return null;
  }
  return value > 0 ? null : { greaterThanZero: true };
}

function today(): string {
  const value = new Date();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}
