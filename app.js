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
const storageKeys = { devices: 'shockvalue.devices', history: 'shockvalue.history', user: 'shockvalue.user', notes: 'shockvalue.notes' };
function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function escapeHtml(value) { return String(value).replace(/[&<>\"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#039;' }[char])); }
let devices = load(storageKeys.devices, DEFAULT_DEVICES);
let readingsHistory = load(storageKeys.history, []);
let notes = load(storageKeys.notes, []);

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
function addHistorySnapshot() { readingsHistory = [...readingsHistory, { time: new Date().toISOString(), total: devices.reduce((sum, device) => sum + Number(device.power || 0), 0) }].slice(-720); save(storageKeys.history, readingsHistory); updateGridIntelligence(); }
function updateGridIntelligence(forcePeak = false) {
  const total = devices.reduce((sum, device) => sum + Number(device.power || 0), 0);
  const load = forcePeak ? Math.min(94, 72 + total * 4) : Math.min(92, Math.round(total / 7.4 * 100));
  const headroom = forcePeak ? Math.max(.18, 7.4 - total * 1.5) : Math.max(.2, 7.4 - total);
  const forecast = forcePeak ? total * 1.35 : total * (1 + Math.max(0, load - 35) / 400);
  const trust = forcePeak ? 91 : Math.max(86, Math.round(98 - Math.random() * 4));
  const danger = forcePeak || load >= 75;
  const set = (id, value) => { const element = document.querySelector(id); if (element) element.textContent = value; };
  set('#transformerLoad', `${load}%`); set('#headroom', `${headroom.toFixed(2)} kW`); set('#forecastLoad', `${forecast.toFixed(2)} kW`); set('#telemetryTrust', `${trust}%`);
  set('#thermalCopy', danger ? 'Watch thermal envelope' : 'Normal thermal band'); set('#forecastCopy', danger ? 'Peak risk in next 60 min' : 'Trend-based estimate'); set('#telemetryCopy', trust < 94 ? 'One sample needs review' : 'Fresh sensor samples');
  const measuredCost = document.querySelector('#measuredCost'); const unmappedCost = document.querySelector('#unmappedCost'); const totalBill = 3842; const measured = Math.min(totalBill, Math.round(total * 720 / 30 * 11.47)); if (measuredCost) measuredCost.textContent = `₱${measured.toLocaleString()}`; if (unmappedCost) unmappedCost.textContent = `₱${Math.max(0, totalBill - measured).toLocaleString()}`;
  const badge = document.querySelector('#gridStatusBadge'); const statusText = document.querySelector('#gridStatusText'); if (badge && statusText) { badge.classList.toggle('alert', danger); badge.classList.toggle('stable', !danger); statusText.textContent = danger ? 'WATCH' : 'STABLE'; }
  const alert = document.querySelector('#gridAlert'); if (alert) alert.innerHTML = danger ? '<span>!</span><div><strong>Neighborhood peak risk detected</strong><small>Shift flexible loads or delay the water heater to protect local headroom.</small></div>' : '<span>✓</span><div><strong>No local constraint detected</strong><small>All monitored circuits are inside their expected envelope.</small></div>';
  set('#gridEventTitle', danger ? 'Peak event — response suggested' : 'Grid pulse monitoring'); set('#gridEventCopy', danger ? 'Digital twin predicts the local transformer may cross its preferred operating band.' : 'The prototype is comparing live load against a safe local transformer envelope.'); set('#gridEventState', danger ? 'ACTION' : 'MONITORING');
}

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
function loadProfile() {
  const profile = load('shockvalue.profile', { username: 'Ari Santos', userId: '#123456789', email: 'ari.santos@example.com' });
  const username = document.querySelector('#profileUsername'); const userId = document.querySelector('#profileUserId'); const email = document.querySelector('#profileEmail');
  if (username) username.value = profile.username; if (userId) userId.value = profile.userId; if (email) email.value = profile.email;
  const initials = document.querySelector('#profileInitials'); if (initials) initials.textContent = profile.username.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
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
document.querySelector('#profileForm').addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.currentTarget); const profile = { username: form.get('username'), userId: form.get('userId'), email: form.get('email') }; save('shockvalue.profile', profile); document.querySelector('#profileInitials').textContent = profile.username.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase(); document.querySelector('#profileStatus').textContent = 'Profile saved locally.'; });
document.querySelector('#logoutButton').addEventListener('click', () => { localStorage.removeItem(storageKeys.user); document.querySelector('#authButton').textContent = 'Sign in'; window.location.hash = 'overview'; openDialog('Logged out', 'Your local session has been cleared.'); });
function renderNotes() {
  const list = document.querySelector('#savedNotes'); const count = document.querySelector('#noteCount'); if (!list) return;
  if (count) count.textContent = `${notes.length} note${notes.length === 1 ? '' : 's'}`;
  list.innerHTML = notes.length ? notes.slice().reverse().map(note => `<article class="saved-note" data-note-id="${escapeHtml(note.id)}"><p>${escapeHtml(note.text)}</p><div class="saved-note-meta"><span>${escapeHtml(note.when ? new Date(note.when).toLocaleString() : 'Just now')}</span><span>Click to edit</span></div></article>`).join('') : '<div class="empty-notes">Your saved notes will appear here.</div>';
  list.querySelectorAll('.saved-note').forEach(item => item.addEventListener('click', () => editNote(item.dataset.noteId)));
}
function openNoteForm(prefill = '', existing = null) {
  dialogContent.innerHTML = `<h3>${existing ? 'Edit your note' : 'Write a quick note'}</h3><p>What happened? A short note helps explain changes in your electricity use.</p><form id="noteForm" class="modal-form"><label>Your note<textarea name="note" rows="4" required placeholder="Example: Turned on the air conditioner at 2:00 PM">${escapeHtml(existing ? existing.text : prefill)}</textarea></label><label>When did it happen?<input name="when" type="datetime-local" value="${existing && existing.when ? new Date(existing.when).toISOString().slice(0, 16) : ''}" /></label><button class="button button-primary" type="submit">${existing ? 'Save changes' : 'Save note'}</button>${existing ? '<button class="button button-secondary" type="button" id="deleteNoteButton">Delete note</button>' : ''}</form>`;
  dialog.showModal();
  document.querySelector('#noteForm').addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.currentTarget); const updated = { id: existing ? existing.id : `note-${Date.now()}`, text: form.get('note'), when: form.get('when') || new Date().toISOString() }; if (existing) notes = notes.map(note => note.id === existing.id ? updated : note); else notes.push(updated); save(storageKeys.notes, notes); renderNotes(); dialog.close(); });
  if (existing) document.querySelector('#deleteNoteButton').addEventListener('click', () => { notes = notes.filter(note => note.id !== existing.id); save(storageKeys.notes, notes); renderNotes(); dialog.close(); });
}
function editNote(id) { const note = notes.find(item => item.id === id); if (note) openNoteForm('', note); }
document.querySelector('#logObservationButton').addEventListener('click', () => openNoteForm());
document.querySelector('#logObservationInlineButton').addEventListener('click', () => openNoteForm());
document.querySelectorAll('.note-example').forEach(button => button.addEventListener('click', () => openNoteForm(button.dataset.note)));
document.querySelector('#exportButton').addEventListener('click', () => {
  const report = 'Meralco Shockvalue — Energy report\n\nLive power: 2.84 kW\nToday: 18.6 kWh\nEstimated bill: ₱3,842\nCarbon avoided: 12.4 kg\n';
  const blob = new Blob([report], { type: 'text/plain' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'meralco-shockvalue-report.txt'; link.click(); URL.revokeObjectURL(link.href);
});
document.querySelector('#applyTipButton').addEventListener('click', event => { event.currentTarget.textContent = 'Tip applied ✓'; event.currentTarget.disabled = true; });
document.querySelector('#simulatePeakButton').addEventListener('click', () => { updateGridIntelligence(true); openDialog('Neighborhood peak simulation', 'A high-demand event was simulated. The digital twin recommends delaying flexible loads and notifying field operations.', [['Transformer load', document.querySelector('#transformerLoad').textContent], ['Headroom', document.querySelector('#headroom').textContent], ['Recommended action', 'Delay water heater / EV charging']]); });
document.querySelector('#closeInsightButton').addEventListener('click', () => document.querySelector('.insight-strip').remove());

loadProfile();
renderNotes();
renderDevices();
renderChart();
renderPage(window.location.hash.slice(1) || 'overview');
addHistorySnapshot();
updateGridIntelligence();
window.setInterval(simulateLiveReadings, 5000);
