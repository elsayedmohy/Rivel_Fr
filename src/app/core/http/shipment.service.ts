import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { ShipmentDto, UpdateShipmentStatusDto } from '../../models/shipment/shipment';
import type { ShipmentStatus } from '../../models/enums';

@Injectable({ providedIn: 'root' })
export class ShipmentService {
  private readonly api = inject(ApiService);

  /** GET /api/shipments — cargo owner's or vessel owner's shipments */
  list(): Observable<ShipmentDto[]> {
    return this.api.get<ShipmentDto[]>('shipments');
  }

  /** GET /api/shipments/{id} */
  getById(id: string): Observable<ShipmentDto> {
    return this.api.get<ShipmentDto>(`shipments/${id}`);
  }

  /** PATCH /api/shipments/{id}/status — Carrier only */
  updateStatus(id: string, newStatus: ShipmentStatus): Observable<ShipmentDto> {
    const payload: UpdateShipmentStatusDto = { newStatus };
    return this.api.patch<ShipmentDto>(`shipments/${id}/status`, payload);
  }
}