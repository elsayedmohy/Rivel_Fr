import type { RatingDto } from '../rating/rating';
import type { ShipmentStatus, VesselType } from '../enums';
import { NileBerth } from '../../features/carrier-routes/routes.model';

/** GET /api/shipments, GET /api/shipments/{id} */
export interface ShipmentDto {
  readonly id: string;
  readonly shipmentStatus: ShipmentStatus;
  readonly shipmentRequestId: string;
  readonly cargoType: string;
  readonly weight: number;
  readonly originNileBerth: NileBerth;
  readonly destinationNileBerth: NileBerth;
  readonly requestedDate: string;
  readonly cargoOwnerId: string;
  readonly cargoOwnerName: string;
  readonly offerId: string;
  readonly offeredPrice: number;
  readonly proposedPickupDate: string;
  readonly vesselId: string;
  readonly vesselType: VesselType;
  readonly carrierCompanyName: string;
  readonly isRated: boolean;
  readonly rating: RatingDto | null;
}

/** PATCH /api/shipments/{id}/status */
export interface UpdateShipmentStatusDto {
  readonly newStatus: ShipmentStatus;
}
