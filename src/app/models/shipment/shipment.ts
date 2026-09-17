import type { ShipmentStatus } from '../enums';

/** GET /api/shipments/{id} */
export interface ShipmentDto {
  readonly id: string;
  readonly shipmentRequestId: string;
  readonly offerId: string;
  readonly vesselId: string;
  readonly shipmentStatus: ShipmentStatus;
}

/** PATCH /api/shipments/{id}/status */
export interface UpdateShipmentStatusDto {
  readonly newStatus: ShipmentStatus;
}