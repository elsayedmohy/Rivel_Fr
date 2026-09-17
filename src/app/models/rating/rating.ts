/** POST /api/shipments/{id}/rating */
export interface RatingDto {
  readonly id: string;
  readonly shipmentId: string;
  readonly score: number;
  readonly comment?: string;
}

export interface CreateRatingDto {
  readonly score: number;
  readonly comment?: string;
}