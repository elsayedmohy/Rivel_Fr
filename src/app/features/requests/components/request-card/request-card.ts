import { Component, computed, inject, input, output } from '@angular/core';
import { AXIS_LABEL, BERTH_TYPE_LABEL, CarrierRoute, NileBerth } from '../../../carrier-routes/routes.model';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { ShipmentRequestDto } from '../../../../models/request/shipment-request';
import { ShipmentRequestStatus } from '../../../../models/enums';
import { LanguageService } from '../../../../core/config/language.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  imports: [TuiIcon, TranslatePipe, DatePipe, DecimalPipe, TuiButton],
  selector: 'request-card',
  styleUrl: './request-card.scss',
  templateUrl: './request-card.html',
})
export class RequestCard {
  private readonly translate = inject(TranslateService);
  readonly request = input.required<ShipmentRequestDto>();
  readonly deleting = input(false);
  private readonly language = inject(LanguageService);
  readonly details = output<string>();
  readonly remove = output<string>();

  protected originName(): string {
    return this.request().originNileBerth.arabicName;
  }

  protected destinationName(): string {
    return this.request().destinationNileBerth.arabicName;
  }

  protected axisLabel(): string {
    return AXIS_LABEL[this.request().originNileBerth?.axis];
  }

  protected meta(berth: NileBerth): string {
    return `${BERTH_TYPE_LABEL[berth.type]} · محافظة ${berth.governorate}`;
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
    if (count === 0) return 'لا عروض بعد';
    if (count === 1) return 'عرض واحد';
    if (count === 2) return 'عرضان';
    return `${count} عروض `;
  });

  protected readonly berthPair = computed(
    () =>
      `${BERTH_TYPE_LABEL[this.request().originNileBerth.type]} ← ${
        BERTH_TYPE_LABEL[this.request().destinationNileBerth.type]
      }`,
  );
}
