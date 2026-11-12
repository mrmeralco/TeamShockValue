# Meralco Shockvalue

Meralco Shockvalue is a web prototype for making household electricity usage easier to understand. It combines breaker-level energy readings, usage history, bill estimates, and field observations in one dashboard.

## What it does

- **Overview:** Shows total power draw and individual configured breaker readings.
- **Usage:** Displays consumption charts for 7-, 30-, and 90-day ranges.
- **My Bill:** Shows a sample bill forecast and a circuit-level breakdown.
- **Devices:** Add a breaker channel, assign it an appliance and room name, edit its label, or remove its mapping.
- **Field Notes:** Provides a place to record context about appliance, meter, or outage observations.
- **Login and signup prototype:** Offers a simple browser-based account flow.
- **Export:** Downloads a text report with the current readings.

Use the sidebar to switch between pages. Device labels and sample readings are saved in the current browser using `localStorage`.

## Run locally

The project is a static web app and does not require a build step.

1. Install Python 3 or Node.js.
2. Open a terminal in the project directory.
3. Start a local server with either command:

   ```powershell
   python -m http.server 8000
   ```

   Or, if Python is unavailable:

   ```powershell
   npx http-server -p 8000
   ```

4. Open [http://localhost:8000](http://localhost:8000) in a browser.

The dashboard loads Chart.js from a CDN, so the charts require an internet connection.

## Prototype scope and limitations

This version is a frontend prototype. Breaker readings are simulated in the browser; it does **not** connect to an ESP32/ESP8266, CT clamps, a utility smart meter, or a backend. The login/signup flow does not create secure server-side accounts, and the sample bill figures are illustrative rather than an official Meralco bill or rate calculation. Browser-local data is not shared across devices and can be cleared with browser storage.

To turn this into a connected system, add a backend API and database, then replace the simulated readings in `app.js` with authenticated device readings. Validate energy measurements and billing calculations against an appropriate meter and current official rates.

## Electrical safety

This application is for monitoring and demonstration only. Never open a breaker panel or install a current transformer yourself. Have a licensed electrician or qualified instructor install and inspect electrical monitoring equipment. Do not treat prototype readings or estimates as safety alarms or billing statements.
