export type BerthType = 'Port' | 'Terminal' | 'Dock' | 'Pier' | 'LandingSite';
export type NavigationAxis = 'CairoAswan' | 'CairoDamietta' | 'AswanWadiHalfa';
export type CoordinateAccuracy = 'Exact' | 'Approximate';

export interface NileBerth {
  id: string;
  name: string;
  arabicName: string;
  governorate: string;
  latitude: number;
  longitude: number;
  type: BerthType;
  axis: NavigationAxis;
  coordinateAccuracy: CoordinateAccuracy;
}

export interface CarrierRoute {
  id: string;
  originNileBerth: NileBerth;
  destinationNileBerth: NileBerth;
}

export interface CreateCarrierRouteDto {
  originNileBerthId: string;
  destinationNileBerthId: string;
}

export interface SuggestedRequest {
  id: string;
  cargoType: string;
  weight: number;
  pickupDate: string;
  offersCount: number;
  lowestOfferPrice: number | null;
  isNew: boolean;
  originNileBerth: NileBerth;
  destinationNileBerth: NileBerth;

  fittingVesselsCount: number;
  maxVesselCapacity: number;
}

export interface RouteFilterOption {
  routeId: string | null;
  label: string;
  count: number;
}

export interface SuggestedRequestsPage {
  items: SuggestedRequest[];
  totalCount: number;
  page: number;
  pageSize: number;
  routeFilters: RouteFilterOption[];
}

export type SuggestedSort = 'newest' | 'pickupSoonest' | 'weightAsc' | 'weightDesc';

export const BERTH_TYPE_KEY: Record<BerthType, string> = {
  Port: 'routes.berthType.Port',
  Terminal: 'routes.berthType.Terminal',
  Dock: 'routes.berthType.Dock',
  Pier: 'routes.berthType.Pier',
  LandingSite: 'routes.berthType.LandingSite',
};

export const AXIS_KEY: Record<NavigationAxis, string> = {
  CairoAswan: 'routes.axis.CairoAswan',
  CairoDamietta: 'routes.axis.CairoDamietta',
  AswanWadiHalfa: 'routes.axis.AswanWadiHalfa',
};

export const ACCURACY_KEY: Record<CoordinateAccuracy, string> = {
  Exact: 'routes.accuracy.Exact',
  Approximate: 'routes.accuracy.Approximate',
};

export const SORT_KEY: Record<SuggestedSort, string> = {
  newest: 'routes.sort.newest',
  pickupSoonest: 'routes.sort.pickupSoonest',
  weightAsc: 'routes.sort.weightAsc',
  weightDesc: 'routes.sort.weightDesc',
};
