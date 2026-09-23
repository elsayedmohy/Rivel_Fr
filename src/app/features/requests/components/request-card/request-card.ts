import { Component, computed, inject, input, output } from '@angular/core';
import { AXIS_KEY, BERTH_TYPE_KEY, NileBerth } from '../../../carrier-routes/routes.model';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { ShipmentRequestDto } from '../../../../models/request/shipment-request';
import { ShipmentRequestStatus } from '../../../../models/enums';
import { LanguageService } from '../../../../core/config/language.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  imports: [TuiIcon, DatePipe, DecimalPipe, TuiButton, TranslatePipe],
  selector: 'request-card',
  styleUrl: './request-card.scss',
  templateUrl: './request-card.html',
})
export class RequestCard {
  private readonly translate = inject(TranslateService);
  readonly request = input.required<ShipmentRequestDto>();
  readonly deleting = input(false);
  protected readonly language = inject(LanguageService);
  readonly details = output<string>();
  readonly remove = output<string>();

  protected axisLabel(): string {
    return this.translate.translate(AXIS_KEY[this.request().originNileBerth?.axis])();
  }

  protected meta(berth: NileBerth): string {
    return this.translate.translate('routes.berthMeta', {
      type: this.translate.instant(BERTH_TYPE_KEY[berth.type]),
      governorate: berth.governorate,
    })();
  }
  statusLabel(status: ShipmentRequestStatus): string {
    return this.translate.translate(`requests.status.${status}`)();
  }

  weightText(weight: number): string {
    return new Intl.NumberFormat(this.language.current(), {
      maximumFractionDigits: 1,
    }).format(weight);
  }

  protected readonly offersLabel = computed(() => {
    const count = this.request().offersCount;
    if (count === 0) return this.translate.translate('offers.count.zero')();
    if (count === 1) return this.translate.translate('offers.count.one')();
    if (count === 2) return this.translate.translate('offers.count.two')();
    return this.translate.translate('offers.count.many', { count: String(count) })();
  });

  protected readonly berthPair = computed(
    () =>
      `${this.translate.instant(BERTH_TYPE_KEY[this.request().originNileBerth.type])} ← ${
        this.translate.instant(BERTH_TYPE_KEY[this.request().destinationNileBerth.type])
      }`,
  );
}
