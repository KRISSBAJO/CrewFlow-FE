# CrewFlow Frontend Deployment Runbook

## Build

```bash
yarn install --frozen-lockfile
yarn lint
yarn build
yarn start
```

## Required Environment

Start from `.env.production.example`.

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

The value must include `/api`.

## Backend Pairing

Before exposing the frontend to users:

```bash
curl https://api.yourdomain.com/api/health/readiness
```

Confirm the backend:

- returns `status: "ok"`
- points CORS at this frontend origin
- has production integrations in the expected live/mock state

## Smoke Checks

After deployment:

- open `/`
- open `/app`
- open `/admin`
- sign in as tenant owner
- sign in as platform admin
- verify the tenant app redirects platform users to `/admin`
- verify `/admin` redirects tenant users to `/app`

## Rollback

1. Revert to the previous frontend build.
2. Keep `NEXT_PUBLIC_API_URL` unchanged unless the backend was also rolled back.
3. Verify `/app` login and `/admin` login.
