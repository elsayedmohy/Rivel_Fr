import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/config/language.service';
import { OfferService } from '../../core/http/offer.service';
import type { OfferDto } from '../../models/offer/offer';
import { RlCard } from '../../shared/components/rl-card/rl-card';

@Component({
  selector: 'rl-offers-page',
  imports: [RouterLink, TuiButton, TuiIcon, TranslatePipe, RlCard],
  templateUrl: './offers-page.html',
  styleUrl: './offers-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersPage {
  private readonly service = inject(OfferService);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);

  readonly offers = signal<OfferDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.listMine().subscribe({
      next: (offers) => {
        this.offers.set(offers);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set((error as { message?: string }).message ?? 'Unknown error');
        this.loading.set(false);
      },
    });
  }

  priceText(price: number): string {
    return new Intl.NumberFormat(this.language.current(), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  }

  statusLabel(status: OfferDto['status']): string {
    return this.translate.translate(`offers.status.${status}`)();
  }
}
