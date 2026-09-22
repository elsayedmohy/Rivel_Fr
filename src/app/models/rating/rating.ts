/** GET /api/ratings/{carrierId} */
export interface RatingDto {
  readonly id: string;
  readonly shipmentId: string;
  readonly score: number;
  readonly origin: string;
  readonly destination: string;
  readonly createdAt: Date;
  readonly cargoType?: string;
  readonly cargoOwnerName?: string;
  readonly comment?: string;
}

/** POST /api/ratings/create — CargoOwner only */
export interface CreateRatingDto {
  readonly shipmentId: string;
  readonly score: number;
  readonly comment?: string;
}
export interface RatingsSummary {
  overallRating: number;
  ratingCount: number;
  distribution: Record<number, number>;
}


export interface RatingsResponseDto {
  overallRating: number;
  ratingCount: number;
  items: RatingDto[];
  distribution: Record<number, number>;
}
