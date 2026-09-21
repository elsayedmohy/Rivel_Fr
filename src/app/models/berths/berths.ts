import { BerthType, CoordinateAccuracy, NavigationAxis } from '../enums';

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
  isActive: boolean;
}
