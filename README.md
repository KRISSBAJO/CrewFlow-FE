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
API:     http://localhost:3002/api
```

Demo login:

```text
owner@sparkle.test / Password123!
manager@sparkle.test / Password123!
crew@sparkle.test / Password123!
```

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

For deployment, set `NEXT_PUBLIC_API_URL` to the public backend API URL.

## Product Areas

- Premium landing page
- Signup/onboarding conversion flow
- Operations overview
- Receptionist simulator and inbox
- Lead pipeline CRM
- Customer retention engine
- Booking board
- Customer manager and CSV import
- Field job packet
- Invoices and payments
- Manager action queue
- Tenant, staff, service, and WhatsApp operations settings

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
