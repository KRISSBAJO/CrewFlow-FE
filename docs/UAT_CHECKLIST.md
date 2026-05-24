# CrewFlow Frontend UAT Checklist

Run this after backend `yarn demo:reset` and frontend `yarn build`.

## Login And Routing

- [ ] `/` landing page loads.
- [ ] `/app` loads tenant login when signed out.
- [ ] Owner login opens tenant app.
- [ ] Manager login opens tenant app.
- [ ] Staff login opens tenant app with restricted server access where expected.
- [ ] Platform admin login redirects from `/app` to `/admin`.
- [ ] Tenant user visiting `/admin` redirects to `/app`.

## Tenant App

- [ ] Overview cards are readable.
- [ ] Owner weekly digest preview renders.
- [ ] Send digest button returns success for owner.
- [ ] Revenue-risk alerts render without overlap.
- [ ] Inbox simulator creates an inquiry.
- [ ] Inbox conversation drawer opens.
- [ ] Lead board columns fit on desktop.
- [ ] Sidebar collapse works on desktop.
- [ ] Customer manager search/add/import works.
- [ ] Booking drawer opens and updates.
- [ ] Field dispatch board has no horizontal page scroll.
- [ ] Money page shows aging buckets and priority invoices.
- [ ] Invoice drawer collection timeline renders.
- [ ] Retention revenue engine segments render.
- [ ] Settings page panels render without cramped controls.

## Admin App

- [ ] Platform overview loads.
- [ ] Tenant search works.
- [ ] Tenant detail panel is readable.
- [ ] Tenant command controls are not cramped.
- [ ] Billing controls show validation errors clearly.
- [ ] Support access create/revoke controls work.
- [ ] Failure retry/replay controls render.
- [ ] Audit table/list loads.

## Responsive Pass

- [ ] 1440px desktop has no page-level horizontal scroll.
- [ ] 1280px desktop has no clipped cards.
- [ ] 768px tablet stacks panels cleanly.
- [ ] 390px mobile can access nav and drawers.

## Production Pairing

- [ ] `NEXT_PUBLIC_API_URL` points to deployed backend `/api`.
- [ ] Backend CORS allows frontend origin.
- [ ] `/api/health/readiness` is reachable from admin readiness panel.
