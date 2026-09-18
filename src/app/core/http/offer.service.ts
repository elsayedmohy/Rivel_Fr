import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { CreateOfferDto, OfferDto } from '../../models/offer/offer';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly api = inject(ApiService);

  /** POST /api/shipment-requests/{id}/offers — Carrier only */
  create(requestId: string, payload: CreateOfferDto): Observable<OfferDto> {
    return this.api.post<OfferDto>(`shipment-requests/${requestId}/offers`, payload);
  }

  /** GET /api/shipment-requests/{id}/offers — request owner only */
  listForRequest(requestId: string): Observable<OfferDto[]> {
    return this.api.get<OfferDto[]>(`shipment-requests/${requestId}/offers`);
  }

  /** GET /api/offers/mine — Carrier only */
  listMine(): Observable<OfferDto[]> {
    return this.api.get<OfferDto[]>('offers/mine');
  }

  /** POST /api/offers/{id}/accept — CargoOwner only */
  accept(offerId: string): Observable<OfferDto> {
    return this.api.post<OfferDto>(`offers/${offerId}/accept`);
  }
}