const rangeData = {
  7: { labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], start: 18.6, additions: [0, 1.4, 0.8, 2.1, 1.2, 2.4, 1.6] },
  30: { labels: Array.from({ length: 30 }, (_, index) => `Day ${index + 1}`), start: 18.6, additions: [0, 1.4, 0.8, 2.1, 1.2, 2.4, 1.6, 1.1, 2.2, 1.7, 0.9, 1.8, 2.6, 1.3, 1.5, 2.0, 1.0, 2.4, 1.7, 1.2, 2.1, 1.6, 0.7, 1.9, 2.3, 1.4, 1.8, 1.1, 2.0, 1.5] }
};
const billData = {
  weekly: { labels: ['W1', 'W2', 'W3', 'W4', 'Now'], carried: [42, 48, 53, 60, 66], added: [14, 11, 16, 13, 9] },
  monthly: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], carried: [38, 44, 51, 58, 64, 70], added: [12, 14, 10, 15, 12, 9] }
};
function cumulativeUsage(start, additions) {
  let total = start;
  return additions.map((addition, index) => {
    if (index > 0) total += addition;
    return Number(total.toFixed(1));
  });
}
const DEFAULT_DEVICES = [
  { id: 'ch-01', name: 'Air conditioner', room: 'Living room', channel: 'CH 01', power: 1.24, status: 'ON · 24°C', tone: 'cool', icon: '❄' },
  { id: 'ch-02', name: 'Refrigerator', room: 'Kitchen', channel: 'CH 02', power: 0.31, status: 'CYCLING', tone: 'warm', icon: '⌁' },
  { id: 'ch-05', name: 'Water heater', room: 'Bathroom', channel: 'CH 05', power: 0.00, status: 'OFF · 8h 12m', tone: 'sun', icon: '◒' },
  { id: 'ch-08', name: 'Bedroom outlets', room: 'Bedroom', channel: 'CH 08', power: 0.18, status: 'ON · 4 devices', tone: 'purple', icon: '⌁' }
];
const DEVICE_TYPES = {
  main: { label: 'Main', icon: '⚡', tone: 'cool' },
  kitchen_appliances: { label: 'Kitchen Appliances', icon: '⌁', tone: 'warm' },
  electronics: { label: 'Electronics', icon: '⚡', tone: 'cool' },
  ev_charger: { label: 'EV Charger', icon: '🔌', tone: 'purple' },
  other: { label: 'Other', icon: '⌁', tone: 'purple' }
};
const DEVICE_ICONS = [
  { icon: '❄', label: 'Snowflake' }, { icon: '🧊', label: 'Ice' }, { icon: '🌬', label: 'Air' }, { icon: '🌀', label: 'Fan' },
  { icon: '💧', label: 'Water' }, { icon: '🚿', label: 'Shower' }, { icon: '♨', label: 'Heat' }, { icon: '🔥', label: 'Flame' },
  { icon: '⌁', label: 'Wave' }, { icon: '⚡', label: 'Power' }, { icon: '💡', label: 'Light' }, { icon: '🔌', label: 'Plug' }
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
  list.innerHTML = devices.map(device => {
    const isOn = Number(device.power) > 0.02;
    const savedStatus = String(device.status || '');
    const status = isOn && /^OFF\b/i.test(savedStatus) ? 'ON' : (!isOn && /^ON\b/i.test(savedStatus) ? 'OFF · waiting for reading' : savedStatus || (isOn ? 'ON' : 'OFF'));
    return `<div class="device-row" data-device-id="${escapeHtml(device.id)}" tabindex="0" role="button" aria-label="View ${escapeHtml(device.name)} circuit details"><span class="device-icon ${escapeHtml(device.tone)}">${escapeHtml(device.icon)}</span><div class="device-name"><strong>${escapeHtml(device.name)}</strong><small>${escapeHtml(device.room)} · ${escapeHtml(device.channel)}</small></div><div class="device-reading"><strong>${Number(device.power).toFixed(2)} <small>kW</small></strong><span class="device-status ${isOn ? 'on' : 'off'}">${escapeHtml(status)}</span></div><span class="bar"><i style="width:${Math.min(100, Math.max(4, device.power / 1.45 * 100))}%"></i></span></div>`;
  }).join('');
  list.querySelectorAll('.device-row').forEach(row => {
    row.addEventListener('click', () => editDevice(row.dataset.deviceId));
    row.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); editDevice(row.dataset.deviceId); } });
  });
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
  const alert = document.querySelector('#gridAlert'); const alertRow = document.querySelector('#gridAlertRow'); if (alert && alertRow) { alertRow.hidden = !danger; alert.innerHTML = danger ? '<span>!</span><div><strong>Neighborhood peak risk detected</strong><small>Shift flexible loads or delay the water heater to protect local headroom.</small></div>' : ''; }
  set('#gridEventTitle', danger ? 'Peak event — response suggested' : 'Grid pulse monitoring'); set('#gridEventCopy', danger ? 'Digital twin predicts the local transformer may cross its preferred operating band.' : 'The prototype is comparing live load against a safe local transformer envelope.'); set('#gridEventState', danger ? 'ACTION' : 'MONITORING');
}

function simulateLiveReadings() { devices = devices.map(device => ({ ...device, power: Math.max(0, Number((Number(device.power) + (Math.random() - .48) * .04).toFixed(2))) })); save(storageKeys.devices, devices); renderDevices(); addHistorySnapshot(); }
function channelNumber(value) {
  const number = Number(String(value ?? '').match(/\d+/)?.[0]);
  return Number.isInteger(number) && number >= 1 && number <= 16 ? number : null;
}
function availableChannels() {
  const assignedExclusiveChannels = new Set(devices.map(device => channelNumber(device.channel)).filter(number => number === 1 || number === 2));
  return Array.from({ length: 16 }, (_, index) => index + 1)
    .filter(number => number > 2 || !assignedExclusiveChannels.has(number))
    .map(number => `CH ${String(number).padStart(2, '0')}`);
}
function getDeviceType(device) {
  if (DEVICE_TYPES[device.type]) return device.type;
  const legacyTypes = { refrigerator: 'kitchen_appliances', air_conditioner: 'electronics', water_heater: 'other' };
  if (legacyTypes[device.type]) return legacyTypes[device.type];
  const name = String(device.name || '').toLowerCase();
  if (name.includes('refrigerator') || name.includes('fridge')) return 'kitchen_appliances';
  if (name.includes('air conditioner') || name.includes('aircon') || name.includes('air con')) return 'electronics';
  return 'other';
}
function renderIconPicker(selectedIcon) {
  return `<input type="hidden" name="icon" value="${escapeHtml(selectedIcon)}"><div class="icon-picker" role="group" aria-label="Choose an icon">${DEVICE_ICONS.map(({ icon, label }) => `<button type="button" class="icon-choice" data-icon="${escapeHtml(icon)}" aria-label="${label}" aria-pressed="${icon === selectedIcon}"><span class="icon-choice-preview">${escapeHtml(icon)}</span><small>${label}</small></button>`).join('')}</div>`;
}
function bindIconPicker(form) {
  form.querySelector('.icon-picker').addEventListener('click', event => {
    const choice = event.target.closest('.icon-choice');
    if (!choice) return;
    form.querySelector('input[name="icon"]').value = choice.dataset.icon;
    form.querySelectorAll('.icon-choice').forEach(button => button.setAttribute('aria-pressed', String(button === choice)));
  });
}
function addDevice() {
  const channels = availableChannels();
  const channelOptions = channels.map(channel => `<option value="${channel}">${channel}</option>`).join('');
  const typeOptions = Object.entries(DEVICE_TYPES).map(([value, type]) => `<option value="${value}">${type.label}</option>`).join('');
  dialogContent.innerHTML = `<h3>Add a breaker channel</h3><p>Label a CT clamp now. The reading will appear on the Overview page and be retained in history.</p><form id="deviceForm" class="modal-form"><label>Device type<select name="type" required>${typeOptions}</select></label><div class="icon-picker-field"><span class="icon-picker-label">Choose an icon</span>${renderIconPicker(DEVICE_TYPES.kitchen_appliances.icon)}</div><label>Appliance name<input name="name" required placeholder="e.g. Washing machine" /></label><label>Room or circuit<input name="room" required placeholder="e.g. Utility room" /></label><label>Breaker channel<select name="channel" required ${channels.length ? '' : 'disabled'}>${channelOptions || '<option value="">No channels available</option>'}</select></label><button class="button button-primary" type="submit" ${channels.length ? '' : 'disabled'}>Save device</button></form>`;
  dialog.showModal();
  bindIconPicker(document.querySelector('#deviceForm'));
  document.querySelector('#deviceForm').addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.currentTarget); const channel = form.get('channel'); if (!availableChannels().some(available => channelNumber(available) === channelNumber(channel))) { dialog.close(); addDevice(); return; } const type = form.get('type'); const presentation = DEVICE_TYPES[type] || DEVICE_TYPES.other; devices.push({ id: `ch-${Date.now()}`, name: form.get('name'), type, room: form.get('room'), channel, power: 0, status: 'OFF · waiting for reading', tone: presentation.tone, icon: form.get('icon') || presentation.icon }); save(storageKeys.devices, devices); renderDevices(); dialog.close(); openDialog('Device added', `${form.get('name')} is now mapped to ${channel}.`); });
}
function editDevice(id) {
  const device = devices.find(item => item.id === id); if (!device) return;
  const type = getDeviceType(device);
  const typeOptions = Object.entries(DEVICE_TYPES).map(([value, option]) => `<option value="${value}" ${value === type ? 'selected' : ''}>${option.label}</option>`).join('');
  dialogContent.innerHTML = `<h3>Edit ${escapeHtml(device.name)}</h3><p>Change the device type and label used for this breaker channel.</p><form id="editDeviceForm" class="modal-form"><label>Device type<select name="type" required>${typeOptions}</select></label><div class="icon-picker-field"><span class="icon-picker-label">Choose an icon</span>${renderIconPicker(device.icon || DEVICE_TYPES[type].icon)}</div><label>Appliance name<input name="name" required value="${escapeHtml(device.name)}" /></label><label>Room or circuit<input name="room" required value="${escapeHtml(device.room)}" /></label><button class="button button-primary" type="submit">Save changes</button><button class="button button-secondary" type="button" id="removeDeviceButton">Remove mapping</button></form>`;
  dialog.showModal();
  bindIconPicker(document.querySelector('#editDeviceForm'));
  document.querySelector('#editDeviceForm').addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.currentTarget); device.name = form.get('name'); device.room = form.get('room'); device.type = form.get('type'); const presentation = DEVICE_TYPES[device.type] || DEVICE_TYPES.other; device.tone = presentation.tone; device.icon = form.get('icon') || presentation.icon; save(storageKeys.devices, devices); renderDevices(); dialog.close(); });
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
  const usage = cumulativeUsage(data.start, data.additions);
  let runningTotal = data.start;
  const carriedForward = data.additions.map((addition, index) => {
    if (index === 0) return data.start;
    const previousTotal = runningTotal;
    runningTotal += addition;
    return Number(previousTotal.toFixed(1));
  });
  const dailyChanges = data.additions.map((addition, index) => index === 0 ? 0 : addition);
  const usageScaleMax = Math.ceil(Math.max(...usage) * 1.1);
  if (usageChart) usageChart.destroy();
  usageChart = new Chart(usageCtx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        { label: 'Previous total', data: carriedForward, backgroundColor: '#b9d5ff', borderRadius: 3, borderSkipped: false, maxBarThickness: 34, stack: 'consumption' },
        { label: 'Additional consumption', data: dailyChanges, backgroundColor: '#2864db', borderRadius: 3, borderSkipped: false, maxBarThickness: 34, stack: 'consumption' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#172020', padding: 10, displayColors: true, callbacks: { label: item => `${item.dataset.label}: ${item.parsed.y} kWh`, footer: items => `Total: ${items.reduce((sum, item) => sum + item.parsed.y, 0).toFixed(1)} kWh` } } },
      scales: { x: { stacked: true, grid: { display: false }, ticks: { autoSkip: days === 30, maxTicksLimit: days === 30 ? 10 : 7, color: '#87918d', font: { family: 'DM Mono', size: 10 } } }, y: { stacked: true, beginAtZero: true, suggestedMax: usageScaleMax, max: usageScaleMax, grid: { color: '#edf0ed' }, ticks: { color: '#87918d', font: { family: 'DM Mono', size: 10 }, callback: value => `${value} kWh` } } }
    }
  });
  document.querySelector('#peakUsage').textContent = `${usage[usage.length - 1].toFixed(1)} kWh`;
}

function renderBillBars(view = 'weekly') {
  const data = billData[view];
  const container = document.querySelector(`[data-bill-view="${view}"]`);
  if (!container) return;
  const totals = data.carried.map((value, index) => value + data.added[index]);
  const scaleMax = Math.ceil(Math.max(...totals) * 1.1);
  const forecastAmount = Number(document.querySelector('.bill-amount')?.textContent.replace(/[^\d.]/g, '')) || 0;
  const latestTotal = totals[totals.length - 1] || 1;
  const formatAmount = amount => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
  container.innerHTML = data.labels.map((label, index) => {
    const previousAmount = Math.round(data.carried[index] / latestTotal * forecastAmount);
    const addedAmount = Math.round(data.added[index] / latestTotal * forecastAmount);
    const totalAmount = Math.round(totals[index] / latestTotal * forecastAmount);
    const summary = `${label}: before ${formatAmount(previousAmount)}, added ${formatAmount(addedAmount)}, total ${formatAmount(totalAmount)}`;
    return `<div class="bill-bar-group" tabindex="0" aria-label="${escapeHtml(summary)}"><div class="bill-bar"><i class="bill-bar-base" style="height:${data.carried[index] / scaleMax * 100}%"></i><i class="bill-bar-change" style="height:${data.added[index] / scaleMax * 100}%"></i></div><small>${escapeHtml(label)}</small><div class="bill-bar-tooltip" role="tooltip"><strong>${escapeHtml(label)}</strong><span>Before: ${formatAmount(previousAmount)}</span><span>Added: ${formatAmount(addedAmount)}</span><span>Total: ${formatAmount(totalAmount)}</span></div></div>`;
  }).join('');
  container.setAttribute('aria-label', `${view} bill trend scaled to ${scaleMax} units`);
}

function openDialog(title, body, list = []) {
  dialogContent.innerHTML = `<h3>${title}</h3><p>${body}</p>${list.length ? `<ul class="dialog-list">${list.map(item => `<li><strong>${item[0]}</strong><span>${item[1]}</span></li>`).join('')}</ul>` : ''}`;
  dialog.showModal();
}
function closeDevicesMenu() {
  const menu = document.querySelector('#devicesMenu');
  const button = document.querySelector('#devicesMenuButton');
  if (menu) menu.hidden = true;
  if (button) button.setAttribute('aria-expanded', 'false');
}
function confirmRemoveAllDevices() {
  closeDevicesMenu();
  dialogContent.innerHTML = `<h3>Remove all devices?</h3><p>This will remove every device mapping from the dashboard. Your usage history will remain.</p><div class="dialog-actions"><button class="button button-secondary" id="cancelRemoveAllDevices" type="button">Cancel</button><button class="button button-danger" id="confirmRemoveAllDevices" type="button">Remove all devices</button></div>`;
  dialog.showModal();
  document.querySelector('#cancelRemoveAllDevices').addEventListener('click', () => dialog.close());
  document.querySelector('#confirmRemoveAllDevices').addEventListener('click', () => {
    devices = [];
    save(storageKeys.devices, devices);
    renderDevices();
    dialog.close();
    openDialog('Devices removed', 'All device mappings have been removed.');
  });
}

document.querySelectorAll('.range-button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.range-button').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  renderChart(Number(button.dataset.range));
}));
document.querySelectorAll('[data-bill-range]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-bill-range]').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('[data-bill-view]').forEach(view => view.classList.toggle('active', view.dataset.billView === button.dataset.billRange));
  renderBillBars(button.dataset.billRange);
  button.classList.add('active');
}));

document.querySelectorAll('[data-page-link]').forEach(link => link.addEventListener('click', navigate));
window.addEventListener('hashchange', () => renderPage(window.location.hash.slice(1) || 'overview'));
document.querySelector('#dialogClose').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
document.querySelector('#notificationButton').addEventListener('click', () => openDialog('Notifications', 'You’re all caught up. There are no notifications right now.'));
document.querySelector('#profileButton').addEventListener('click', () => openDialog('Ari Santos', 'San Juan home · Homeowner account', [['Plan', 'Residential'], ['Data sharing', 'On-device + private']]));
document.querySelector('#helpButton').addEventListener('click', () => openDialog('Help & safety', 'Energy readings are advisory. Never install CT clamps or open a service panel yourself—ask a licensed electrician.', [['Hardware', 'ESP32 + CT clamp'], ['Emergency', 'Call a licensed electrician']]));
document.querySelector('#viewBillButton').addEventListener('click', () => openDialog('Bill breakdown', 'Your forecast is trending 6.4% lower than last month.', [['Air conditioner', '₱1,692'], ['Refrigerator', '₱436'], ['Bedroom outlets', '₱301'], ['Other circuits', '₱1,413']]));
document.querySelector('#allDevicesButton').addEventListener('click', () => openDialog('All 16 channels', 'The monitor is receiving data from every configured circuit.', devices.map(device => [device.channel, `${device.name} · ${Number(device.power).toFixed(2)} kW`])));
document.querySelector('#addDeviceButton').addEventListener('click', addDevice);
document.querySelector('#addDeviceInlineButton').addEventListener('click', addDevice);
document.querySelector('#devicesMenuButton').addEventListener('click', event => {
  event.stopPropagation();
  const menu = document.querySelector('#devicesMenu');
  menu.hidden = !menu.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!menu.hidden));
});
document.querySelector('#removeAllDevicesButton').addEventListener('click', confirmRemoveAllDevices);
document.addEventListener('click', event => { if (!event.target.closest('.devices-menu-wrap')) closeDevicesMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDevicesMenu(); });
document.querySelector('#authButton').addEventListener('click', showAuth);
document.querySelector('#profileForm').addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.currentTarget); const profile = { username: form.get('username'), userId: form.get('userId'), email: form.get('email') }; save('shockvalue.profile', profile); document.querySelector('#profileInitials').textContent = profile.username.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase(); document.querySelector('#profileStatus').textContent = 'Profile saved locally.'; });
document.querySelector('#logoutButton').addEventListener('click', () => { localStorage.removeItem(storageKeys.user); document.querySelector('#authButton').textContent = 'Sign in'; window.location.hash = 'overview'; openDialog('Logged out', 'Your local session has been cleared.'); });
document.querySelector('#exportButton').addEventListener('click', () => {
  const report = 'Meralco Shockvalue — Energy report\n\nLive power: 2.84 kW\nToday: 18.6 kWh\nEstimated bill: ₱3,842\nCarbon avoided: 12.4 kg\n';
  const blob = new Blob([report], { type: 'text/plain' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'meralco-shockvalue-report.txt'; link.click(); URL.revokeObjectURL(link.href);
});
document.querySelector('#simulatePeakButton').addEventListener('click', () => { updateGridIntelligence(true); openDialog('Neighborhood peak simulation', 'A high-demand event was simulated. The digital twin recommends delaying flexible loads and notifying field operations.', [['Transformer load', document.querySelector('#transformerLoad').textContent], ['Headroom', document.querySelector('#headroom').textContent], ['Recommended action', 'Delay water heater / EV charging']]); });

function updateDashboardClock() {
  const now = new Date();
  const date = new Intl.DateTimeFormat('en-PH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Manila' }).format(now).toUpperCase();
  const time = new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' }).format(now);
  const dateElement = document.querySelector('#dashboardLocalDate');
  const timeElement = document.querySelector('#dashboardLocalTime');
  if (dateElement) dateElement.textContent = date;
  if (timeElement) timeElement.textContent = time;
}
updateDashboardClock();
window.setInterval(updateDashboardClock, 1000);
loadProfile();

renderDevices();
renderChart();
renderBillBars('weekly');
renderBillBars('monthly');
renderPage(window.location.hash.slice(1) || 'overview');
addHistorySnapshot();
updateGridIntelligence();
window.setInterval(simulateLiveReadings, 5000);
