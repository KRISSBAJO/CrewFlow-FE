# CrewFlow Frontend Release Notes

## Launch Checkpoint

This checkpoint covers the CrewFlow landing page and operations console through the operational money-engine build.

### Included

- Premium landing page with CrewFlow brand assets
- Signup/onboarding conversion flow
- Authenticated operations console
- Revenue command center overview
- Receptionist simulator
- Inbox with revenue-intent filters
- Booking board with inline lead booking and recurrence
- Customer manager and customer revenue profile
- Field job packet and completion flow
- Invoice/payment controls
- Manager action queue
- Tenant, service, staff, and WhatsApp operations settings
- WhatsApp readiness and delivery monitor
- Tenant billing, activation, and platform admin controls
- Platform system readiness console with production warnings and integration status
- Full platform admin workspace with sidebar navigation and tenant command mutations

### Demo Login

```text
owner@sparkle.test / Password123!
manager@sparkle.test / Password123!
crew@sparkle.test / Password123!
```

### Verification

```bash
yarn lint
yarn build
curl -I http://localhost:3000/
curl -I http://localhost:3000/app
```

### Production Notes

- Set `NEXT_PUBLIC_API_URL` to the public backend API URL.
- Verify backend `/api/health/readiness` before launch.
- Confirm the landing page and `/app` load after deploy.
- Use the backend smoke script for end-to-end API readiness.
