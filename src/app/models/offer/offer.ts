import type { OfferStatus } from '../enums';

/** POST/GET /api/shipment-requests/{id}/offers, GET /api/offers/mine */
export interface OfferDto {
  readonly id: string;
  readonly shipmentRequestId: string;
  readonly shipmentId: string | null;
  readonly carrierId: string;
  readonly vesselId: string;
  readonly price: number;
  readonly proposedPickupDate: string;
  readonly status: OfferStatus;
  readonly carrierName: string | null;
  readonly companyName: string | null;
}

/** POST /api/shipment-requests/{id}/offers */
export interface CreateOfferDto {
  readonly price: number;
  readonly proposedPickupDate: string;
  readonly vesselId: string;
}