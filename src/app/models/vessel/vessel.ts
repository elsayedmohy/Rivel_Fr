import type { VesselStatus } from '../enums';

/**
 * Frontend vessel model. Mirrors the shape of the future
 * GET /api/vessels/mine endpoint (pending backend) that the offer form
 * will consume. Until then the mock vessels service stands in for it.
 */
export interface Vessel {
  readonly id: string;
  readonly type: string;
  readonly capacity: number;
  readonly status: VesselStatus;
}