import type { ShipmentRequestStatus } from '../enums';

/** GET /api/shipment-requests */
export interface ShipmentRequestDto {
  readonly id: string;
  readonly cargoType: string;
  readonly weight: number;
  readonly origin: string;
  readonly destination: string;
  readonly requestedDate: string;
  readonly status: ShipmentRequestStatus;
  readonly cargoOwnerId: string;
  readonly offersCount: number;
}

/** POST /api/shipment-requests */
export interface CreateShipmentRequestDto {
  readonly cargoType: string;
  readonly weight: number;
  readonly origin: string;
  readonly destination: string;
  readonly requestedDate: string;
}