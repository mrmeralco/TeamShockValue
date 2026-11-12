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
- A peak-event simulation with a recommended demand-response action
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
- **Peak simulation:** demonstrates a high-demand event and recommends delaying flexible loads such as a water heater or EV charger

The current calculations are intentionally transparent and illustrative. Real deployments should use utility-provided feeder or transformer limits and authenticated telemetry.

### Breaker Channels

The Devices section is presented as breaker-channel monitoring. Users can:

- Add a channel
- Name the appliance or load
- Assign a room or circuit
- Select a breaker channel
- Edit the appliance name
- Edit the room or circuit
- Remove a mapping
- View all currently mapped channels

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

### User profile and account prototype

- Separate Profile page
- Editable username
- Read-only UserID
- Editable email address
- Save profile changes
- Separate login page
- Signup option
- Logout behavior that clears the local session and returns to login

This is a frontend demonstration only. It is not production authentication.

### Other interactions

- Notification counter and notification dialog
- Profile shortcut
- Home/breaker-channel summary control
- Working information buttons with explanations
- Toggleable energy-saving tip
- Safety/help dialog
- Text report export
- Responsive desktop and mobile layout

## Data and prototype behavior

The browser stores prototype data in `localStorage`:

- Breaker-channel mappings
- Simulated readings
- Reading history snapshots
- Field Notes
- Profile details
- Login session state

Readings update periodically to demonstrate a live dashboard. They are not actual electrical measurements until an ESP32/ESP8266 or other approved device is connected.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, navigation, dialogs, dashboard sections, forms, and accessible labels |
| `styles.css` | Responsive layout, visual system, cards, charts, dialogs, forms, and mobile behavior |
| `app.js` | Navigation, simulated readings, history persistence, device management, profile/auth flow, field notes, grid intelligence, and interactions |
| `README.md` | Project overview, feature documentation, safety notes, limitations, and deployment information |

## Viewing the published website

The project is intended to be viewed through GitHub Pages:

**https://mrmeralco.github.io/TeamShockValue/**

If the page is not available immediately after a push, open the repository's **Settings → Pages** and confirm:

- Source: **Deploy from a branch**
- Branch: **`main`**
- Folder: **`/ (root)`**

GitHub Pages may need a few minutes to publish a new commit.

## Demonstration flow for judges

1. Open the Overview page and point out live total demand.
2. Explain that each displayed circuit is a labeled breaker channel, not automatic appliance identification.
3. Show the Grid Intelligence panel and explain Transformer Load, Headroom, Forecast, and Telemetry Trust.
4. Select **Simulate neighborhood peak** to show a `WATCH` state and response recommendation.
5. Open Breaker Channels and add or edit a channel label.
6. Open Usage and switch between 7-, 30-, and 90-day history.
7. Open My Bill and show measured circuit cost versus unmapped remainder.
8. Add a plain-language Field Note, then click it to edit or delete it.
9. Open Profile, save the account fields, and demonstrate logout returning to the login page.

## Safety and responsible use

This prototype is for monitoring and demonstration. It is not a certified protection device, a utility meter, or a billing authority.

- Never open a breaker panel or install a CT clamp without a licensed electrician or qualified instructor.
- A CT clamp must be installed around the correct conductor; do not modify a mains cable for a student demo.
- Never connect a prototype circuit directly to mains voltage.
- Do not use the dashboard as an emergency alarm.
- Do not treat the bill estimate as an official Meralco bill.

## Current limitations

- Breaker readings are simulated in the frontend.
- There is no connected ESP32/ESP8266, MQTT service, REST API, or database yet.
- User accounts are local browser prototypes, not secure server-side authentication.
- Data is not synchronized between browsers or devices.
- Appliance identification is user labeling, not full NILM disaggregation.
- Transformer limits and forecasts are illustrative until utility/network data is available.
- The current profile, notes, and device data can be cleared by clearing browser storage.


