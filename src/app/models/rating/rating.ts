/** GET /api/ratings/{carrierId} */
export interface RatingDto {
  readonly id: string;
  readonly shipmentId: string;
  readonly score: number;
  readonly comment?: string;
}

/** POST /api/ratings/create — CargoOwner only */
export interface CreateRatingDto {
  readonly shipmentId: string;
  readonly score: number;
  readonly comment?: string;
}