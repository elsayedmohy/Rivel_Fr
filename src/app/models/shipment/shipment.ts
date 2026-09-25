import type { ContactDto } from '../profile/profile';
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
  /** The other party's contact details; the backend sends it only to the two parties of the shipment. */
  readonly counterpart?: ContactDto | null;
}

/** PATCH /api/shipments/{id}/status */
export interface UpdateShipmentStatusDto {
  readonly newStatus: ShipmentStatus;
}
