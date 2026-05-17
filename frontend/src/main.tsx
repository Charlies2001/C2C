import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './i18n'
import './index.css'
import App from './App'

// Sentry error reporting — only in production builds so local dev doesn't
// spam events. DSN is intentionally hardcoded (it's a public value baked into
// every browser bundle anyway). Forks deploying their own copy should change
// this to their own DSN, or comment out the init.
const SENTRY_DSN = 'https://1b4bd57e6192d259ee8306b732b651c9@o4511404436684800.ingest.us.sentry.io/4511404441993216'

if (import.meta.env.PROD) {
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
