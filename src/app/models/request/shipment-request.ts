import type { ShipmentRequestStatus } from '../enums';
import { NileBerth } from '../../features/carrier-routes/routes.model';

/** GET /api/shipment-requests */
export interface ShipmentRequestDto {
  readonly id: string;
  readonly cargoType: string;
  readonly weight: number;
  readonly originNileBerth: NileBerth;
  readonly destinationNileBerth: NileBerth;
  readonly requestedDate: string;
  readonly status: ShipmentRequestStatus;
  readonly cargoOwnerId: string;
  readonly offersCount: number;
}

/** POST /api/shipment-requests */
export interface CreateShipmentRequestDto {
  readonly cargoType: string;
  readonly weight: number;
  readonly originNileBerthId: string;
  readonly destinationNileBerthId: string;
  readonly requestedDate: string;
}
