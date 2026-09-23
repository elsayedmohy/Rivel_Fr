export enum VesselType {
  Barge = 0,
  Tugboat = 1,
  SelfPropelledBarge = 2,
  PushBoat = 3,
  CargoVessel = 4,
  BulkCarrier = 5,
  ContainerBarge = 6,
  TankBarge = 7,
  RoRo = 8,
  CargoShip = 9,
  Other = 10
}

export enum VesselStatus {
  Available = "Available",
  OnTrip = "OnTrip",
  Maintenance = "Maintenance",
}

export enum ShipmentStatus {
  Matched = 0,
  PickedUp = 1,
  InTransit = 2,
  Delivered = 3,
}

export interface VesselAssignment {
  shipmentId: string;
  cargoType: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  pickupDate: string;
}

export interface Vessel {
  id: string;
  name: string;
  registrationNumber: string;
  type: VesselType;
  capacity: number;
  status: VesselStatus;
  yearBuilt: number | null;
  activeShipment: VesselAssignment | null;
  pendingOfferCount: number;
}

export interface VesselPayload {
  name: string;
  registrationNumber: string;
  type: VesselType;
  capacity: number;
  yearBuilt: number | null;
}

export const VESSEL_TYPE_KEY: Record<VesselType, string> = {
  [VesselType.Barge]: 'vessels.type.barge',
  [VesselType.Tugboat]: 'vessels.type.tugboat',
  [VesselType.SelfPropelledBarge]: 'vessels.type.SelfPropelledBarge',
  [VesselType.PushBoat]: 'vessels.type.PushBoat',
  [VesselType.CargoVessel]: 'vessels.type.CargoVessel',
  [VesselType.BulkCarrier]: 'vessels.type.BulkCarrier',
  [VesselType.ContainerBarge]: 'vessels.type.ContainerBarge',
  [VesselType.TankBarge]: 'vessels.type.TankBarge',
  [VesselType.RoRo]: 'vessels.type.RoRo',
  [VesselType.CargoShip]: 'vessels.type.cargoShip',
  [VesselType.Other]: 'vessels.type.other',
};

export const VESSEL_STATUS_KEY: Record<VesselStatus, string> = {
  [VesselStatus.Available]: 'vessels.status.available',
  [VesselStatus.OnTrip]: 'vessels.status.onTrip',
  [VesselStatus.Maintenance]: 'vessels.status.maintenance',
};

export const VESSEL_TYPES: readonly VesselType[] = [
  VesselType.Barge,
  VesselType.Tugboat,
  VesselType.SelfPropelledBarge,
  VesselType.PushBoat,
  VesselType.CargoVessel,
  VesselType.BulkCarrier,
  VesselType.ContainerBarge,
  VesselType.TankBarge,
  VesselType.RoRo,
  VesselType.CargoShip,
  VesselType.Other,
];
