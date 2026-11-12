# TeamShockValue — Meralco Shockvalue

Meralco Shockvalue is a competition-ready web prototype for **Grid Intelligence from Connected Devices**. It turns household breaker readings into an understandable view of demand, estimated cost, circuit activity, data quality, and possible local grid stress.

The project is designed around a simple question:

> **What is happening on the monitored circuits right now, and what should the household or field team do next?**


Shockvalue combines data from connected breaker channels and a main-feed view to present:

- Current load per mapped breaker channel
- Total household demand
- Transformer-load estimate
- Available headroom before a simulated local constraint
- A next-60-minute demand forecast
- Telemetry Trust, which indicates whether readings are fresh and consistent enough to use
    - Grid status and telemetry indicators for local operating awareness
- An unmapped remainder so the system does not pretend to identify loads it cannot measure

## Core product idea

A smart meter can tell a customer how much electricity was used. Shockvalue adds a decision layer around that reading:

1. Observe the current load.
2. Attribute it to configured breaker channels where possible.
3. Compare it with expected demand and available headroom.
4. Detect a possible peak or abnormal condition.
5. Explain the likely impact on usage and cost.
6. Recommend a safe, understandable next step.
7. Keep the reading and the human explanation together for later review.

## Current features

### Overview

- Live total power draw in kW
- Estimated daily consumption in kWh
- Estimated monthly bill
- Responsive summary cards
- Live breaker readings
- Grid Intelligence panel
- Plain-language energy-saving insight
- Exportable energy report

### Grid Intelligence panel

The homepage includes a lightweight digital-twin-style prototype with:

- **Transformer Load:** estimated utilization of a configured local operating envelope
- **Available Headroom:** remaining capacity before demand response is suggested
- **Next 60-Minute Forecast:** trend-based projected load
- **Telemetry Trust:** an indicator of data freshness and consistency
- **Grid status:** `STABLE` or `WATCH`

The current calculations are intentionally transparent and illustrative. Real deployments should use utility-provided feeder or transformer limits and authenticated telemetry.

### Breaker Channels

The Channels section is presented as breaker-channel monitoring. Users can:

- Add a channel
- Name the appliance or load
- Assign a room or circuit
- Select a breaker channel
- Edit the appliance name
- Edit the room or circuit
- Remove a mapping
- View all currently mapped channels through CH 16

The current readings are simulated so the interface can demonstrate live behavior. Device mappings are retained in browser storage.

### Usage

- 7-day, 30-day, and 90-day views
- Actual-usage line chart
- Daily-average reference line
- Peak usage indicator
- Automatic chart range switching

### My Bill

- Estimated billing-period amount
- Rate assumption
- Bill trend visualization
- Circuit-level breakdown dialog
- Measured-circuit cost
- Unmapped remainder
- Plain-language explanation that estimates are not official utility billing statements

### Field Notes

Users can record a short note about:

- An appliance being turned on
- A short outage
- Extra appliance use
- A meter check
- An unusual bill
- Any other event that explains a consumption change

Saved notes appear at the bottom of the Field Notes page. Clicking a note opens options to:

- Edit the note
- Change its date and time
- Delete the note

Notes are persisted in the browser for the prototype.

### User accounts and authentication

- Separate Profile page
- Editable username
- Read-only UserID
- Editable email address
- Save profile changes
- Public users are routed to a Laravel login page first
- Separate signup page
- Successful login or signup redirects to the dashboard
- Logout invalidates the Laravel session and returns to login
- The circular profile avatar reflects the signed-in user’s initials
- User information is stored in Laravel’s SQLite database

Passwords are stored as secure hashes. This is still a prototype and should add production hardening such as HTTPS, CSRF review, rate limiting, and managed backups before deployment.

### Other interactions

- Notification counter and notification dialog
- Profile shortcut
- Home/breaker-channel summary control
- Working information buttons with explanations
- Toggleable energy-saving tip
- Safety/help dialog
- Text report export
- Responsive desktop and mobile layout

## Laravel data and prototype behavior

The Laravel application stores user account data in:

- `database/database.sqlite`
- `users` table for name, email, user ID, password hash, and timestamps
- `sessions` table for server-side sessions

The simulated dashboard readings, breaker-channel mappings, history, and field notes remain browser-side prototype data in `localStorage`.

Readings update periodically to demonstrate a live dashboard. They are not actual electrical measurements until an ESP32/ESP8266 or other approved device is connected.

## Laravel project files

| File | Purpose |
| --- | --- |
| `resources/views/dashboard.blade.php` | Dashboard page structure, navigation, dialogs, forms, and accessible labels |
| `resources/views/auth/login.blade.php` | Login page |
| `resources/views/auth/signup.blade.php` | Signup page |
| `public/styles.css` | Responsive layout, visual system, cards, charts, dialogs, forms, and mobile behavior |
| `public/app.js` | Navigation, simulated readings, device management, profile avatar, field notes, and interactions |
| `app/Http/Controllers/AuthController.php` | Signup, login, profile, session, and logout behavior |
| `app/Models/User.php` | Eloquent user model |
| `database/migrations/` | User and session database schema |
| `routes/web.php` | Login, signup, dashboard, and account routes |
| `README.md` | Project overview, feature documentation, safety notes, limitations, and deployment information |

## Running with Laravel Herd

This project is a Laravel application and is intended to run through Laravel Herd or Laravel’s local server.

From the Laravel project directory:

```bash
php artisan migrate
php artisan serve
```

Then open `http://127.0.0.1:8000`. When using Herd, add the project as a Herd site and open its generated `.test` URL instead; `php artisan serve` is not required in that case.

The default environment uses SQLite. If the database has not been initialized, run:

```bash
php artisan migrate
```

## Demonstration flow for judges

1. Open the public URL and confirm that it routes to the login page.
2. Select **Create an account**, register, and confirm that signup opens the dashboard.
3. Point out live total demand and explain that each displayed circuit is a labeled breaker channel.
4. Open Channels and add or edit a channel label through CH 16.
5. Open Usage and switch between 7-, 30-, and 90-day history.
6. Open My Bill and show measured circuit cost versus unmapped remainder.
7. Add a Field Note, then click it to edit or delete it.
8. Open Profile, save the account fields, verify the avatar initials, and demonstrate logout returning to login.

## Safety and responsible use

This prototype is for monitoring and demonstration. It is not a certified protection device, a utility meter, or a billing authority.

- Never open a breaker panel or install a CT clamp without a licensed electrician or qualified instructor.
- A CT clamp must be installed around the correct conductor; do not modify a mains cable for a student demo.
- Never connect a prototype circuit directly to mains voltage.
- Do not use the dashboard as an emergency alarm.
- Do not treat the bill estimate as an official Meralco bill.

## Current limitations

- Breaker readings are simulated in the frontend.
- There is no connected ESP32/ESP8266 or MQTT service yet; dashboard readings remain simulated.
- User accounts use Laravel sessions and SQLite locally; production deployments need additional security hardening.
- Data is not synchronized between browsers or devices.
- Appliance identification is user labeling, not full NILM disaggregation.
- Transformer limits and forecasts are illustrative until utility/network data is available.
- The current profile, notes, and device data can be cleared by clearing browser storage.


