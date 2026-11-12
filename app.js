const rangeData = {
  7: { labels: ['06 Nov', '07 Nov', '08 Nov', '09 Nov', '10 Nov', '11 Nov', '12 Nov'], usage: [22.4, 24.1, 21.8, 26.9, 24.7, 20.2, 18.6], average: 23.0 },
  30: { labels: ['14 Oct', '18 Oct', '22 Oct', '26 Oct', '30 Oct', '03 Nov', '07 Nov', '12 Nov'], usage: [24.4, 22.8, 25.2, 21.5, 26.1, 23.2, 21.2, 18.6], average: 23.1 },
  90: { labels: ['Aug', 'Sep', 'Oct', 'Nov'], usage: [26.8, 25.4, 24.7, 23.1], average: 25.0 }
};
const DEFAULT_DEVICES = [
  { id: 'ch-01', name: 'Air conditioner', room: 'Living room', channel: 'CH 01', power: 1.24, status: 'ON · 24°C', tone: 'cool', icon: '❄' },
  { id: 'ch-02', name: 'Refrigerator', room: 'Kitchen', channel: 'CH 02', power: 0.31, status: 'CYCLING', tone: 'warm', icon: '⌁' },
  { id: 'ch-05', name: 'Water heater', room: 'Bathroom', channel: 'CH 05', power: 0.00, status: 'OFF · 8h 12m', tone: 'sun', icon: '◒' },
  { id: 'ch-08', name: 'Bedroom outlets', room: 'Bedroom', channel: 'CH 08', power: 0.18, status: 'ON · 4 devices', tone: 'purple', icon: '⌁' }
];
const storageKeys = { devices: 'shockvalue.devices', history: 'shockvalue.history', user: 'shockvalue.user' };
function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function escapeHtml(value) { return String(value).replace(/[&<>\"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#039;' }[char])); }
let devices = load(storageKeys.devices, DEFAULT_DEVICES);
let readingsHistory = load(storageKeys.history, []);

const dialog = document.querySelector('#appDialog');
const dialogContent = document.querySelector('#dialogContent');
const usageCtx = document.querySelector('#usageChart');
let usageChart;

function renderDevices() {
  const list = document.querySelector('#deviceList');
  if (!list) return;
  list.innerHTML = devices.map(device => `<div class="device-row" data-device-id="${escapeHtml(device.id)}"><span class="device-icon ${escapeHtml(device.tone)}">${escapeHtml(device.icon)}</span><div class="device-name"><strong>${escapeHtml(device.name)}</strong><small>${escapeHtml(device.room)} · ${escapeHtml(device.channel)}</small></div><div class="device-reading"><strong>${Number(device.power).toFixed(2)} <small>kW</small></strong><span class="device-status ${device.power > 0.02 ? 'on' : 'off'}">${escapeHtml(device.status)}</span></div><span class="bar"><i style="width:${Math.min(100, Math.max(4, device.power / 1.45 * 100))}%"></i></span></div>`).join('');
  list.querySelectorAll('.device-row').forEach(row => row.addEventListener('click', () => editDevice(row.dataset.deviceId)));
  updateLiveCards();
}
function updateLiveCards() {
  const total = devices.reduce((sum, device) => sum + Number(device.power || 0), 0);
  const power = document.querySelector('#livePower'); if (power) power.textContent = total.toFixed(2);
  const usage = document.querySelector('#todayUsage'); if (usage) usage.textContent = (18.6 + Math.max(0, total - 1.73) * .12).toFixed(1);
  const sync = document.querySelector('#lastSynced'); if (sync) sync.textContent = 'just now';
}
function addHistorySnapshot() { readingsHistory = [...readingsHistory, { time: new Date().toISOString(), total: devices.reduce((sum, device) => sum + Number(device.power || 0), 0) }].slice(-720); save(storageKeys.history, readingsHistory); }
function simulateLiveReadings() { devices = devices.map(device => ({ ...device, power: Math.max(0, Number((Number(device.power) + (Math.random() - .48) * .04).toFixed(2))) })); save(storageKeys.devices, devices); renderDevices(); addHistorySnapshot(); }
function addDevice() {
  dialogContent.innerHTML = `<h3>Add a breaker channel</h3><p>Label a CT clamp now. The reading will appear on the Overview page and be retained in history.</p><form id="deviceForm" class="modal-form"><label>Appliance name<input name="name" required placeholder="e.g. Washing machine" /></label><label>Room or circuit<input name="room" required placeholder="e.g. Utility room" /></label><label>Breaker channel<select name="channel"><option>CH 03</option><option>CH 04</option><option>CH 06</option><option>CH 07</option><option>CH 09</option><option>CH 10</option><option>CH 11</option><option>CH 12</option><option>CH 13</option><option>CH 14</option></select></label><button class="button button-primary" type="submit">Save device</button></form>`;
  dialog.showModal();
  document.querySelector('#deviceForm').addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.currentTarget); devices.push({ id: `ch-${Date.now()}`, name: form.get('name'), room: form.get('room'), channel: form.get('channel'), power: 0, status: 'OFF · waiting for reading', tone: 'purple', icon: '⌁' }); save(storageKeys.devices, devices); renderDevices(); dialog.close(); openDialog('Device added', `${form.get('name')} is now mapped to ${form.get('channel')}.`); });
}
function editDevice(id) {
  const device = devices.find(item => item.id === id); if (!device) return;
  dialogContent.innerHTML = `<h3>Edit ${escapeHtml(device.name)}</h3><p>Change the label used for this breaker channel.</p><form id="editDeviceForm" class="modal-form"><label>Appliance name<input name="name" required value="${escapeHtml(device.name)}" /></label><label>Room or circuit<input name="room" required value="${escapeHtml(device.room)}" /></label><button class="button button-primary" type="submit">Save changes</button><button class="button button-secondary" type="button" id="removeDeviceButton">Remove mapping</button></form>`;
  dialog.showModal();
  document.querySelector('#editDeviceForm').addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.currentTarget); device.name = form.get('name'); device.room = form.get('room'); save(storageKeys.devices, devices); renderDevices(); dialog.close(); });
  document.querySelector('#removeDeviceButton').addEventListener('click', () => { devices = devices.filter(item => item.id !== id); save(storageKeys.devices, devices); renderDevices(); dialog.close(); });
}
function showAuth() {
  dialogContent.innerHTML = `<h3>Welcome to Shockvalue</h3><p>Sign in to keep your labels and weekly history in this browser.</p><div class="auth-tabs"><button class="auth-tab active" data-auth-mode="login">Login</button><button class="auth-tab" data-auth-mode="signup">Sign up</button></div><form id="authForm" class="modal-form"><label>Email<input name="email" type="email" required placeholder="you@example.com" /></label><label>Password<input name="password" type="password" required minlength="6" placeholder="At least 6 characters" /></label><button class="button button-primary" type="submit">Continue</button></form>`;
  dialog.showModal();
  document.querySelectorAll('.auth-tab').forEach(tab => tab.addEventListener('click', () => { document.querySelectorAll('.auth-tab').forEach(item => item.classList.remove('active')); tab.classList.add('active'); document.querySelector('#authForm button').textContent = tab.dataset.authMode === 'signup' ? 'Create account' : 'Continue'; }));
  document.querySelector('#authForm').addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.currentTarget); save(storageKeys.user, { email: form.get('email') }); dialog.close(); document.querySelector('#authButton').textContent = 'Account'; });
}
function renderPage(page) {
  const target = page || 'overview';
  document.body.dataset.page = target;
  document.querySelectorAll('[data-page-content]').forEach(section => section.classList.toggle('is-hidden', section.dataset.pageContent !== target));
  document.querySelectorAll('[data-page-link]').forEach(link => link.classList.toggle('active', link.dataset.pageLink === target));
}
function navigate(event) { event.preventDefault(); const page = event.currentTarget.getAttribute('href').slice(1) || 'overview'; window.location.hash = page; renderPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }

function renderChart(days = 7) {
  const data = rangeData[days];
  if (usageChart) usageChart.destroy();
  usageChart = new Chart(usageCtx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        { label: 'Actual usage', data: data.usage, borderColor: '#2864db', backgroundColor: 'rgba(40,100,219,.08)', fill: true, borderWidth: 2, pointRadius: 3, pointHoverRadius: 5, pointBackgroundColor: '#2864db', tension: .36 },
        { label: 'Daily average', data: data.labels.map(() => data.average), borderColor: '#9aa39f', borderDash: [5, 5], borderWidth: 1.2, pointRadius: 0, fill: false, tension: 0 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#172020', padding: 10, displayColors: false, callbacks: { label: item => `${item.dataset.label}: ${item.parsed.y} kWh` } } },
      scales: { x: { grid: { display: false }, ticks: { color: '#87918d', font: { family: 'DM Mono', size: 10 } } }, y: { beginAtZero: true, suggestedMax: 32, grid: { color: '#edf0ed' }, ticks: { color: '#87918d', font: { family: 'DM Mono', size: 10 }, callback: value => `${value}` } } }
    }
  });
  document.querySelector('#peakUsage').textContent = `${Math.max(...data.usage).toFixed(1)} kWh`;
}

function openDialog(title, body, list = []) {
  dialogContent.innerHTML = `<h3>${title}</h3><p>${body}</p>${list.length ? `<ul class="dialog-list">${list.map(item => `<li><strong>${item[0]}</strong><span>${item[1]}</span></li>`).join('')}</ul>` : ''}`;
  dialog.showModal();
}

document.querySelectorAll('.range-button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.range-button').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  renderChart(Number(button.dataset.range));
}));

document.querySelectorAll('[data-page-link]').forEach(link => link.addEventListener('click', navigate));
window.addEventListener('hashchange', () => renderPage(window.location.hash.slice(1) || 'overview'));
document.querySelector('#dialogClose').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
document.querySelector('#notificationButton').addEventListener('click', () => openDialog('Notifications', 'Two updates are waiting in your control room.', [['Peak load detected', '10:42 AM'], ['Tip ready to apply', 'Today']]));
document.querySelector('#profileButton').addEventListener('click', () => openDialog('Ari Santos', 'San Juan home · Homeowner account', [['Plan', 'Residential'], ['Data sharing', 'On-device + private']]));
document.querySelector('#helpButton').addEventListener('click', () => openDialog('Help & safety', 'Energy readings are advisory. Never install CT clamps or open a service panel yourself—ask a licensed electrician.', [['Hardware', 'ESP32 + CT clamp'], ['Emergency', 'Call a licensed electrician']]));
document.querySelector('#viewBillButton').addEventListener('click', () => openDialog('Bill breakdown', 'Your forecast is trending 6.4% lower than last month.', [['Air conditioner', '₱1,692'], ['Refrigerator', '₱436'], ['Bedroom outlets', '₱301'], ['Other circuits', '₱1,413']]));
document.querySelector('#allDevicesButton').addEventListener('click', () => openDialog('All 14 channels', 'The monitor is receiving data from every configured circuit.', devices.map(device => [device.channel, `${device.name} · ${Number(device.power).toFixed(2)} kW`])));
document.querySelector('#addDeviceButton').addEventListener('click', addDevice);
document.querySelector('#addDeviceInlineButton').addEventListener('click', addDevice);
document.querySelector('#authButton').addEventListener('click', showAuth);
document.querySelector('#logObservationButton').addEventListener('click', () => openDialog('Log a field observation', 'Capture what happened on-site so your usage data has context.', [['Observation type', 'Appliance / meter / outage'], ['Photo', 'Optional'], ['Location', 'San Juan home']]));
document.querySelector('#exportButton').addEventListener('click', () => {
  const report = 'Meralco Shockvalue — Energy report\n\nLive power: 2.84 kW\nToday: 18.6 kWh\nEstimated bill: ₱3,842\nCarbon avoided: 12.4 kg\n';
  const blob = new Blob([report], { type: 'text/plain' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'meralco-shockvalue-report.txt'; link.click(); URL.revokeObjectURL(link.href);
});
document.querySelector('#applyTipButton').addEventListener('click', event => { event.currentTarget.textContent = 'Tip applied ✓'; event.currentTarget.disabled = true; });
document.querySelector('#closeInsightButton').addEventListener('click', () => document.querySelector('.insight-strip').remove());

renderDevices();
renderChart();
renderPage(window.location.hash.slice(1) || 'overview');
addHistorySnapshot();
window.setInterval(simulateLiveReadings, 5000);
