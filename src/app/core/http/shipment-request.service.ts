import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { CreateShipmentRequestDto, ShipmentRequestDto } from '../../models/request/shipment-request';

@Injectable({ providedIn: 'root' })
export class ShipmentRequestService {
  private readonly api = inject(ApiService);

  /** GET /api/shipment-requests/open — Carrier only */
  listOpen(): Observable<ShipmentRequestDto[]> {
    return this.api.get<ShipmentRequestDto[]>('shipment-requests/open');
  }

  /** POST /api/shipment-requests — CargoOwner only */
  create(payload: CreateShipmentRequestDto): Observable<ShipmentRequestDto> {
    return this.api.post<ShipmentRequestDto>('shipment-requests', payload);
  }

  /** GET /api/shipment-requests/{id} — any authenticated user */
  getById(id: string): Observable<ShipmentRequestDto> {
    return this.api.get<ShipmentRequestDto>(`shipment-requests/${id}`);
  }

  /** GET /api/shipment-requests/mine — CargoOwner only */
  listMine(): Observable<ShipmentRequestDto[]> {
    return this.api.get<ShipmentRequestDto[]>('shipment-requests/mine');
  }
}