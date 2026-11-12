<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#f7f7f3" />
  <title>Meralco Shockvalue — Energy intelligence</title>
  <meta name="description" content="A calmer way to understand your bill, control usage, and turn energy insight into action." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
  <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>" />
  <link rel="stylesheet" href="<?php echo e(asset('styles.css')); ?>" />
</head>
<body data-page="overview">
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" data-page-link="overview" href="#overview" aria-label="Meralco Shockvalue home">
        <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
        <span>MERALCO <b>SHOCKVALUE</b></span>
      </a>
      <div class="topbar-actions">
        <span class="live-pill"><i></i> DEVICE SYNCED</span>
        <button class="icon-button" id="notificationButton" aria-label="Open notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
          <em>2</em>
        </button>
        <button class="avatar" id="profileButton" aria-label="Open profile">AS</button>
      </div>
    </header>

    <div class="layout">
      <aside class="sidebar">
        <div class="eyebrow">CONTROL ROOM</div>
        <nav class="nav-list" aria-label="Primary navigation">
          <a class="nav-item active" data-page-link="overview" href="#overview"><span class="nav-icon">◈</span><span>Overview</span></a>
          <a class="nav-item" data-page-link="usage" href="#usage"><span class="nav-icon">◒</span><span>Usage</span><span class="nav-badge">3</span></a>
          <a class="nav-item" data-page-link="bill" href="#bill"><span class="nav-icon">▤</span><span>My bill</span></a>
          <a class="nav-item" data-page-link="devices" href="#devices"><span class="nav-icon">⌁</span><span>Channels</span></a>
          <a class="nav-item" data-page-link="observations" href="#observations"><span class="nav-icon">⌖</span><span>Field notes</span></a>
          <a class="nav-item" data-page-link="profile" href="#profile"><span class="nav-icon">◎</span><span>Profile</span></a>
        </nav>
        <div class="sidebar-rule"></div>
        <div class="eyebrow">YOUR HOME</div>
        <div class="home-card">
          <div class="home-card-icon">⌂</div>
          <div><strong>San Juan home</strong><span>16-channel monitor</span></div>
          <button class="dots" aria-label="Home options">•••</button>
        </div>
        <div class="sidebar-bottom">
          <div class="sync-note"><span class="sync-dot"></span><div><strong>Last synced</strong><small id="lastSynced">just now</small></div></div>
          <button class="side-link" id="helpButton"><span>?</span> Help & safety</button>
          <div class="project-tag">HACK MANILA 2026 <span>02</span></div>
        </div>
      </aside>

      <main class="main-content" id="overview">
        <div class="page-banner" data-page-content="overview"><div><div class="eyebrow">CONTROL ROOM / OVERVIEW</div><h2>Live energy, without the guesswork.</h2><p>Track every configured breaker as it changes, then jump into history, billing, devices, or field notes.</p></div><span class="page-chip">LIVE</span></div>
        <section class="profile-page page-section" data-page-content="profile" id="profile">
          <div class="profile-header"><div><div class="eyebrow">ACCOUNT / USER PROFILE</div><h2>Your profile</h2><p>Keep your account details current for reports, device ownership, and future alerts.</p></div><div class="profile-avatar-large" id="profileInitials">AS</div></div>
          <form id="profileForm" class="profile-form">
            <label>Username<input id="profileUsername" name="username" value="Ari Santos" required /></label>
            <label>UserID<input id="profileUserId" name="userId" value="#123456789" readonly /></label>
            <label>Email<input id="profileEmail" name="email" type="email" value="ari.santos@example.com" required /></label>
            <div class="profile-actions"><button class="button button-primary" type="submit">Save changes</button><button class="button button-secondary" type="button" id="logoutButton">Logout</button></div>
            <p class="profile-status" id="profileStatus" role="status"></p>
          </form>
        </section>
        <section class="hero-row page-section" data-page-content="overview">
          <div>
            <div class="kicker">THURSDAY, 12 NOVEMBER 2026 <span class="slash">/</span> 11:33 AM</div>
            <h1>Make every watt<br /><em>count.</em></h1>
            <p class="hero-copy">Meralco Shockvalue turns the invisible flow of your home into decisions you can act on — before the bill arrives.</p>
          </div>
          <div class="hero-actions">
            <button class="button button-secondary" id="exportButton"><span>↓</span> Export report</button>
            <button class="button button-primary" id="addDeviceButton"><span>+</span> Add device</button>
          </div>
        </section>

        <section class="stats-grid page-section" data-page-content="overview" aria-label="Live energy summary">
          <article class="stat-card accent-card">
            <div class="stat-label"><span class="status-dot"></span> LIVE POWER DRAW <span class="info">i</span></div>
            <div class="stat-value"><span id="livePower">2.84</span><small>kW</small></div>
            <div class="stat-footer"><span class="trend down">↓ 8.4%</span><span>vs. last Thursday</span></div>
            <div class="sparkline"><svg viewBox="0 0 260 55" preserveAspectRatio="none" aria-hidden="true"><path d="M0 41 C12 40 14 25 25 31 S42 46 54 34 S70 18 79 28 S92 42 102 36 S113 21 124 30 S137 41 148 34 S159 12 172 24 S182 42 194 35 S206 24 218 31 S232 49 242 35 S252 22 260 24" /></svg></div>
          </article>
          <article class="stat-card">
            <div class="stat-label">TODAY'S USAGE <span class="info">i</span></div>
            <div class="stat-value"><span id="todayUsage">18.6</span><small>kWh</small></div>
            <div class="stat-footer"><span class="trend up">↑ 3.1%</span><span>vs. yesterday</span></div>
            <div class="progress-track"><span style="width: 62%"></span></div>
            <div class="meter-caption"><span>Target 30 kWh</span><span>62%</span></div>
          </article>
          <article class="stat-card">
            <div class="stat-label">EST. MONTHLY BILL <span class="info">i</span></div>
            <div class="stat-value currency"><span id="estimatedBill">₱3,842</span></div>
            <div class="stat-footer"><span class="trend neutral">● 76%</span><span>of last month's bill</span></div>
            <div class="mini-bar"><span style="height: 36%"></span><span style="height: 52%"></span><span style="height: 42%"></span><span style="height: 68%"></span><span style="height: 55%"></span><span class="current" style="height: 77%"></span><span style="height: 66%"></span></div>
          </article>
        </section>

        <section class="grid-intelligence-panel page-section" data-page-content="overview" aria-label="Grid intelligence">
          <div class="grid-panel-header">
            <div><h2>See the grid before it sees you.</h2><p>A lightweight digital twin watches demand, headroom, and telemetry confidence so the household can act before a local peak becomes a service problem.</p></div>
            <div class="grid-status-badge stable" id="gridStatusBadge"><i></i><span id="gridStatusText">STABLE</span></div>
          </div>
          <div class="grid-metrics">
            <div class="grid-metric"><span>TRANSFORMER LOAD</span><strong id="transformerLoad">38%</strong><small id="thermalCopy">Normal thermal band</small></div>
            <div class="grid-metric"><span>AVAILABLE HEADROOM</span><strong id="headroom">2.73 kW</strong><small>Before demand response</small></div>
            <div class="grid-metric"><span>NEXT 60 MIN FORECAST</span><strong id="forecastLoad">2.91 kW</strong><small id="forecastCopy">Trend-based estimate</small></div>
            <div class="grid-metric"><span>TELEMETRY TRUST</span><strong id="telemetryTrust">96%</strong><small id="telemetryCopy">Fresh sensor samples</small></div>
          </div>
          <div class="grid-actions-row"><div class="grid-alert" id="gridAlert"><span>✓</span><div><strong>No local constraint detected</strong><small>All monitored circuits are inside their expected envelope.</small></div></div></div>
        </section>

        <section class="dashboard-grid" data-page-layout="usage-bill">
          <article class="panel usage-panel page-section" data-page-content="usage" id="usage">
            <div class="panel-heading">
              <div><div class="eyebrow">KNOW YOUR BILL / MANAGE YOUR USAGE</div><h2>Where your energy went</h2></div>
              <div class="segmented" role="group" aria-label="Chart range"><button class="range-button active" data-range="7">7 days</button><button class="range-button" data-range="30">30 days</button><button class="range-button" data-range="90">90 days</button></div>
            </div>
            <div class="chart-wrap"><canvas id="usageChart" aria-label="Energy usage for the selected period"></canvas></div>
            <div class="chart-legend"><span><i class="legend-dot blue"></i> Actual usage</span><span><i class="legend-line"></i> Daily average</span><span class="legend-total">Peak: <b id="peakUsage">28.6 kWh</b></span></div>
          </article>

          <article class="panel bill-panel page-section" data-page-content="bill" id="bill">
            <div class="eyebrow">BILL FORECAST <span class="info">i</span></div>
            <div class="bill-main"><span class="bill-amount">₱3,842</span><span class="bill-delta">↓ ₱264 <small>vs. last month</small></span></div>
            <div class="bill-chart"><svg viewBox="0 0 380 115" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9d5ff" stop-opacity=".65"/><stop offset="1" stop-color="#b9d5ff" stop-opacity="0"/></linearGradient></defs><path class="area" d="M0 95 C20 84 30 65 45 78 S68 96 83 83 S109 50 127 65 S151 80 168 74 S190 43 209 59 S232 79 249 65 S275 32 290 48 S314 69 328 58 S352 33 380 42 V115 H0Z"/><path class="line" d="M0 95 C20 84 30 65 45 78 S68 96 83 83 S109 50 127 65 S151 80 168 74 S190 43 209 59 S232 79 249 65 S275 32 290 48 S314 69 328 58 S352 33 380 42"/></svg></div>
            <div class="bill-meta"><span>Billing period</span><b>01 Nov — 30 Nov</b></div>
            <div class="bill-meta"><span>Rate used</span><b>₱11.47 / kWh</b></div>
            <button class="text-button" id="viewBillButton">View bill breakdown <span>→</span></button>
          </article>

          <article class="panel devices-panel page-section" data-page-content="devices" id="devices">
            <div class="panel-heading"><div><div class="eyebrow">GRID INTELLIGENCE FROM CONNECTED DEVICES</div><h2>Live circuits</h2></div><div class="device-heading-actions"><button class="button button-primary compact-button" id="addDeviceInlineButton">+ Add device</button><button class="dots" aria-label="Device options">•••</button></div></div>
            <div class="device-list" id="deviceList"></div>
            <button class="text-button" id="allDevicesButton">View all channels <span>→</span></button>
          </article>

          <article class="panel challenge-panel page-section" data-page-content="observations" id="observations">
            <div class="page-note-grid"><div><div class="eyebrow">FIELD NOTES</div><h2>What happened today?</h2><p>Write a quick note when you turn an appliance on, notice an unusual bill, or experience an outage. This helps explain changes in your usage.</p></div><button class="button button-dark" id="logObservationInlineButton">+ Add a note</button></div>
            <div class="simple-note-examples"><span>Examples</span><button type="button" class="note-example" data-note="Turned on the air conditioner at 2:00 PM">Aircon turned on</button><button type="button" class="note-example" data-note="The power went out for 10 minutes">Short outage</button><button type="button" class="note-example" data-note="Used the washing machine twice today">Extra appliance use</button></div>
            <div class="challenge-actions"><button class="button button-dark" id="logObservationButton">Write a note <span>→</span></button><span class="field-count" id="noteCount">0 notes</span></div>
            <div class="saved-notes" id="savedNotes"><div class="empty-notes">Your saved notes will appear here.</div></div>
          </article>
        </section>

        <section class="page-section bill-extra-panel" data-page-content="bill" aria-label="Bill intelligence">
          <div class="eyebrow">BILL TRANSPARENCY</div><h2>From measured load to estimated cost</h2><p>Each line item is traceable to a configured breaker. Unmapped usage remains visible instead of being guessed.</p>
          <div class="bill-ledger"><div><span>Measured circuits</span><strong id="measuredCost">₱2,429</strong></div><div><span>Unmapped remainder</span><strong id="unmappedCost">₱1,413</strong></div><div><span>Rate assumption</span><strong>₱11.47 / kWh</strong></div></div>
        </section>

        <section class="insight-strip page-section" data-page-content="overview">
          <div class="insight-icon">✦</div>
          <div class="insight-copy"><div class="eyebrow">SHOCKVALUE INSIGHT</div><strong>Your air conditioner is using 44% of today's energy.</strong><span>Try raising the setpoint to 25°C for an estimated saving of ₱18.40 today.</span></div>
          <button class="button button-primary" id="applyTipButton">Apply tip</button>
          <button class="close-insight" id="closeInsightButton" aria-label="Dismiss insight">×</button>
        </section>
      </main>
    </div>
  </div>

  <dialog id="appDialog" class="app-dialog"><button class="dialog-close" id="dialogClose" aria-label="Close dialog">×</button><div id="dialogContent"></div></dialog>
  <script src="<?php echo e(asset('app.js')); ?>"></script>
</body>
</html>
<?php /**PATH C:\Users\falqu\Downloads\LINDBERGH\MeralcoShockvalue\Test2\TeamShockValue-larval\resources\views/dashboard.blade.php ENDPATH**/ ?>