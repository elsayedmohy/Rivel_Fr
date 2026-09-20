export interface Environment {
  readonly production: boolean;
  readonly apiBaseUrl: string;
  readonly notificationBaseUrl: string;
}

export const environment: Environment = {
  production: true,
  apiBaseUrl: 'https://rivel.runasp.net/api',
  notificationBaseUrl: 'https://rivel.runasp.net',
};
