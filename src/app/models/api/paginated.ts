/**
 * Server-side pagination contract, kept for the day the API adds query
 * params. The current backend returns full lists, so it is not wired yet.
 */
export interface ShipmentQuery {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string;
  readonly status?: string;
  readonly sort?: string;
}

export interface PaginatedResult<T> {
  readonly items: T[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}