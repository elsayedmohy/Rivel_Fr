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

export const BERTH_TYPE_LABEL: Record<BerthType, string> = {
  Port: 'ميناء',
  Terminal: 'محطة',
  Dock: 'رصيف',
  Pier: 'رصيف بحري',
  LandingSite: 'مرسى',
};

export const AXIS_LABEL: Record<NavigationAxis, string> = {
  CairoAswan: 'محور القاهرة – أسوان',
  CairoDamietta: 'محور القاهرة – دمياط',
  AswanWadiHalfa: 'محور أسوان – وادي حلفا',
};

export const ACCURACY_LABEL: Record<CoordinateAccuracy, string> = {
  Exact: 'إحداثيات دقيقة',
  Approximate: 'إحداثيات تقريبية',
};

export const SORT_LABEL: Record<SuggestedSort, string> = {
  newest: 'الأحدث',
  pickupSoonest: 'الأقرب استلامًا',
  weightAsc: 'الأقل وزنًا',
  weightDesc: 'الأكبر وزنًا',
};

export function berthLine(berth: NileBerth): string {
  return `${BERTH_TYPE_LABEL[berth.type]} · محافظة ${berth.governorate}`;
}

export function routeLabel(route: CarrierRoute): string {
  return `${route.originNileBerth.arabicName} ← ${route.destinationNileBerth.arabicName}`;
}
