import type { VesselStatus, VesselType } from '../enums';

/** GET /api/vessels — Carrier only */
export interface VesselDto {
  readonly id: string;
  readonly name: string;
  readonly type: VesselType;
  readonly registrationNumber: string;
  readonly capacity: number;
  readonly capacityUnit: string;
  readonly status: VesselStatus;
}

/** POST /api/vessels — Carrier only */
export interface CreateVesselDto {
  readonly name: string;
  readonly type: VesselType;
  readonly registrationNumber: string;
  readonly capacity: number;
}