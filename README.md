# Rivel 🚢

A two-sided freight logistics marketplace digitizing Nile river shipping — connecting **Cargo Owners** who need to move goods with **Carriers** who operate vessels.

🌐 **Live:** [rivel-seven.vercel.app](https://rivel-seven.vercel.app/auth/login) &nbsp;|&nbsp; 🔌 **API:** [rivel.runasp.net](https://rivel.runasp.net/swagger)

---

## What it does

Cargo owners post shipment requests with cargo details, weight, origin and destination. Carriers browse open requests and submit offers with a price and pickup date. The cargo owner reviews all offers and accepts one — which auto-rejects the rest and creates a shipment. The carrier then advances the shipment through its lifecycle (Matched → Picked Up → In Transit → Delivered), after which the cargo owner can leave a rating.

---

## Roles

| Role | Capabilities |
|---|---|
| **Cargo Owner** | Post requests · Review & accept offers · Track shipments · Rate carriers |
| **Carrier** | Register vessels · Browse open requests · Submit offers · Advance shipment status |

---

## Tech Stack

**Backend**
- ASP.NET Core (.NET) — REST API
- Entity Framework Core + PostgreSQL (Supabase)
- ASP.NET Core Identity + JWT authentication
- FluentValidation · Pessimistic locking for race conditions

**Frontend**
- Angular 21 — standalone components
- NgRx Signals — state management
- Taiga UI — component library
- Deployed on Vercel

---

## Core Flow

```
Cargo Owner posts request
        ↓
Carriers browse & submit offers
        ↓
Owner accepts one offer → others auto-rejected
        ↓
Shipment created → Carrier advances status
        ↓
Owner leaves rating after delivery
```

---

## API

Full API available at [`/swagger`](https://rivel.runasp.net/swagger)

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` |
| Shipment Requests | `GET · POST · PUT · DELETE /api/shipment-requests` |
| Offers | `GET · POST /api/shipment-requests/{id}/offers` · `PUT .../accept` |
| Shipments | `GET · PUT /api/shipments` · `PUT /api/shipments/{id}/status` |
| Ratings | `POST · GET /api/shipments/{id}/rating` |
| Vessels | `GET · POST /api/vessels` |

---

## Local Development

**Backend**
```bash
cd RiverLine.API
dotnet restore
# Set connection string in appsettings.Development.json
dotnet ef database update
dotnet run
```

**Frontend**
```bash
cd rivel-frontend
npm install
ng serve
```

---

## Roadmap

| Phase | Status |
|---|---|
| v1 — Core marketplace (auth, requests, offers, shipments, ratings, vessels) | ✅ Done |
| v1.1 — Production deployment | ✅ Done |
| v1.2 — Auto-suggest matching based on carrier routes | 🔜 Planned |
| v2 — Capacity validation, notifications | 🔜 Planned |
