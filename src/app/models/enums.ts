export type UserRole = 'CargoOwner' | 'Carrier';

export type ShipmentRequestStatus = 'Open' | 'Matched' | 'Closed';
export type OfferStatus = 'Pending' | 'Accepted' | 'Rejected';
export type ShipmentStatus = 'Matched' | 'PickedUp' | 'InTransit' | 'Delivered';
export type VesselStatus = 'Available' | 'OnTrip' | 'Maintenance';

export type VesselType =
  | 'Barge'
  | 'SelfPropelledBarge'
  | 'Tugboat'
  | 'PushBoat'
  | 'CargoVessel'
  | 'BulkCarrier'
  | 'ContainerBarge'
  | 'TankBarge'
  | 'RoRo';

export type Theme = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'ar';

export const USER_ROLES = ['CargoOwner', 'Carrier'] as const satisfies readonly UserRole[];

export const SHIPMENT_REQUEST_STATUSES = [
  'Open',
  'Matched',
  'Closed',
] as const satisfies readonly ShipmentRequestStatus[];

export const OFFER_STATUSES = ['Pending', 'Accepted', 'Rejected'] as const satisfies readonly OfferStatus[];

export const SHIPMENT_STATUSES = [
  'Matched',
  'PickedUp',
  'InTransit',
  'Delivered',
] as const satisfies readonly ShipmentStatus[];

export const VESSEL_STATUSES = ['Available', 'OnTrip'] as const satisfies readonly VesselStatus[];

export const VESSEL_TYPES = [
  'Barge',
  'SelfPropelledBarge',
  'Tugboat',
  'PushBoat',
  'CargoVessel',
  'BulkCarrier',
  'ContainerBarge',
  'TankBarge',
  'RoRo',
] as const satisfies readonly VesselType[];

export const SHIPMENT_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus | null> = {
  Matched: 'PickedUp',
  PickedUp: 'InTransit',
  InTransit: 'Delivered',
  Delivered: null,
};

export const PHONE_PATTERN = /^\+?[0-9٠-٩۰-۹\s-]{7,20}$/;

export const CARGO_TYPES = ['General', 'Food', 'Agricultural', 'Construction', 'Liquid', 'Other'] as const;

export enum BerthType {
  Port = 'Port',
  Terminal = 'Terminal',
  Dock = 'Dock',
  Pier = 'Pier',
  LandingSite = 'LandingSite',
}

export enum NavigationAxis {
  CairoAswan = 'CairoAswan',
  CairoDamietta = 'CairoDamietta',
  AswanWadiHalfa = 'AswanWadiHalfa',
}

export enum CoordinateAccuracy {
  Exact = 'Exact',
  Approximate = 'Approximate',
}
