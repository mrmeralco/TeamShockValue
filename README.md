# Shockvalue

> **IoT-powered household energy intelligence for clearer bills, safer demand decisions, and a more responsive local grid.**

Shockvalue is a circuit-level energy intelligence layer that connects household behavior to local grid conditions. It turns connected breaker-channel readings into an understandable view of demand, cost, and grid impact.

This approach gives the platform a broader long-term path than a purely consumer analytics app, while remaining understandable and useful to homeowners today.

## What is happening right now?

Shockvalue combines data from connected breaker channels and a main-feed view to help homeowners and field teams answer:

> **What is consuming power right now, how confident are we in the reading, and what is the safest next action?**

## Why this matters

Traditional energy dashboards stop at consumption totals. Shockvalue adds context and action:

1. **Observe** live load from a main feed and mapped breaker channels.
2. **Attribute** demand to labeled circuits without pretending to identify unknown loads.
3. **Validate** freshness and consistency through a Telemetry Trust signal.
4. **Forecast** near-term demand and compare it with an illustrative operating envelope.
5. **Explain** the cost impact in plain language.
6. **Recommend** safe, practical energy-saving or demand-shifting actions.

The result is an IoT-first energy experience that can grow from a browser demonstration into a real connected-device platform.

## Current status

The current repository is a **working web prototype**:

- The dashboard, authentication, profile, charts, dialogs, and responsive layout are implemented.
- Breaker readings are simulated in the browser so the product can be demonstrated without mains-connected hardware.
- Device mappings and history are stored in browser `localStorage` for the prototype.
- User accounts, sessions, email changes, and password changes are backed by Laravel and SQLite.
- No blockchain network or production IoT ingestion service is enabled yet; both are documented as carefully scoped extension points below.

This distinction is intentional: the UI demonstrates the product decisions now, while the hardware and distributed-system roadmap stays technically credible.

## Core features

### Overview and Grid Intelligence

- Live total power draw in kW
- Estimated daily consumption in kWh
- Estimated monthly bill
- Mapped breaker-channel readings
- Transformer-load estimate and available headroom
- Next-60-minute trend forecast
- Telemetry Trust indicator for freshness and consistency
- `STABLE` / `WATCH` grid status
- Randomized energy-saving tips for demonstrations
- Exportable energy report

### IoT-ready breaker channels

The Channels view is designed around connected CT-clamp or smart-breaker channels. Users can:

- Add a channel mapping
- Name the appliance or load
- Assign a room or circuit
- Assign a channel through CH 16
- Edit labels and icons
- Remove a mapping
- View all mapped channels
- Open a channel detail/edit dialog by clicking a live circuit

The browser currently simulates readings, but the channel model is intentionally compatible with an ESP32/ESP8266 or an approved smart-meter gateway.

### Usage and billing transparency

- 7-day, 30-day, and 90-day usage views
- Actual-usage chart and daily-average reference line
- Peak usage indicator
- Bill trend visualization
- Circuit-level bill breakdown dialog
- Measured-circuit cost and unmapped remainder
- Clear explanation that estimates are not official utility billing statements

### Accounts

- Laravel login and signup pages
- Server-side sessions
- Editable username
- Read-only UserID
- Email change with current-password verification
- Password change with current-password verification and confirmation
- Secure password hashing
- Logout and session invalidation

## IoT architecture

Shockvalue is designed as an **edge-to-dashboard system**, not just a static web page.

```text
┌──────────────────────┐
│ Household circuits   │
│ CT clamps / sensors  │
└──────────┬───────────┘
           │ sampled current / voltage
           ▼
┌──────────────────────┐
│ Edge device          │  ESP32/ESP8266 or certified gateway
│ - filtering          │  local aggregation and health checks
│ - channel identity   │
│ - signed messages    │
└──────────┬───────────┘
           │ MQTT over TLS or HTTPS
           ▼
┌──────────────────────┐
│ IoT ingestion layer  │  authenticated device registry
│ - validation         │  replay protection and rate limits
│ - buffering          │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Laravel application  │  users, devices, rules, reports
│ - digital twin       │
│ - telemetry trust    │
│ - recommendations    │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Dashboard            │  homeowner and field-team actions
└──────────────────────┘
```

### Viable hardware path

A practical first hardware iteration would use:

- **ESP32** for Wi-Fi, secure transport, and enough local processing
- **Non-invasive CT clamps** for circuit current measurement
- An isolated, approved voltage reference or utility-provided voltage data for real power estimation
- Local sampling and aggregation before transmission to reduce bandwidth
- MQTT over TLS for telemetry, with HTTPS as a simpler fallback
- Device certificates or rotating credentials rather than shared passwords
- OTA firmware updates with signed firmware packages

A production installation must use appropriate isolation, enclosures, fusing, calibration, and a licensed electrician. The prototype must never be connected directly to mains voltage.

### Recommended telemetry envelope

A future device message should carry only the data needed to validate and interpret a reading:

```json
{
  "device_id": "home-001-gateway",
  "channel": "CH 01",
  "sampled_at": "2026-11-13T00:00:00Z",
  "power_kw": 1.24,
  "energy_kwh": 18.6,
  "firmware": "0.1.0",
  "sequence": 1842,
  "signature": "..."
}
```

The ingestion layer should validate the device identity, timestamp tolerance, sequence number, units, and signature before the reading reaches forecasting or billing logic.

## Digital twin and useful innovation

The Grid Intelligence panel is a lightweight digital twin: a continuously updated software representation of the household's monitored load and its operating context. The prototype demonstrates:

- Headroom estimation before an illustrative local constraint
- Short-horizon load forecasting
- Peak-risk signaling
- Telemetry confidence
- A path toward safe demand response, such as delaying a water heater or EV charger

This is more viable than presenting an unexplained AI score. Every production recommendation should expose the contributing circuits, confidence, expected saving, and a safe opt-out.

Other practical innovation opportunities include:

- **Edge intelligence:** detect obvious load changes locally so the system remains useful during intermittent connectivity.
- **Explainable NILM assistance:** combine user labels with circuit readings instead of claiming perfect appliance identification.
- **Privacy-preserving analytics:** retain high-resolution data at the edge and send aggregates unless detailed data is explicitly needed.
- **Community flexibility:** allow opt-in households to report flexible load availability without exposing their full household waveform.
- **Offline-first operation:** buffer readings on the gateway and synchronize after reconnection.
- **Calibration and maintenance alerts:** detect sensor drift, stale devices, or implausible readings before they affect recommendations.


## Technology stack

- **Backend:** PHP 8.5, Laravel, Eloquent, Laravel sessions
- **Database:** SQLite for local development and demonstration
- **Frontend:** Blade, semantic HTML, vanilla JavaScript, CSS, Chart.js
- **Prototype storage:** Browser `localStorage` for simulated devices and history
- **Future IoT transport:** MQTT over TLS or HTTPS from an authenticated gateway
- **Future analytics:** time-series storage and a rules/forecasting service appropriate to deployment scale
- **Optional future audit layer:** permissioned ledger or hash anchoring for multi-party events only

## Quick start

Requirements: PHP 8.5+, Composer, and Node.js/npm if frontend tooling is needed.

```bash
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Open `http://127.0.0.1:8000`. With Laravel Herd, add the project as a Herd site and open its generated `.test` URL instead.

For the browser prototype, the main dashboard assets are served from `public/`. If you change frontend source or build configuration, use the project’s npm scripts as appropriate:

```bash
npm install
npm run build
```

## Demonstration flow

1. Open the public URL and create an account.
2. Show the live power summary and explain that the readings are simulated.
3. Open **Channels** and add or edit a channel mapping through CH 16.
4. Click a live circuit to show its channel dialog.
5. Open **Usage** and switch between 7-, 30-, and 90-day history.
6. Open **My Bill** and show measured cost versus the unmapped remainder.
7. Explain the digital-twin panel, Telemetry Trust, and the safe demand-response roadmap.
8. Open **Profile**, demonstrate email/password controls, and log out.

## Project structure

| Path | Purpose |
| --- | --- |
| `resources/views/dashboard.blade.php` | Authenticated dashboard structure, navigation, dialogs, forms, and labels |
| `resources/views/auth/` | Login and signup views |
| `public/app.js` | Navigation, simulated IoT readings, devices, charts, dialogs, and profile interactions |
| `public/styles.css` | Responsive layout, fixed sidebar, charts, cards, dialogs, and animations |
| `app/Http/Controllers/AuthController.php` | Signup, login, profile, session, and logout behavior |
| `app/Models/User.php` | Eloquent user model |
| `database/migrations/` | User, session, customer, and prototype schema changes |
| `routes/web.php` | Web and account API routes |
| `tests/Feature/ProfileTest.php` | Profile credential-change behavior tests |
| `README.md` | Product, IoT architecture, innovation boundaries, setup, and roadmap |

## Security and safety

This is a monitoring and demonstration prototype. It is not a certified protection device, utility meter, or billing authority.

- Never open a breaker panel or install a CT clamp without a licensed electrician or qualified instructor.
- Never connect a prototype circuit directly to mains voltage.
- Use galvanic isolation, appropriate fusing, enclosures, and certified sensors in any hardware build.
- Do not use the dashboard as an emergency alarm.
- Do not treat the estimate as an official Meralco bill.
- Production deployments need HTTPS, CSRF protection review, rate limiting, device authentication, secret management, audit logging, backups, and a formal threat model.
- Do not collect more household telemetry than the product decision requires.

## Current limitations

- Breaker readings are simulated in the frontend.
- There is no connected ESP32/ESP8266 or MQTT ingestion service in this repository yet.
- Transformer limits and forecasts are illustrative until authenticated utility or network data is available.
- Appliance identification is user labeling, not full NILM disaggregation.
- Data is not synchronized between browsers or devices.
- SQLite and local browser storage are suitable for demonstration, not a high-volume IoT deployment.
- Blockchain is not implemented; it remains an optional multi-party audit and settlement extension.

## Roadmap

### Phase 1 — Prototype validation

- Connect a safe, bench-tested ESP32 gateway.
- Add a device registry and authenticated telemetry endpoint.
- Persist readings in a time-series-friendly store.
- Replace simulated readings behind a feature flag.

### Phase 2 — Trusted IoT operations

- Add TLS device identity, sequence/replay checks, buffering, and OTA updates.
- Add calibration workflows and sensor-health alerts.
- Improve forecasting with real household history and confidence intervals.
- Add explicit consent, retention controls, and per-device access policies.

### Phase 3 — Grid and community coordination

- Integrate approved feeder/transformer constraints.
- Offer opt-in demand-response events with clear user control.
- Add aggregated flexibility reporting for authorized partners.
- Evaluate a permissioned audit ledger only if multiple organizations need shared settlement or provenance.

The guiding principle is simple: **use IoT to make energy visible and actionable; use distributed ledgers only where shared trust is a real requirement.**
