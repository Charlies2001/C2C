import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './i18n'
import './index.css'
import App from './App'

// Sentry error reporting — only in production builds + only if DSN injected
// at build time. DSN ends up in the browser bundle (Sentry's design), but we
// gate it on the env var so forks of this repo don't accidentally send their
// errors to coding-coach.org's Sentry. Owners set VITE_SENTRY_DSN as a
// GitHub repo secret; CI passes it via --build-arg → Dockerfile ARG → Vite.
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

if (import.meta.env.PROD && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: 'production',
    // Errors only — free plan caps at 5k events/month, no perf / replay.
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  })
  Sentry.setTag('component', 'frontend')
}

// Cloudflare Web Analytics beacon — same pattern: only loads if the site
// token was injected at build time. Forks → no token → no beacon → no
// pollution of the owner's CF Analytics dashboard.
const CF_BEACON = import.meta.env.VITE_CF_BEACON as string | undefined
if (import.meta.env.PROD && CF_BEACON) {
  const s = document.createElement('script')
  s.defer = true
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_BEACON }))
  document.head.appendChild(s)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
