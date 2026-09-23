
export enum NotificationType {
  OfferReceived = 'OfferReceived',
  OfferAccepted = 'OfferAccepted',
  OfferRejected = 'OfferRejected',
  OfferWithdrawn = 'OfferWithdrawn',
  RequestMatched = 'RequestMatched',
  RequestExpired = 'RequestExpired',
  ShipmentStatusChanged = 'ShipmentStatusChanged',
  ShipmentCancelled = 'ShipmentCancelled',
  RatingReceived = 'RatingReceived',
}

export const META : Record<NotificationType, { icon: string; link: (id: string) => string[] }> = {
  [NotificationType.OfferReceived]: {
    icon: '@tui.inbox',
    link: (id) => ['/requests', id],
  },
  [NotificationType.OfferAccepted]: {
    icon: '@tui.circle-check',
    link: (id) => ['/shipments', id],
  },
  [NotificationType.OfferRejected]: {
    icon: '@tui.circle-x',
    link: () => ['/offers'],
  },
  [NotificationType.OfferWithdrawn]: {
    icon: '@tui.undo-2',
    link: (id) => ['/requests', id],
  },
  [NotificationType.RequestMatched]: {
    icon: '@tui.route',
    link: () => ['/carrier/suggested'],
  },
  [NotificationType.RequestExpired]: {
    icon: '@tui.clock-alert',
    link: (id) => ['/requests', id],
  },
  [NotificationType.ShipmentStatusChanged]: {
    icon: '@tui.ship',
    link: (id) => ['/shipments', id],
  },
  [NotificationType.ShipmentCancelled]: {
    icon: '@tui.ban',
    link: (id) => ['/shipments', id],
  },
  [NotificationType.RatingReceived]: {
    icon: '@tui.star',
    link: () => ['/ratings'],
  },
};

export const FALLBACK = { icon: '@tui.bell', link: () => ['/'] };

export const LOCALE = 'ar-EG-u-nu-latn';

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T|$)/;
