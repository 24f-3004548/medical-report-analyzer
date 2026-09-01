# Veris — Frontend

A React + Vite + Tailwind frontend for Veris, a medical lab report explainer.
Built against the Veris brand guidelines (Forest Green / Ink / Lora + Inter).

## Note on the logo

The actual logo asset (from `veris.zip`) didn't come through on upload, so
`src/components/Logo.jsx` currently renders a wordmark built from the brand
book's own type and color rules (Lora, Forest Green `#2D6A4F`) rather than
the real mark. Drop the real logo file into `src/assets/` and swap it into
that component — it's the only place the logo is defined, so the change
propagates everywhere (navbar, footer, home hero).

## Getting started

```bash
npm install
npm run dev       # start dev server
npm run build      # production build
```

Set `VITE_API_BASE_URL` in a `.env` file to point at the real backend (defaults
to `/api`, so a dev proxy or same-origin deploy works out of the box).

## Structure

```
src/
  components/   Reusable UI: Button, Navbar, Footer, ReportCard, ResultCard,
                ResultStatus, PatientCard, SummaryCard, SourceCard,
                UploadZone, ProcessingState, EmptyState, ConfirmModal,
                ProtectedRoute, Logo
  pages/        Home, Login, Register, ForgotPassword, Dashboard, Reports,
                UploadReport, ReportDetails, Profile
  layouts/      PublicLayout (marketing + auth pages), DashboardLayout
                (authenticated app shell with nav)
  context/      AuthContext — current user, login/register/logout
  services/     api.js — single fetch wrapper; every backend call goes
                through here (auth header, error normalization)
```

## Wiring the real backend

`src/services/api.js` currently expects:

- `POST /auth/login`, `/auth/register`, `/auth/logout`, `/auth/forgot-password`, `/auth/change-password`
- `GET/PATCH/DELETE /profile`
- `GET /reports`, `GET /reports/:id`, `POST /reports/upload` (multipart)

Adjust endpoint paths/payload shapes in that one file to match the actual API
— no other file makes network calls.

`ReportDetails.jsx` expects the report payload shaped roughly as:

```js
{
  reportType, date, status,
  patientAge, patientGender,
  summary,
  resultsByTopic: { "RED BLOOD CELLS": [ { testName, value, unit, referenceRange, status, meaning, explanation, caution } ] },
  whenToDiscussWithDoctor,
  sources: [ { name, topic, title, url } ],
}
```

Adjust the destructuring in `ReportDetails.jsx` if the real API shape differs
— it won't render fields that are null/absent, per the product rule against
showing empty sections.

## Notes

- Upload processing (`UploadReport.jsx`) shows real pipeline stages, not a
  fake percentage — wire `STAGE_INDEX` to however the backend reports
  progress (polling or streaming) if you want live per-stage updates instead
  of a single wait-then-redirect.
- Result status colors are intentionally subtle (see `ResultStatus.jsx`) —
  only backend-provided status strings drive color, nothing is inferred as
  "dangerous" on the frontend.
