import type { Signal } from '@angular/core';
import type { TranslateService } from '@ngx-translate/core';
import type { UserRole } from '../../models/enums';

export interface NavItem {
  readonly link: string;
  readonly icon: string;
  readonly label: Signal<string>;
  readonly roles?: readonly UserRole[];
}

/**
 * Builds the app navigation. When a role is provided the list is filtered so
 * carrier-only items (offers, vessels) and owner-only items (ratings) do not
 * leak across roles. With no session (null) everything is shown so the pre-login
 * state still renders.
 */
export function createNavItems(translate: TranslateService, role: UserRole | null): NavItem[] {
  const t = (key: string): Signal<string> => translate.translate(key);

  const items: NavItem[] = [
    { link: '/dashboard', icon: '@tui.layout-dashboard', label: t('nav.dashboard') },
    { link: '/requests', icon: '@tui.package', label: t('nav.requests') },
    { link: '/offers', icon: '@tui.handshake', label: t('nav.offers'), roles: ['Carrier'] },
    { link: '/vessels', icon: '@tui.ship', label: t('nav.vessels'), roles: ['Carrier'] },
    { link: '/shipments', icon: '@tui.anchor', label: t('nav.shipments') },
    { link: '/ratings', icon: '@tui.star', label: t('nav.ratings'), roles: ['CargoOwner'] },
    { link: '/carrier-routes', icon: '@tui.route', label: t('nav.shippingRoutes'), roles: ['Carrier'] },
    { link: '/suggested-requests', icon: '@tui.route', label: t('nav.shippingRoutes'), roles: ['Carrier'] },
  ];

  return role ? items.filter((item) => !item.roles?.length || item.roles.includes(role)) : items;
}
