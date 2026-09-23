import type { Signal } from '@angular/core';
import type { TranslateService } from '@ngx-translate/core';
import type { UserRole } from '../../models/enums';

export interface NavItem {
  readonly link: string;
  readonly icon: string;
  readonly label: Signal<string>;
  readonly roles?: readonly UserRole[];
}


export function createNavItems(translate: TranslateService, role: UserRole | null): NavItem[] {
  const t = (key: string): Signal<string> => translate.translate(key);

  const items: NavItem[] = [
    { link: '/dashboard', icon: '@tui.layout-dashboard', label: t('nav.dashboard') },
    {
      link: '/suggested',
      icon: '@tui.astroid',
      label: t('nav.suggestedRequests'),
      roles: ['Carrier'],
    },
    { link: '/requests', icon: '@tui.package', label: t('nav.requests') },
    { link: '/shipments', icon: '@tui.anchor', label: t('nav.shipments') },
    { link: '/offers', icon: '@tui.handshake', label: t('nav.offers'), roles: ['Carrier'] },

    { link: '/ratings', icon: '@tui.star', label: t('nav.ratings')},
    {
      link: '/routes',
      icon: '@tui.route',
      label: t('nav.shippingRoutes'),
      roles: ['Carrier'],
    },
    { link: '/vessels', icon: '@tui.ship', label: t('nav.vessels'), roles: ['Carrier'] },
  ];

  return role ? items.filter((item) => !item.roles?.length || item.roles.includes(role)) : items;
}
