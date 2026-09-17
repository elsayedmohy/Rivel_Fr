import type { Signal } from '@angular/core';
import type { TranslateService } from '@ngx-translate/core';
import type { UserRole } from '../../models/enums';

export interface NavItem {
  readonly routerLink: string;
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
    { routerLink: '/app/dashboard', icon: '@tui.layout-dashboard', label: t('nav.dashboard') },
    { routerLink: '/app/requests', icon: '@tui.package', label: t('nav.requests') },
    { routerLink: '/app/offers', icon: '@tui.handshake', label: t('nav.offers'), roles: ['Carrier'] },
    { routerLink: '/app/vessels', icon: '@tui.ship', label: t('nav.vessels'), roles: ['Carrier'] },
    { routerLink: '/app/shipments', icon: '@tui.anchor', label: t('nav.shipments') },
    { routerLink: '/app/ratings', icon: '@tui.star', label: t('nav.ratings'), roles: ['CargoOwner'] },
  ];

  return role ? items.filter((item) => !item.roles?.length || item.roles.includes(role)) : items;
}