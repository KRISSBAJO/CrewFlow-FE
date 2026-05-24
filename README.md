# CrewFlow Frontend

Modern Next.js landing page and operations console for CrewFlow.

## Stack

- Next.js App Router
- Tailwind CSS
- TanStack Query
- Zustand
- Framer Motion
- Lucide icons

## Local Setup

```bash
yarn install
cp .env.example .env.local
yarn dev
```

Default URLs:

```text
Landing: http://localhost:3000
Console: http://localhost:3000/app
Admin:   http://localhost:3000/admin
API:     http://localhost:3002/api
```

Demo login:

```text
owner@sparkle.test / Password123!
manager@sparkle.test / Password123!
crew@sparkle.test / Password123!
admin@crewflow.test / Password123! (platform admin)
```

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

For deployment, set `NEXT_PUBLIC_API_URL` to the public backend API URL. Use `.env.production.example` as the production template.

## Production Readiness

Before handing the app to a real business, verify:

- `NEXT_PUBLIC_API_URL` points to the deployed backend `/api` URL.
- Backend `CORS_ORIGIN` includes the deployed frontend origin.
- Backend `/api/health/readiness` returns `status: ok`.
- Login, dashboard, leads, inbox, bookings, invoices, settings, billing, and admin pages load against the deployed API.
- Landing page CTAs open the app without broken routes.

## Product Areas

- Premium landing page
- Signup/onboarding conversion flow
- Operations overview
- Receptionist simulator and inbox
- Lead pipeline CRM
- Customer retention engine
- Platform admin control center
- Booking board
- Customer manager and CSV import
- Field job packet
- Invoices and payments
- Manager action queue
- Tenant, staff, service, and WhatsApp operations settings
- Tenant billing and activation controls
- Platform admin billing and support console

## Verification

```bash
yarn lint
yarn build
yarn preflight
```

After starting the app:

```bash
curl -I http://localhost:3000/
curl -I http://localhost:3000/app
```

## Demo Flow

1. Open `/`.
2. Review landing page positioning.
3. Open `/app`.
4. Login with the seeded owner account.
5. Open Inbox and use the receptionist simulator.
6. Review Leads and scan follow-ups from Actions.
7. Review Retention and run a retention scan.
8. Book the lead from the intake drawer.
9. Complete a field job.
10. Create a payment link and mark the invoice paid.
11. Check the revenue command center and WhatsApp operations panel.
