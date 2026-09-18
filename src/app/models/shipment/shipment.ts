import type { RatingDto } from '../rating/rating';
import type { ShipmentStatus, VesselType } from '../enums';

/** GET /api/shipments, GET /api/shipments/{id} */
export interface ShipmentDto {
  readonly id: string;
  readonly shipmentStatus: ShipmentStatus;
  readonly shipmentRequestId: string;
  readonly cargoType: string;
  readonly weight: number;
  readonly origin: string;
  readonly destination: string;
  readonly requestedDate: string;
  readonly cargoOwnerId: string;
  readonly cargoOwnerName: string;
  readonly offerId: string;
  readonly offeredPrice: number;
  readonly proposedPickupDate: string;
  readonly vesselId: string;
  readonly vesselType: VesselType;
  readonly carrierCompanyName: string;
  readonly rating: RatingDto | null;
}

/** PATCH /api/shipments/{id}/status */
export interface UpdateShipmentStatusDto {
  readonly newStatus: ShipmentStatus;
}