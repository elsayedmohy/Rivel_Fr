# Rivel 🚢

Rivel is the web frontend for a two-sided freight marketplace for Nile river shipping. It connects **Cargo Owners**, who need to move goods, with **Carriers**, who operate vessels. Cargo owners post shipment requests. Carriers browse open requests (or requests suggested from their saved routes) and submit offers. The cargo owner accepts one offer, which creates a shipment. The carrier then moves the shipment through its lifecycle, and once it is delivered the cargo owner can rate the carrier. The UI is bilingual (English / Arabic with RTL) and supports light and dark themes.

This repository contains **only the Angular client**.
The  **backend API** lives in a separate repository [`Rivel`](https://github.com/elsayedmohy/Rivel).


🌐 **Live app:** [rivel.site](https://www.rivel.site/) &nbsp;|&nbsp; 🔌 **API/Swagger:** [rivel.runasp.net/swagger](https://rivel.runasp.net/swagger)


---

## Tech Stack

- **Angular 22**: standalone components, signals, lazy-loaded feature routes (`@angular/build` application builder)
- **Taiga UI 5** (`@taiga-ui/core`, `kit`, `cdk`, `icons`): component library and theming
- **Tailwind CSS 4** via PostCSS, plus SCSS
- **@ngx-translate**: i18n loaded from `src/assets/i18n/{en,ar}.json`
- **@microsoft/signalr**: real-time notifications
- **RxJS 7.8**, **TypeScript 6**
- **Vitest + jsdom**: unit tests run through `ng test`
- **Prettier** for formatting
- Deployed on **Vercel** (the project is linked locally through `.vercel/`, which is git-ignored)

---

## Roles

| Role | What the UI lets them do |
|---|---|
| **CargoOwner** | Create shipment requests · Review and accept offers · Track shipments · Rate carriers |
| **Carrier** | Manage vessels · Manage shipping routes · See suggested requests · Submit offers · Advance shipment status |

Role-only pages are protected by `roleGuard`. The sidebar only shows the items that match the signed-in user's role (`src/app/core/config/nav.ts`).

---

## Features

**Authentication** (`/auth/*`)
- Login, register, forgot password, reset password, email confirmation, and resending the confirmation email
- The JWT access token and refresh token are stored in `localStorage` and attached as a `Bearer` header by `authInterceptor`
- On a `401`, `errorInterceptor` calls `POST /auth/refresh` once (one shared in-flight call), retries the request, and logs the user out if the refresh fails
- `authGuard` protects the app shell. `guestGuard` sends signed-in users away from the login and register pages
- Logout revokes the refresh token on the server (`POST /auth/logout`)

**Marketplace**
- **Dashboard** (`/dashboard`)
- **Shipment requests** (`/requests`): open requests, "my" requests, request details, and creating a request (`/requests/new`, CargoOwner only)
- **Offers**: carriers submit offers on a request. Cargo owners see a request's offers and accept one. Carriers see their own offers at `/offers` (Carrier only)
- **Shipments** (`/shipments`): list and details. Status moves `Matched → PickedUp → InTransit → Delivered`. Cargo owners rate the carrier from a dialog
- **Ratings** (`/ratings`)
- **Vessels** (`/vessels`, Carrier only): create, edit, change status, and delete vessels
- **Shipping routes** (`/routes`, Carrier nav): carriers define routes by picking Nile berths (`GET /berths`)
- **Suggested requests** (`/suggested`, Carrier nav): requests matched to the carrier's routes, with sorting and paging
- **Public carrier profile** (`/carriers/:id`): available without signing in

**Account and settings** (`/settings`; `/profile` redirects here)
- Edit profile, change password, and upload or remove the company logo (`POST`/`DELETE /profile/logo`)

**Notifications**
- Connects to the SignalR hub at `{notificationBaseUrl}/hubs/notifications` with the access token and reconnects automatically
- Shows a toast for each new notification, with a paginated list, unread count, mark one as read and mark all as read
- Clicking a notification goes to the related entity

**UI**
- English and Arabic. The choice is saved in `localStorage` (`rl:lang`) and sets `<html lang>` and `dir="rtl"` for Arabic. The default language is English
- Light and dark themes through Taiga UI
- Sidebar, topbar, and a separate mobile navigation

---

## Project Structure

```
src/
├── app/
│   ├── core/          # App-wide: config (AppConfig, nav, theme, language), guards, HTTP services, interceptors, notifications/alerts
│   ├── features/      # Lazy-loaded pages: auth, dashboard, requests, offers, shipments, ratings, vessels,
│   │                  #   carrier-routes, suggested-requests, carriers (public profile), settings
│   ├── layout/        # App shell, sidebar, topbar, mobile navigation
│   ├── models/        # DTOs and enums shared across features
│   ├── shared/        # Reusable components (notifications panel, rl-card, page placeholder)
│   ├── app.config.ts  # Root providers (router, HttpClient + interceptors, Taiga, ngx-translate)
│   └── app.routes.ts  # Top-level routes
├── assets/i18n/       # en.json, ar.json
├── environments/      # environment.ts (production) / environment.development.ts
└── styles/            # Design tokens and global SCSS
public/                # Static files copied as-is (favicon)
proxy.conf.json        # Dev-server proxy: /api → http://localhost:5132
.specify/, .opencode/  # Spec-kit tooling (not part of the app build)
```

---

## Getting Started Locally

### Prerequisites

- **Node.js** `^22.22.3 || ^24.15.0 || >=26.0.0` (the engine range Angular 22 requires)
- **npm**: the project pins `npm@11.19.0` through the `packageManager` field
- A running instance of the Rivel backend API on `http://localhost:5132`. It lives in a separate repository; see that repository for database and secrets setup

### Steps

```bash
git clone <this-repo-url>
cd Rivel_Fr
npm install
npm start            # ng serve, uses the development configuration → http://localhost:4200
```

In the development build, `environment.development.ts` replaces `environment.ts`, so the app calls:

- API: `http://localhost:5132/api`
- SignalR: `http://localhost:5132/hubs/notifications`

### Other scripts

| Command | What it does |
|---|---|
| `npm run build` | Production build (`ng build`, budgets enforced, output hashing) into `dist/` |
| `npm run watch` | Development build in watch mode |
| `npm test` | Unit tests (`ng test` → Vitest + jsdom) |

---

## Configuration

The frontend has **no runtime environment variables and no secrets**. All configuration is compiled in from `src/environments/*` and `src/app/core/config/app-config.ts`.

| Key | Where | Purpose | Required |
|---|---|---|---|
| `apiBaseUrl` | `environment*.ts` | Base URL for every REST call (e.g. `https://<api-host>/api`) | Yes |
| `notificationBaseUrl` | `environment*.ts` | Origin of the SignalR hub (`/hubs/notifications` is appended) | Yes |
| `production` | `environment*.ts` | Production flag | Yes |
| `appName` | `app-config.ts` | Application name (`Rivel`) | Yes (has a default) |
| `defaultLanguage` / `supportedLanguages` | `app-config.ts` | `en` default; `en`, `ar` supported | Yes (has a default) |
| `tokenStorageKey` / `refreshTokenStorageKey` / `userStorageKey` | `app-config.ts` | `localStorage` keys for the session | Yes (has a default) |
| `themeStorageKey` | `app-config.ts` | `localStorage` key used by Taiga UI for dark mode | Yes (has a default) |

To point a build at a different backend, edit `apiBaseUrl` and `notificationBaseUrl` in the matching environment file.

---

## Deployment Notes

- Hosted on Vercel. A production build uses `src/environments/environment.ts`, which points at `https://rivel.runasp.net`.
- No environment variables need to be set in Vercel for the app to work, because the API URLs are fixed at build time.
- The backend must allow this frontend's origin in CORS, including the SignalR hub.

---

## Security Notes

- This client holds **no secrets**. Never put API keys, connection strings, or tokens in `src/environments/*`. Those files ship to the browser.
- `.env*` and `.vercel/` are git-ignored. Keep it that way, because Vercel CLI writes tokens into `.env.local`.
- Access and refresh tokens are stored in `localStorage`, so XSS hygiene matters. Avoid `innerHTML` and bypassing Angular sanitization.
