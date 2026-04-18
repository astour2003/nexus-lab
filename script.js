// ===================== STATE =====================
const DEPT_DATA = {
  electronics: { name: 'Electronics Engineering', dept: 'M.Product Engineering', eum: 'Saad ECH-CHARRAQ', spoc: 'Hasna EL MAARADI' },
  hardware:    { name: 'Intelligent Hardware',    dept: 'M.Connected Systems',   eum: 'Btissam CHAHBOUN',  spoc: 'Bouchra Ghazal' },
  smart:       { name: 'Smart Systems',           dept: 'EE Archi & Safety',     eum: 'Daoud WASSAD',      spoc: 'Daoud WASSAD' },
  ai:          { name: 'Next Gen AI',             dept: 'Embedded Software',     eum: 'Zakaria BOURZOUK',  spoc: 'Mohamed GHOUAT' },
  twins:       { name: 'Digital Twins',           dept: 'Modeling & Simulation', eum: 'Ahmed Amine KERBICH', spoc: 'Chadia JADIANI' }
};

let PROJECTS = [
  { id: 'P17', name: "Infotainment Showroom", priority: 'medium', progress: 0.85, status: 'Ongoing', dept: 'hardware', eum: 'Btissam CHAHBOUN', spoc: 'Bouchra Ghazal' },
  { id: 'P18', name: 'Smart Automotive Cockpit', priority: 'high', progress: 0.25, status: 'Ongoing', dept: 'hardware', eum: 'Btissam CHAHBOUN', spoc: 'Bouchra Ghazal' },
  { id: 'P19', name: 'App mobile véhicules', priority: 'medium', progress: 0.75, status: 'Ongoing', dept: 'hardware', eum: 'Btissam CHAHBOUN', spoc: 'Bouchra Ghazal' },
  { id: 'P20', name: 'ADAS Emotional Recognition', priority: 'medium', progress: 0.75, status: 'Ongoing', dept: 'hardware', eum: 'Btissam CHAHBOUN', spoc: 'Bouchra Ghazal' },
  { id: 'P21', name: 'E-vision', priority: 'medium', progress: 0.2, status: 'Ongoing', dept: 'hardware', eum: 'Btissam CHAHBOUN', spoc: 'Bouchra Ghazal' },
  { id: 'P22', name: 'IoT Smart Home', priority: 'medium', progress: 0.5, status: 'Ongoing', dept: 'electronics', eum: 'Saad ECH-CHARRAQ', spoc: 'Hasna EL MAARADI' },
  { id: 'P23', name: 'AI Vision Processor', priority: 'high', progress: 0.6, status: 'Ongoing', dept: 'ai', eum: 'Zakaria BOURZOUK', spoc: 'Mohamed GHOUAT' },
];

const RESERVED_DAYS = [8, 9, 15, 22, 23];

let state = {
  user: null,
  currentDept: 'hardware',
  resourceType: 'pc',
  hwExists: 'yes',
  teamType: 'solo',
  selectedDate: null,
  calYear: 2026, calMonth: 3,
  agreed: false,
  reservations: [
    { code: 'NX-2604-A1', project: 'Smart Cockpit V2', date: '2026-04-10', start: '09:00', end: '12:00', resource: 'PC + Matériel', priority: 'high', status: 'confirmed', member: 'Ahmed CHAKOURI', progress: 50, sprint: 3, tasks: 'Intégration IVI + cluster', next: 'Tests VSM communication', tools: 'VS Code, PyCharm', slogan: 'Intelligence embarquée du futur' },
    { code: 'NX-2603-B3', project: 'ADAS Emotional', date: '2026-03-20', start: '14:00', end: '17:00', resource: 'Matériel', priority: 'medium', status: 'done', member: 'Meriem TAZLAFT', progress: 75, sprint: 4, tasks: 'Détection fatigue temps réel', next: 'Déploiement Raspberry Pi', tools: 'Python, OpenCV, PyCharm', slogan: 'Conduire en sécurité, toujours' },
  ],
  currentStep: 1,
  formData: {}
};

// ===================== AUTH =====================
let createRole = 'user';

function getAccounts() {
  const accounts = localStorage.getItem('nexus_accounts');
  return accounts ? JSON.parse(accounts) : [];
}
function saveAccounts(accounts) { localStorage.setItem('nexus_accounts', JSON.stringify(accounts)); }
function getReservations() {
  const reservations = localStorage.getItem('nexus_reservations');
  return reservations ? JSON.parse(reservations) : [];
}
function saveReservations(reservations) { localStorage.setItem('nexus_reservations', JSON.stringify(reservations)); }
function getProjects() {
  const stored = localStorage.getItem('nexus_projects');
  return stored ? JSON.parse(stored) : null;
}
function saveProjects(projects) { localStorage.setItem('nexus_projects', JSON.stringify(projects)); }

// ===================== NOTIFICATIONS =====================
let notifications = [];

function getNotifications() {
  const stored = localStorage.getItem('nexus_notifications');
  return stored ? JSON.parse(stored) : [];
}
function saveNotifications(n) { localStorage.setItem('nexus_notifications', JSON.stringify(n)); }

function addNotification(title, sub, reservationCode) {
  notifications = getNotifications();
  const notif = { id: Date.now(), title, sub, code: reservationCode, read: false, time: new Date().toISOString() };
  notifications.unshift(notif);
  saveNotifications(notifications);
  updateNotifBadge();
  renderNotifList();
}

function updateNotifBadge() {
  notifications = getNotifications();
  const unread = notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notif-count-badge');
  const btn = document.getElementById('notif-btn');
  if (badge && btn) {
    if (unread > 0) { badge.style.display = 'inline-flex'; badge.textContent = unread; btn.style.borderColor = '#FF4B4B'; }
    else { badge.style.display = 'none'; btn.style.borderColor = 'var(--gray)'; }
  }
}

function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) renderNotifList();
}

function renderNotifList() {
  notifications = getNotifications();
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (notifications.length === 0) {
    list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--dark-gray);font-size:13px;">Aucune notification</div>';
    return;
  }
  list.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}" onclick="onNotifClick('${n.id}')">
      <div class="notif-item-title">${n.read ? '' : '<span class="notif-dot"></span>'}${n.title}</div>
      <div class="notif-item-sub">${n.sub}</div>
      <div class="notif-item-time">${new Date(n.time).toLocaleString('fr-FR', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
    </div>
  `).join('');
}

function onNotifClick(id) {
  notifications = getNotifications();
  const n = notifications.find(x => x.id == id);
  if (n) { n.read = true; saveNotifications(notifications); }
  updateNotifBadge();
  renderNotifList();
  document.getElementById('notif-panel').classList.remove('open');
  showScreen('validations');
}

function markAllRead() {
  notifications = getNotifications();
  notifications.forEach(n => n.read = true);
  saveNotifications(notifications);
  updateNotifBadge();
  renderNotifList();
}

document.addEventListener('click', function(e) {
  const panel = document.getElementById('notif-panel');
  const btn = document.getElementById('notif-btn');
  if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
    panel.classList.remove('open');
  }
});

function selectCreateRole(role) {
  createRole = role;
  document.getElementById('create-user-btn').classList.toggle('selected', role === 'user');
  document.getElementById('create-admin-btn').classList.toggle('selected', role === 'admin');
  document.getElementById('create-admin-key-group').style.display = role === 'admin' ? 'block' : 'none';
}

function doCreateAccount() {
  const email = document.getElementById('create-email').value.trim();
  const pwd = document.getElementById('create-password').value;
  const confirmPwd = document.getElementById('create-confirm-password').value;
  if (!email) { showToast('Veuillez entrer votre email', '⚠', 'warn'); return; }
  if (!pwd) { showToast('Veuillez entrer un mot de passe', '⚠', 'warn'); return; }
  if (pwd !== confirmPwd) { showToast('Les mots de passe ne correspondent pas', '❌'); return; }
  const accounts = getAccounts();
  const existingAccount = accounts.find(acc => acc.email === email);
  if (existingAccount) { showToast('Un compte existe déjà avec cet email', '❌'); return; }
  if (createRole === 'admin') {
    const adminKey = document.getElementById('create-admin-key').value;
    if (adminKey !== 'ADMIN123') { showToast('Clé admin invalide — Utilisez : ADMIN123', '❌'); return; }
  }
  const nameParts = email.split('@')[0].split('.');
  const name = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  const newAccount = { email, password: pwd, name, isAdmin: createRole === 'admin', initials: nameParts.map(p => p[0].toUpperCase()).join('').slice(0, 2), createdAt: new Date().toISOString() };
  accounts.push(newAccount);
  saveAccounts(accounts);
  showToast('Compte créé avec succès !', '✅');
  showLoginScreen();
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pwd = document.getElementById('login-password').value;
  if (!email) { showToast('Veuillez entrer votre email', '⚠', 'warn'); return; }
  if (!pwd) { showToast('Veuillez entrer votre mot de passe', '⚠', 'warn'); return; }
  const accounts = getAccounts();
  const account = accounts.find(acc => acc.email === email);
  if (!account) { showToast('Aucun compte trouvé avec cet email', '❌'); return; }
  if (account.password !== pwd) { showToast('Mot de passe incorrect', '❌'); return; }
  const disabledUsers = JSON.parse(localStorage.getItem('nexus_disabled_users') || '[]');
  if (disabledUsers.includes(account.email) && !account.isAdmin) { showToast('Ce compte a été désactivé par un administrateur', '⛔'); return; }
  state.user = { email: account.email, name: account.name, isAdmin: account.isAdmin, initials: account.initials };
  state.reservations = getReservations();
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'flex';
  document.getElementById('sidebar-avatar').textContent = state.user.initials;
  document.getElementById('sidebar-name').textContent = state.user.name;
  document.getElementById('sidebar-role').textContent = state.user.isAdmin ? 'Admin · EUM' : 'Stagiaire';
  if (state.user.isAdmin) {
    document.getElementById('nav-admin').style.display = 'flex';
    document.getElementById('nav-validations').style.display = 'flex';
    document.getElementById('notif-btn').style.display = 'inline-flex';
    document.getElementById('nav-reservation').style.display = 'none';
    document.getElementById('nav-mes-reservations').style.display = 'none';
    document.getElementById('nav-dashboard').style.display = 'flex';
    const storedProjects = getProjects();
    if (storedProjects) PROJECTS.length = 0, storedProjects.forEach(p => PROJECTS.push(p));
    updateNotifBadge();
    renderNotifList();
    initDashboard();
    showScreen('admin');
    setTimeout(() => { if (typeof Chart !== 'undefined') initPBICharts(); else { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'; s.onload = initPBICharts; document.head.appendChild(s); } }, 300);
  } else {
    document.getElementById('nav-admin').style.display = 'none';
    document.getElementById('nav-validations').style.display = 'none';
    document.getElementById('nav-reservation').style.display = 'flex';
    document.getElementById('nav-mes-reservations').style.display = 'flex';
    document.getElementById('nav-dashboard').style.display = 'none';
    addToCommunity(state.user);
    showScreen('guidelines');
  }
  updateNouvBadge();
  postLoginInit();
  applyTranslations();
  showToast('Bienvenue, ' + state.user.name + ' !', '👋');
}

function doLogout() {
  saveReservations(state.reservations);
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('create-account-screen').style.display = 'none';
  document.getElementById('welcome-screen').style.display = 'flex';
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  state.agreed = false;
  state.user = null;
  showToast('Déconnecté avec succès', '👋');
}

function enterApp() {
  const ws = document.getElementById('welcome-screen');
  ws.style.transition = 'opacity 0.5s ease';
  ws.style.opacity = '0';
  setTimeout(() => {
    ws.style.display = 'none';
    document.getElementById('create-account-screen').style.display = 'flex';
  }, 500);
}

function showLoginScreen() {
  document.getElementById('create-account-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('create-email').value = '';
  document.getElementById('create-password').value = '';
  document.getElementById('create-confirm-password').value = '';
  document.getElementById('create-admin-key').value = '';
}

function showCreateAccountScreen() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('create-account-screen').style.display = 'flex';
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
}

// ===================== NAVIGATION =====================
const SCREENS = { dashboard: 'Dashboard', reservation: 'Réservation', 'mes-reservations': 'Mes Réservations', guidelines: 'Guidelines', admin: 'Admin', validations: 'Validations', nouveautes: 'Nouveautés', community: 'Communauté', chat: 'Messagerie', livrables: 'Livrables', reclamations: 'Réclamations' };

function showScreen(id) {
  if (id === 'reservation' && !state.user.isAdmin && !state.agreed) {
    showToast('⚠ Vous devez d\'abord accepter les Guidelines', 'warn');
    showScreen('guidelines');
    return;
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screenEl = document.getElementById('screen-' + id);
  if (screenEl) screenEl.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const nav = document.getElementById('nav-' + id);
  if (nav) nav.classList.add('active');
  document.getElementById('topbar-title').textContent = SCREENS[id] || id;
  if (id === 'reservation') { state.currentStep = 1; renderStep(1); }
  if (id === 'mes-reservations') renderMyReservations();
  if (id === 'admin') renderAdmin();
  if (id === 'guidelines') renderGuidelines();
  if (id === 'validations') renderValidations();
  if (id === 'nouveautes') { renderNouvScreen(); if (state.user?.isAdmin) { document.getElementById('admin-nouv-compose-btn').style.display = 'block'; } }
  if (id === 'community') renderCommunity();
  if (id === 'chat') initChatScreen();
  if (id === 'livrables') renderLivrables();
  if (id === 'reclamations') renderReclamations();
  if (id === 'dashboard') {
    initDashboard();
    setTimeout(() => { if (typeof Chart !== 'undefined') initPBICharts(); else { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'; s.onload = initPBICharts; document.head.appendChild(s); } }, 100);
  }
}

// ===================== DASHBOARD =====================
function initDashboard() {
  const tbody = document.getElementById('dashboard-projects');
  tbody.innerHTML = PROJECTS.map(p => `
    <tr>
      <td><span style="font-family:'Rajdhani',sans-serif; font-size:11px; color:var(--muted);">${p.id}</span><br><span style="font-size:14px;">${p.name}</span></td>
      <td>${priorityBadge(p.priority)}</td>
      <td>
        <div style="width: 100px;">
          <div class="progress-track"><div class="progress-fill" style="width:${p.progress*100}%"></div></div>
          <div style="font-size:11px;color:var(--muted);margin-top:3px;">${Math.round(p.progress*100)}%</div>
        </div>
      </td>
      <td><span class="status-badge status-ongoing">⟳ ${p.status}</span></td>
    </tr>
  `).join('');
  const hw = DEPT_DATA['hardware'];
  document.getElementById('dept-team-widget').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${teamMiniCard(hw.eum, 'EUM')}
      ${teamMiniCard(hw.spoc, 'SPOC')}
    </div>
  `;
  document.getElementById('activity-timeline').innerHTML = `
    <div class="timeline-item"><div class="timeline-date">Aujourd'hui</div><div class="timeline-text">Réservation créée · Smart Cockpit V2</div></div>
    <div class="timeline-item"><div class="timeline-date">20 mars 2026</div><div class="timeline-text">Session terminée · ADAS Emotional</div></div>
    <div class="timeline-item"><div class="timeline-date">15 mars 2026</div><div class="timeline-text">Nouvelle réservation · E-vision</div></div>
  `;
}

function teamMiniCard(name, role) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return `<div style="display:flex;align-items:center;gap:10px;">
    <div class="user-avatar" style="background:rgba(0,102,204,0.1);color:var(--capgemini-blue);font-size:12px;">${initials}</div>
    <div><div style="font-size:13px;font-weight:500;">${name}</div><div style="font-size:11px;color:var(--capgemini-blue);font-family:'Rajdhani',sans-serif;">${role}</div></div>
  </div>`;
}

function priorityBadge(p) {
  if (p === 'high') return '<span class="priority-badge priority-high">🔥 Haute</span>';
  if (p === 'medium') return '<span class="priority-badge priority-medium">⏰ Moyenne</span>';
  return '<span class="priority-badge priority-low">🟢 Basse</span>';
}

// ===================== RESERVATION STEPS =====================
function goStep(n) {
  if (n === 5) {
    const tStart = document.getElementById('time-start')?.value || '09:00';
    const tEnd = document.getElementById('time-end')?.value || '13:00';
    const priority = document.getElementById('project-priority').value || 'medium';
    const dateStr = state.selectedDate
      ? String(state.calYear)+'-'+String(state.calMonth+1).padStart(2,'0')+'-'+String(state.selectedDate).padStart(2,'0')
      : null;
    const check = validateSlotBeforeConfirm(priority, dateStr, tStart, tEnd);
    if (!check.ok) {
      if (check.reason === 'no_date') { showToast('Veuillez sélectionner une date', '⚠'); return; }
      showConflictModal(check, 'blocked'); return;
    }
    if (check.displace) {
      showConflictModal(check, 'displace', () => {
        displaceReservation(check.displace);
        state.currentStep = 5; renderStep(5);
        finalizeReservation();
      }); return;
    }
    finalizeReservation();
  }
  state.currentStep = n;
  renderStep(n);
}

function renderStep(n) {
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById('res-step' + i);
    if (el) el.style.display = i === n ? 'block' : 'none';
    const stepEl = document.getElementById('step' + i);
    if (stepEl) {
      stepEl.classList.remove('active', 'done');
      if (i === n) stepEl.classList.add('active');
      else if (i < n) stepEl.classList.add('done');
    }
  }
  if (n === 1) renderDeptTeam('hardware');
  if (n === 4) renderCalendar();
}

function selectDept(key, name, dept) {
  state.currentDept = key;
  document.querySelectorAll('.dept-card').forEach(c => c.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  renderDeptTeam(key);
}

function renderDeptTeam(key) {
  const d = DEPT_DATA[key];
  if (!d) return;
  const eumInit = d.eum.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const spocInit = d.spoc.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('dept-team-cards').innerHTML = `
    <div class="team-card">
      <div class="team-avatar">${eumInit}</div>
      <div>
        <div class="team-name">${d.eum}</div>
        <div class="team-role">EUM — Engineering Unit Manager</div>
        <div class="team-dept">${d.dept}</div>
      </div>
    </div>
    <div class="team-card">
      <div class="team-avatar">${spocInit}</div>
      <div>
        <div class="team-name">${d.spoc}</div>
        <div class="team-role">SPOC — Single Point of Contact</div>
        <div class="team-dept">${d.dept}</div>
      </div>
    </div>
  `;
}

function toggleResource(type) {
  state.resourceType = type;
  ['pc','material','both'].forEach(t => {
    const el = document.getElementById('res-' + t);
    el.classList.toggle('selected', t === type);
    el.querySelector('.radio-dot').style.background = t === type ? 'var(--capgemini-blue)' : '';
    el.querySelector('.radio-dot').style.borderColor = t === type ? 'var(--capgemini-blue)' : 'var(--muted)';
  });
  document.getElementById('material-detail').style.display = (type === 'material' || type === 'both') ? 'block' : 'none';
}

function toggleMaterial(materialName) {
  if (!state.selectedMaterials) state.selectedMaterials = [];
  const index = state.selectedMaterials.indexOf(materialName);
  if (index > -1) state.selectedMaterials.splice(index, 1);
  else state.selectedMaterials.push(materialName);
  document.querySelectorAll('.material-item').forEach(item => {
    item.classList.toggle('selected', state.selectedMaterials.includes(item.textContent));
  });
  updateSelectedMaterialsDisplay();
}

function updateSelectedMaterialsDisplay() {
  const container = document.getElementById('selected-materials');
  const list = document.getElementById('selected-materials-list');
  if (state.selectedMaterials && state.selectedMaterials.length > 0) {
    container.style.display = 'block';
    list.innerHTML = state.selectedMaterials.map(m => `<span class="selected-materials-tag">${m}</span>`).join('');
  } else {
    container.style.display = 'none';
  }
}

function toggleTeam(type) {
  state.teamType = type;
  ['solo','binome','group'].forEach(t => {
    const el = document.getElementById('team-' + t);
    el.classList.toggle('selected', t === type);
    el.querySelector('.radio-dot').style.background = t === type ? 'var(--capgemini-blue)' : '';
    el.querySelector('.radio-dot').style.borderColor = t === type ? 'var(--capgemini-blue)' : 'var(--gray)';
  });
  document.getElementById('member2-row').style.display = (type === 'binome' || type === 'group') ? 'block' : 'none';
  document.getElementById('member3-row').style.display = (type === 'group') ? 'block' : 'none';
}

// ===================== PROJECT AUTO-FILL =====================
function autoFillProjectInfo() {
  const projectName = document.getElementById('project-name').value.toLowerCase().trim();
  if (!projectName) {
    document.getElementById('project-info-auto').style.display = 'none';
    document.getElementById('project-suggestions').style.display = 'none';
    document.getElementById('project-priority-display').textContent = '—';
    return;
  }
  const matches = PROJECTS.filter(p => p.name.toLowerCase().includes(projectName));
  if (matches.length > 0) {
    const suggestionsHtml = matches.map(p => `
      <div style="padding:10px 12px; border-bottom:1px solid var(--gray); cursor:pointer;" onclick="selectProjectFromSuggestion('${p.name}', '${p.priority}', '${p.eum}', '${p.spoc}')">
        <div style="font-size:13px; color:var(--black); font-weight:500;">${p.name}</div>
        <div style="font-size:11px; color:var(--dark-gray);">${p.id} · ${DEPT_DATA[p.dept]?.name || ''}</div>
      </div>
    `).join('');
    document.getElementById('project-suggestions').innerHTML = suggestionsHtml;
    document.getElementById('project-suggestions').style.display = 'block';
  } else {
    document.getElementById('project-suggestions').style.display = 'none';
  }
  const exactMatch = PROJECTS.find(p => p.name.toLowerCase() === projectName);
  if (exactMatch) {
    const priorityText = exactMatch.priority === 'high' ? '🔥 Haute' : exactMatch.priority === 'medium' ? '⏰ Moyenne' : '🟢 Basse';
    document.getElementById('project-priority').value = exactMatch.priority;
    document.getElementById('project-priority-display').textContent = priorityText;
    document.getElementById('auto-priority').textContent = priorityText;
    document.getElementById('auto-eum').textContent = exactMatch.eum;
    document.getElementById('auto-spoc').textContent = exactMatch.spoc;
    document.getElementById('project-info-auto').style.display = 'block';
  } else {
    document.getElementById('project-info-auto').style.display = 'none';
    document.getElementById('project-priority-display').textContent = '—';
  }
}

function selectProjectFromSuggestion(name, priority, eum, spoc) {
  document.getElementById('project-name').value = name;
  const priorityText = priority === 'high' ? '🔥 Haute' : priority === 'medium' ? '⏰ Moyenne' : '🟢 Basse';
  document.getElementById('project-priority').value = priority;
  document.getElementById('project-priority-display').textContent = priorityText;
  document.getElementById('auto-priority').textContent = priorityText;
  document.getElementById('auto-eum').textContent = eum;
  document.getElementById('auto-spoc').textContent = spoc;
  document.getElementById('project-info-auto').style.display = 'block';
  document.getElementById('project-suggestions').style.display = 'none';
}

// ===================== CALENDAR =====================
const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function renderCalendar() {
  const { calYear, calMonth } = state;
  document.getElementById('cal-month-label').textContent = MONTH_NAMES[calMonth] + ' ' + calYear;
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  const tStart = document.getElementById('time-start')?.value || '09:00';
  const tEnd = document.getElementById('time-end')?.value || '13:00';
  const priority = document.getElementById('project-priority')?.value || 'medium';
  let html = '';
  for (let i = 0; i < offset; i++) html += '<div class="cal-day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(calYear, calMonth, d);
    const isToday = date.toDateString() === today.toDateString();
    const isReserved = RESERVED_DAYS.includes(d);
    const isPast = date < today && !isToday;
    const isSelected = state.selectedDate === d;
    const dateStr = String(calYear)+'-'+String(calMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const conflicts = !isPast && !isReserved ? checkSlotConflict(dateStr, tStart, tEnd, null) : [];
    const conflictType = conflicts.length > 0 ? resolveConflict(priority, conflicts[0].priority) : null;
    let cls = 'cal-day', onclick = '';
    if (isPast) cls += ' disabled';
    else if (isReserved) cls += ' reserved';
    else if (isSelected) { cls += ' selected'; onclick = `onclick="selectDay(${d})"`; }
    else if (conflictType === 'BLOCKED') { cls += ' conflict-blocked'; }
    else if (conflictType === 'DISPLACE') { cls += ' conflict-displace'; onclick = `onclick="selectDay(${d})"`; }
    else { cls += ' available'; if (isToday) cls += ' today'; onclick = `onclick="selectDay(${d})"`; }
    html += `<div class="${cls}" ${onclick}>${d}</div>`;
  }
  document.getElementById('cal-days').innerHTML = html;
  const legendEl = document.getElementById('cal-conflict-legend');
  if (legendEl) {
    const hasConflicts = state.reservations.some(r => {
      const d = new Date(r.date);
      return d.getFullYear()===calYear && d.getMonth()===calMonth && r.status!=='rejected';
    });
    legendEl.style.display = hasConflicts ? 'flex' : 'none';
  }
  updateDateLabel();
}

function selectDay(d) { state.selectedDate = d; renderCalendar(); }

function updateDateLabel() {
  if (state.selectedDate) {
    const d = new Date(state.calYear, state.calMonth, state.selectedDate);
    document.getElementById('selected-date-label').innerHTML = `<span style="color:var(--capgemini-blue);font-weight:500;">✓ Sélectionné : ${d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</span>`;
  } else {
    document.getElementById('selected-date-label').textContent = 'Aucune date sélectionnée';
  }
}

function prevMonth() {
  if (state.calMonth === 0) { state.calMonth = 11; state.calYear--; }
  else state.calMonth--;
  state.selectedDate = null;
  renderCalendar();
}

function nextMonth() {
  if (state.calMonth === 11) { state.calMonth = 0; state.calYear++; }
  else state.calMonth++;
  state.selectedDate = null;
  renderCalendar();
}

// ===================== SHAREPOINT =====================
async function sendToSharePoint(reservation) {
  const TENANT = "capgemini.sharepoint.com";
  const SITE = "/sites/NEXUSProject";
  const LIST = "Reservations_Nexus";
  const url = `https://${TENANT}${SITE}/_api/web/lists/getbytitle('${LIST}')/items`;
  const digestResp = await fetch(`https://${TENANT}${SITE}/_api/contextinfo`, {
    method: "POST",
    headers: { "Accept": "application/json;odata=verbose" },
    credentials: "include"
  });
  if (!digestResp.ok) throw new Error(`contextinfo HTTP ${digestResp.status}`);
  const digestJson = await digestResp.json();
  const digest = digestJson.d.GetContextWebInformation.FormDigestValue;
  const payload = {
    "__metadata": { "type": "SP.Data.Reservations_NexusListItem" },
    "Title": reservation.code, "Stagiaire_Nom": reservation.member,
    "Stagiaire_Email": reservation.userEmail, "Projet": reservation.project,
    "Date_Reservation": reservation.date, "Creneau": `${reservation.start} - ${reservation.end}`,
    "Ressource": reservation.resource, "Priorite": reservation.priority,
    "Departement": reservation.department, "Materiaux": reservation.materials?.join(", ") || "",
    "Statut": "En attente"
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Accept": "application/json;odata=verbose", "Content-Type": "application/json;odata=verbose", "X-RequestDigest": digest },
    credentials: "include",
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    let msg = `HTTP ${resp.status}`;
    try { const e = await resp.json(); msg = e.error?.message?.value || msg; } catch(_) {}
    throw new Error(msg);
  }
  return await resp.json();
}

// ===================== FINALIZE RESERVATION =====================
function finalizeReservation() {
  const pName = document.getElementById('project-name').value || 'Mon Projet';
  const pSlogan = document.getElementById('project-slogan').value || 'Nexus Lab · Capgemini Engineering';
  const member1 = document.getElementById('member1').value || state.user?.name || 'Stagiaire';
  const progress = parseInt(document.getElementById('progress-pct').value) || 25;
  const sprint = document.getElementById('sprint-current').value || '3';
  const priority = document.getElementById('project-priority').value || 'medium';
  const tasksNext = document.getElementById('tasks-next').value || 'Étapes à définir';
  const tools = document.getElementById('tools').value || '';
  const tStart = document.getElementById('time-start')?.value || '09:00';
  const tEnd = document.getElementById('time-end')?.value || '13:00';
  const eum = document.getElementById('auto-eum').textContent || '';
  const spoc = document.getElementById('auto-spoc').textContent || '';
  const code = 'NX-' + String(state.calYear).slice(2) + String(state.calMonth+1).padStart(2,'0') + '-' + Math.random().toString(36).slice(2,4).toUpperCase();
  const dateStr = state.selectedDate ? `${state.calYear}-${String(state.calMonth+1).padStart(2,'0')}-${String(state.selectedDate).padStart(2,'0')}` : '2026-04-14';
  const reservation = {
    code, project: pName, date: dateStr, start: tStart, end: tEnd,
    resource: state.resourceType === 'pc' ? 'PC' : state.resourceType === 'material' ? 'Matériel' : 'PC + Matériel',
    priority, status: 'confirmed', member: member1, progress, sprint,
    tasks: document.getElementById('tasks-current').value || '', next: tasksNext, tools, slogan: pSlogan,
    eum, spoc, userEmail: state.user.email, materials: state.selectedMaterials || [],
    otherMaterials: document.getElementById('material-other')?.value || ''
  };
  state.reservations.unshift(reservation);
  saveReservations(state.reservations);
  reservation.department = DEPT_DATA[state.currentDept]?.name || "";
  sendToSharePoint(reservation)
    .then(() => { console.log("✅ Envoyé à SharePoint"); showToast("Réservation envoyée au responsable ✅", "📧"); })
    .catch(err => { console.error("❌ Erreur SharePoint:", err); });
  addNotification('📋 Nouvelle réservation à valider', `${member1} — ${pName} · ${tStart}–${tEnd}`, code);
  const dept = DEPT_DATA[state.currentDept];
  const dFmt = state.selectedDate ? new Date(state.calYear, state.calMonth, state.selectedDate).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }) : 'Date non sélectionnée';
  document.getElementById('confirm-box').innerHTML = `
    <span class="confirm-icon">✅</span>
    <div class="confirm-title">Réservation Confirmée !</div>
    <div class="confirm-code">${code}</div>
    <p style="color:var(--dark-gray);font-size:14px;max-width:500px;margin:0 auto;">Votre session a été enregistrée. L'administrateur doit valider votre réservation.</p>
    <div class="confirm-details">
      <div class="confirm-detail"><div class="confirm-detail-lbl">Projet</div><div class="confirm-detail-val">${pName}</div></div>
      <div class="confirm-detail"><div class="confirm-detail-lbl">Date</div><div class="confirm-detail-val">${dFmt}</div></div>
      <div class="confirm-detail"><div class="confirm-detail-lbl">Créneau</div><div class="confirm-detail-val">${tStart} – ${tEnd}</div></div>
      <div class="confirm-detail"><div class="confirm-detail-lbl">Département</div><div class="confirm-detail-val">${dept.name}</div></div>
      <div class="confirm-detail"><div class="confirm-detail-lbl">Ressource</div><div class="confirm-detail-val">${reservation.resource}</div></div>
      <div class="confirm-detail"><div class="confirm-detail-lbl">Priorité</div><div class="confirm-detail-val">${priority === 'high' ? '🔥 Haute' : priority === 'medium' ? '⏰ Moyenne' : '🟢 Basse'}</div></div>
    </div>
    <div style="margin-top:28px;display:flex;gap:12px;justify-content:center;">
      <button class="btn-secondary" onclick="showScreen('mes-reservations')">Voir mes réservations</button>
      <button class="btn-yellow" onclick="showScreen('dashboard')">Retour au dashboard</button>
    </div>
  `;
  showToast('Réservation ' + code + ' en attente de validation', '⏳');
}

// ===================== MY RESERVATIONS =====================
function renderMyReservations() {
  const userReservations = state.user?.isAdmin ? state.reservations : state.reservations.filter(r => r.userEmail === state.user?.email);
  const tbody = document.getElementById('my-reservations-tbody');
  tbody.innerHTML = userReservations.map(r => {
    let statusBadgeClass = 'status-pending', statusText = '⏳ En attente';
    if (r.status === 'approved') { statusBadgeClass = 'status-done'; statusText = '✓ Validée'; }
    else if (r.status === 'rejected') { statusBadgeClass = 'status-pending'; statusText = '❌ Rejetée'; }
    else if (r.status === 'displaced') { statusBadgeClass = 'status-pending'; statusText = '⚡ Déplacée'; }
    return `<tr>
      <td><span style="font-family:'Rajdhani',sans-serif;color:var(--capgemini-blue);font-size:13px;">${r.code}</span></td>
      <td>${r.project}</td>
      <td>${new Date(r.date).toLocaleDateString('fr-FR')}</td>
      <td>${r.start} – ${r.end}</td>
      <td>${r.resource}</td>
      <td>${priorityBadge(r.priority)}</td>
      <td><span class="status-badge ${statusBadgeClass}">${statusText}</span></td>
    </tr>`;
  }).join('');
  const userRes = state.user?.isAdmin ? null : state.reservations.find(r => r.userEmail === state.user?.email);
  const container = document.getElementById('nexus-slide-container');
  if (userRes && userRes.status === 'approved') {
    container.style.display = 'block';
    container.innerHTML = `
      <div class="card" style="margin-top:24px;">
        <div class="card-header"><div class="card-title">Nexus Screen — Aperçu Projet</div><div class="card-sub">Affichage après validation</div></div>
        <div class="nexus-slide">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
            <div style="flex:1;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--dark-gray);margin-bottom:6px;">NEXUS LAB · Intelligent Hardware</div>
              <div class="slide-project-name">${userRes.project}</div>
              <div class="slide-tagline">${userRes.slogan}</div>
            </div>
            <div style="text-align:right;">${priorityBadge(userRes.priority)}<div style="font-size:12px;color:var(--dark-gray);margin-top:6px;">${userRes.code}</div></div>
          </div>
          <div class="slide-grid">
            <div>
              <div class="slide-section-title">Avancement général</div>
              <div class="progress-bar-wrapper">
                <div class="progress-bar-label"><span>Progression globale</span><span>${userRes.progress}%</span></div>
                <div class="progress-track"><div class="progress-fill" style="width:${userRes.progress}%"></div></div>
              </div>
              <div style="margin-top:14px;"><div class="slide-section-title">Prochaines étapes</div><div style="font-size:13px;color:var(--black);line-height:1.6;">${userRes.next||'—'}</div></div>
            </div>
            <div>
              <div class="slide-section-title">Outils & Technologies</div>
              <div class="slide-tags">${(userRes.tools||'').split(',').filter(Boolean).map(t=>`<div class="slide-tag">${t.trim()}</div>`).join('')}</div>
              <div style="margin-top:16px;"><div class="slide-section-title">Équipe</div><div style="font-size:14px;font-weight:500;">${userRes.member}</div></div>
            </div>
          </div>
        </div>
      </div>`;
  } else {
    container.style.display = 'none';
  }
}

// ===================== ADMIN =====================
let adminCalYear = 2026, adminCalMonth = 3;

function renderAdmin() {
  const pending = state.reservations.filter(r => r.status === 'confirmed').length;
  const matPending = state.reservations.filter(r => r.status === 'confirmed' && (r.materials?.length > 0 || r.otherMaterials)).length;
  document.getElementById('admin-stat1').textContent = state.reservations.length;
  document.getElementById('admin-stat2').textContent = pending;
  document.getElementById('admin-stat3').textContent = new Set(state.reservations.map(r => r.member)).size;
  document.getElementById('admin-stat4').textContent = matPending;
  renderAdminCalendar();
  renderMaterialsRequests();
  renderAdminProjects();
  const tbody = document.getElementById('admin-tbody');
  tbody.innerHTML = state.reservations.map(r => `
    <tr>
      <td><span style="font-family:'Rajdhani',sans-serif;color:var(--capgemini-blue);">${r.code}</span></td>
      <td>${r.member}</td><td>${r.project}</td>
      <td><span style="font-size:12px;color:var(--dark-gray);">Intelligent Hardware</span></td>
      <td>${new Date(r.date).toLocaleDateString('fr-FR')}</td>
      <td>${r.start}–${r.end}</td>
      <td style="max-width:140px;">${r.materials?.length > 0 ? `<div style="font-size:11px;color:var(--capgemini-blue);">${r.materials.slice(0,2).join(', ')}${r.materials.length>2?' +'+(r.materials.length-2):''}</div>` : '<span style="font-size:11px;color:var(--muted);">—</span>'}</td>
      <td>${priorityBadge(r.priority)}</td>
      <td><span class="status-badge ${r.status==='rejected'?'status-pending':r.status==='confirmed'?'status-ongoing':'status-done'}">${r.status==='confirmed'?'⏳ À valider':r.status==='approved'?'✓ Approuvée':'❌ Rejetée'}</span></td>
      <td>${r.status==='confirmed' ? `<button class="btn-secondary" style="padding:5px 10px;font-size:11px;margin-right:4px;" onclick="updateReservationStatus('${r.code}','approved')">Valider</button><button class="btn-secondary" style="padding:5px 10px;font-size:11px;color:#FF5555;" onclick="updateReservationStatus('${r.code}','rejected')">Rejeter</button>` : `<span style="font-size:11px;color:var(--dark-gray);">Traitée</span>`}</td>
    </tr>
  `).join('');
}

function renderAdminCalendar() {
  const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  document.getElementById('admin-cal-label').textContent = MONTHS[adminCalMonth] + ' ' + adminCalYear;
  const firstDay = new Date(adminCalYear, adminCalMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(adminCalYear, adminCalMonth + 1, 0).getDate();
  const today = new Date();
  const resMap = {};
  state.reservations.forEach(r => {
    const d = new Date(r.date);
    if (d.getFullYear() === adminCalYear && d.getMonth() === adminCalMonth) {
      const day = d.getDate();
      if (!resMap[day]) resMap[day] = [];
      resMap[day].push(r);
    }
  });
  const total = Object.values(resMap).reduce((sum, arr) => sum + arr.length, 0);
  document.getElementById('admin-cal-total').textContent = total + ' rés.';
  let html = '';
  for (let i = 0; i < offset; i++) html += '<div class="admin-cal-day"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = new Date(adminCalYear, adminCalMonth, d).toDateString() === today.toDateString();
    const isPast = new Date(adminCalYear, adminCalMonth, d) < today;
    const hasRes = resMap[d]?.length > 0;
    let cls = 'admin-cal-day';
    if (hasRes) cls += ' has-reservation';
    else if (isToday) cls += ' today-mark';
    else if (isPast) cls += ' past';
    const onclick = hasRes ? `onclick="showAdminCalDay(${d})"` : '';
    html += `<div class="${cls}" ${onclick}>${d}${hasRes ? `<div class="res-count-dot">${resMap[d].length}</div>` : ''}</div>`;
  }
  document.getElementById('admin-cal-days').innerHTML = html;
}

function showAdminCalDay(d) {
  const resMap = {};
  state.reservations.forEach(r => {
    const dt = new Date(r.date);
    if (dt.getFullYear() === adminCalYear && dt.getMonth() === adminCalMonth) {
      const day = dt.getDate();
      if (!resMap[day]) resMap[day] = [];
      resMap[day].push(r);
    }
  });
  const dayRes = resMap[d] || [];
  const dateStr = new Date(adminCalYear, adminCalMonth, d).toLocaleDateString('fr-FR', {weekday:'long',day:'numeric',month:'long'});
  document.getElementById('admin-cal-day-detail').innerHTML = `
    <div style="font-size:12px;font-weight:600;color:var(--capgemini-blue);margin-bottom:8px;">📅 ${dateStr}</div>
    ${dayRes.map(r=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--gray);">
      <span style="font-family:'Rajdhani',sans-serif;font-size:12px;color:var(--capgemini-blue);">${r.code}</span>
      <span style="font-size:12px;flex:1;">${r.member} — ${r.project}</span>
      <span style="font-size:11px;color:var(--dark-gray);">${r.start}–${r.end}</span>
      <span class="status-badge ${r.status==='confirmed'?'status-ongoing':r.status==='approved'?'status-done':'status-pending'}" style="font-size:10px;">${r.status==='confirmed'?'⏳':r.status==='approved'?'✓':'❌'}</span>
    </div>`).join('')}
  `;
}

function adminCalPrev() {
  if (adminCalMonth === 0) { adminCalMonth = 11; adminCalYear--; } else adminCalMonth--;
  renderAdminCalendar();
  document.getElementById('admin-cal-day-detail').innerHTML = '<div style="font-size:12px;color:var(--muted);">Cliquez sur une date pour voir les réservations</div>';
}
function adminCalNext() {
  if (adminCalMonth === 11) { adminCalMonth = 0; adminCalYear++; } else adminCalMonth++;
  renderAdminCalendar();
  document.getElementById('admin-cal-day-detail').innerHTML = '<div style="font-size:12px;color:var(--muted);">Cliquez sur une date pour voir les réservations</div>';
}

function renderMaterialsRequests() {
  const container = document.getElementById('materials-requests-list');
  const pending = state.reservations.filter(r => r.status === 'confirmed' && (r.materials?.length > 0 || r.otherMaterials));
  if (pending.length === 0) { container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--dark-gray);font-size:13px;">Aucune demande de matériels en attente</div>'; return; }
  container.innerHTML = pending.map(r => {
    const allMat = [...(r.materials || []), ...(r.otherMaterials ? [r.otherMaterials] : [])];
    const statusClass = r.materialStatus === 'available' ? 'available' : r.materialStatus === 'unavailable' ? 'unavailable' : 'pending';
    const statusTag = r.materialStatus === 'available' ? '<span class="mat-tag-avail">✓ Disponible</span>' : r.materialStatus === 'unavailable' ? '<span class="mat-tag-unavail">✕ Indisponible</span>' : '<span class="mat-tag-pending">⏳ En attente</span>';
    return `<div class="material-req-card ${statusClass}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;color:var(--capgemini-blue);font-weight:700;">${r.code}</span><span style="font-size:12px;color:var(--dark-gray);margin-left:8px;">${r.member}</span></div>
        ${statusTag}
      </div>
      <div style="font-size:12px;color:var(--black);margin-bottom:10px;font-weight:500;">📦 ${allMat.join(' · ')}</div>
      ${!r.materialStatus ? `<div style="display:flex;gap:8px;"><button class="btn-secondary" style="padding:5px 12px;font-size:11px;color:var(--success);border-color:var(--success);" onclick="respondMaterial('${r.code}','available')">✓ Disponible</button><button class="btn-secondary" style="padding:5px 12px;font-size:11px;color:#FF5555;border-color:#FF5555;" onclick="respondMaterial('${r.code}','unavailable')">✕ Indisponible</button></div>` : `<button class="btn-secondary" style="padding:4px 10px;font-size:10px;" onclick="respondMaterial('${r.code}',null)">Modifier</button>`}
    </div>`;
  }).join('');
}

function respondMaterial(code, status) {
  const r = state.reservations.find(x => x.code === code);
  if (!r) return;
  r.materialStatus = status;
  saveReservations(state.reservations);
  if (status === 'available') showToast(`Matériel confirmé pour ${code}`, '✅');
  else if (status === 'unavailable') showToast(`Matériel indisponible pour ${code}`, '⚠');
  else showToast('Réponse réinitialisée', 'ℹ');
  renderAdmin();
}

function renderAdminProjects() {
  const list = document.getElementById('admin-projects-list');
  list.innerHTML = PROJECTS.map(p => `
    <div class="project-manage-row">
      <div style="flex:0 0 40px;font-family:'Rajdhani',sans-serif;font-size:12px;color:var(--muted);">${p.id}</div>
      <div style="flex:1;"><div style="font-size:14px;font-weight:500;${p.status==='Closed'?'text-decoration:line-through;color:var(--muted);':''}">${p.name}</div><div style="font-size:11px;color:var(--dark-gray);margin-top:2px;">${DEPT_DATA[p.dept]?.name||p.dept}</div></div>
      <div style="width:90px;"><div class="progress-track"><div class="progress-fill" style="width:${p.progress*100}%"></div></div><div style="font-size:10px;color:var(--muted);margin-top:2px;">${Math.round(p.progress*100)}%</div></div>
      ${priorityBadge(p.priority)}
      <span class="proj-status-badge ${p.status==='Ongoing'?'proj-active':p.status==='Closed'?'proj-closed':'proj-pending'}">${p.status==='Ongoing'?'⟳ En cours':p.status==='Closed'?'✓ Clôturé':'📋 Planif.'}</span>
      <div style="display:flex;gap:6px;">
        <button class="btn-icon" onclick="openProjectModal('${p.id}')">✏ Modifier</button>
        ${p.status!=='Closed'?`<button class="btn-icon btn-danger-sm" onclick="closeProject('${p.id}')">🔒 Clôturer</button>`:''}
      </div>
    </div>
  `).join('');
}

function openProjectModal(projectId) {
  const modal = document.getElementById('project-modal');
  document.getElementById('project-modal-id').value = projectId || '';
  if (projectId) {
    const p = PROJECTS.find(x => x.id === projectId);
    if (!p) return;
    document.getElementById('project-modal-title').textContent = 'Modifier le projet';
    document.getElementById('pm-name').value = p.name;
    document.getElementById('pm-dept').value = p.dept;
    document.getElementById('pm-priority').value = p.priority;
    document.getElementById('pm-progress').value = Math.round(p.progress * 100);
    document.getElementById('pm-status').value = p.status;
  } else {
    document.getElementById('project-modal-title').textContent = 'Nouveau Projet';
    document.getElementById('pm-name').value = '';
    document.getElementById('pm-dept').value = 'hardware';
    document.getElementById('pm-priority').value = 'medium';
    document.getElementById('pm-progress').value = '0';
    document.getElementById('pm-status').value = 'Ongoing';
  }
  modal.classList.add('open');
}

function closeProjectModal() { document.getElementById('project-modal').classList.remove('open'); }

function saveProject() {
  const projectId = document.getElementById('project-modal-id').value;
  const name = document.getElementById('pm-name').value.trim();
  if (!name) { showToast('Nom du projet requis', '⚠'); return; }
  const dept = document.getElementById('pm-dept').value;
  const priority = document.getElementById('pm-priority').value;
  const progress = parseFloat(document.getElementById('pm-progress').value) / 100 || 0;
  const status = document.getElementById('pm-status').value;
  const d = DEPT_DATA[dept];
  if (projectId) {
    const p = PROJECTS.find(x => x.id === projectId);
    if (p) Object.assign(p, { name, dept, priority, progress, status, eum: d?.eum||'', spoc: d?.spoc||'' });
    showToast(`Projet ${name} modifié`, '✅');
  } else {
    const newId = 'P' + (Math.max(...PROJECTS.map(x => parseInt(x.id.slice(1)) || 0), 0) + 1);
    PROJECTS.push({ id: newId, name, dept, priority, progress, status, eum: d?.eum||'', spoc: d?.spoc||'' });
    showToast(`Projet ${name} créé`, '✅');
  }
  saveProjects(PROJECTS);
  closeProjectModal();
  renderAdminProjects();
  initDashboard();
}

function closeProject(projectId) {
  const p = PROJECTS.find(x => x.id === projectId);
  if (p) { p.status = 'Closed'; saveProjects(PROJECTS); showToast(`Projet ${p.name} clôturé`, '🔒'); renderAdminProjects(); initDashboard(); }
}

function closeMaterialModal() { document.getElementById('material-modal').classList.remove('open'); }

function updateReservationStatus(code, newStatus) { validateReservation(code, newStatus); }

function validateReservation(code, newStatus) {
  const res = state.reservations.find(r => r.code === code);
  if (res) {
    res.status = newStatus;
    saveReservations(state.reservations);
    if (newStatus === 'approved') logAction('approve', '✅ Réservation approuvée', res.member + ' — ' + res.project, code);
    else logAction('reject', '❌ Réservation rejetée', res.member + ' — ' + res.project, code);
    renderAdmin();
    renderValidations();
    showToast('Réservation ' + code + (newStatus === 'approved' ? ' approuvée' : ' rejetée'), newStatus === 'approved' ? '✅' : '❌');
  }
}

function renderValidations() {
  const pending = state.reservations.filter(r => r.status === 'confirmed');
  if (pending.length === 0) {
    document.getElementById('pending-reservations-message').style.display = 'block';
    document.getElementById('validations-table-wrap').style.display = 'none';
  } else {
    document.getElementById('pending-reservations-message').style.display = 'none';
    document.getElementById('validations-table-wrap').style.display = 'block';
    const tbody = document.getElementById('validations-tbody');
    tbody.innerHTML = pending.map(r => {
      const materialsList = r.materials?.length > 0 ? r.materials.join(', ') : 'Aucun';
      return `<tr>
        <td><span style="font-family:'Rajdhani',sans-serif;color:var(--capgemini-blue);font-weight:600;">${r.code}</span></td>
        <td>${r.member}</td><td><strong>${r.project}</strong></td>
        <td>${new Date(r.date).toLocaleDateString('fr-FR')}</td>
        <td>${r.start}–${r.end}</td>
        <td>${priorityBadge(r.priority)}</td>
        <td><div style="font-size:12px;"><div style="font-weight:500;margin-bottom:4px;">${r.resource}</div><div style="color:var(--dark-gray);">${materialsList}</div></div></td>
        <td>
          <button class="btn-secondary" style="padding:6px 12px;font-size:11px;margin-right:4px;color:var(--success);border-color:var(--success);" onclick="validateReservation('${r.code}','approved')">✓ Approuver</button>
          <button class="btn-secondary" style="padding:6px 12px;font-size:11px;color:#FF5555;border-color:#FF5555;" onclick="validateReservation('${r.code}','rejected')">✕ Rejeter</button>
        </td>
      </tr>`;
    }).join('');
  }
}

function renderGuidelines() {}

function toggleAgree() {
  state.agreed = !state.agreed;
  const cb = document.getElementById('agree-checkbox');
  cb.classList.toggle('checked', state.agreed);
  cb.textContent = state.agreed ? '✓' : '';
  const banner = document.getElementById('agreed-banner');
  if (state.agreed) {
    banner.style.display = 'block';
    banner.innerHTML = '✓ Guidelines acceptées — <button class="btn-yellow" style="padding:6px 16px;font-size:12px;margin-left:12px;" onclick="showScreen(\'reservation\')">→ Aller à Réservation</button>';
    showToast('Guidelines acceptées !', '✅');
  } else {
    banner.style.display = 'none';
  }
}

// ===================== TOAST =====================
function showToast(msg, icon = '✓', type = 'success') {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  document.getElementById('toast-icon').textContent = icon;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ===================== NOUVEAUTES =====================
let nouveauteType = 'annonce';
let nouveauteType2 = 'annonce';
let pbiChartInstances = {};

function getNouveautes() { const s = localStorage.getItem('nexus_nouveautes'); return s ? JSON.parse(s) : []; }
function saveNouveautes(n) { localStorage.setItem('nexus_nouveautes', JSON.stringify(n)); }
function getNouvReadIds() { const s = localStorage.getItem('nexus_nouv_read_' + (state.user?.email || '')); return s ? JSON.parse(s) : []; }
function saveNouvReadIds(ids) { localStorage.setItem('nexus_nouv_read_' + (state.user?.email || ''), JSON.stringify(ids)); }

function updateNouvBadge() {
  const nouvs = getNouveautes();
  const readIds = getNouvReadIds();
  const unread = nouvs.filter(n => !readIds.includes(n.id)).length;
  const badge = document.getElementById('nouv-count-badge');
  const navBadge = document.getElementById('nouv-nav-badge');
  const btn = document.getElementById('nouv-btn');
  if (badge) { if (unread > 0) { badge.style.display = 'inline-flex'; badge.textContent = unread; if (btn) btn.style.borderColor = '#FF4B4B'; } else { badge.style.display = 'none'; if (btn) btn.style.borderColor = 'var(--gray)'; } }
  if (navBadge) { if (unread > 0) { navBadge.style.display = 'inline-flex'; navBadge.textContent = unread; } else { navBadge.style.display = 'none'; } }
}

function toggleNouvPanel() {
  const panel = document.getElementById('nouv-panel');
  document.getElementById('notif-panel').classList.remove('open');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    renderNouvPanel();
    const compose = document.getElementById('nouv-compose-area');
    if (compose) compose.style.display = state.user?.isAdmin ? 'block' : 'none';
  }
}

function renderNouvPanel() {
  const nouvs = getNouveautes();
  const readIds = getNouvReadIds();
  const list = document.getElementById('nouv-list');
  if (!list) return;
  if (nouvs.length === 0) { list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--dark-gray);font-size:13px;">Aucune nouveauté</div>'; return; }
  list.innerHTML = nouvs.map(n => {
    const isRead = readIds.includes(n.id);
    return `<div class="nouv-item ${isRead ? '' : 'unread'}" onclick="markNouvRead(${n.id})">
      <div style="margin-bottom:4px;">${isRead ? '' : '<span class="nouv-dot"></span>'}<span class="nouv-item-tag nouv-tag-${n.type}">${nouvTypeLabel(n.type)}</span></div>
      <div class="nouv-item-title">${n.title}</div>
      <div class="nouv-item-body">${n.body}</div>
      <div class="nouv-item-time">${new Date(n.time).toLocaleString('fr-FR', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · Par ${n.author}</div>
    </div>`;
  }).join('');
}

function nouvTypeLabel(t) {
  if (t === 'formation') return '📚 Formation';
  if (t === 'evenement') return '🗓 Événement';
  if (t === 'urgent') return '🚨 Urgent';
  return '📣 Annonce';
}

function markNouvRead(id) {
  const readIds = getNouvReadIds();
  if (!readIds.includes(id)) { readIds.push(id); saveNouvReadIds(readIds); }
  updateNouvBadge(); renderNouvPanel();
}

function markAllNouvRead() {
  const nouvs = getNouveautes();
  saveNouvReadIds(nouvs.map(n => n.id));
  updateNouvBadge(); renderNouvPanel();
}

function selectNouvType(t) {
  nouveauteType = t;
  ['annonce','formation','evenement','urgent'].forEach(x => { const el = document.getElementById('nt-' + x); if (el) el.classList.toggle('selected', x === t); });
}

function selectNouvType2(t) {
  nouveauteType2 = t;
  ['annonce','formation','evenement','urgent'].forEach(x => { const el = document.getElementById('nt2-' + x); if (el) el.classList.toggle('selected', x === t); });
}

async function generateProfessionalText(rawText, type) {
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 500,
        system: 'Tu es un assistant RH pour Capgemini Engineering. Réponds UNIQUEMENT avec un JSON: {"title": "...", "body": "..."}',
        messages: [{ role: 'user', content: `Type: ${type}\nBrouillon: ${rawText}` }]
      })
    });
    const data = await resp.json();
    const text = data.content[0].text.replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch(e) { return null; }
}

async function publishNouveauteInline() {
  const raw = document.getElementById('nouv-draft-text2').value.trim();
  if (!raw) { showToast('Veuillez écrire un brouillon', '⚠'); return; }
  const gen = document.getElementById('nouv-generating');
  gen.style.display = 'inline';
  const result = await generateProfessionalText(raw, nouveauteType2);
  gen.style.display = 'none';
  if (!result) { publishNouveauteRawInline(); return; }
  saveAndPublishNouveaute(result.title, result.body, nouveauteType2);
  document.getElementById('nouv-draft-text2').value = '';
  document.getElementById('admin-compose-inline').style.display = 'none';
}

function publishNouveauteRawInline() {
  const raw = document.getElementById('nouv-draft-text2').value.trim();
  if (!raw) { showToast('Veuillez écrire quelque chose', '⚠'); return; }
  saveAndPublishNouveaute(raw.split('\n')[0].slice(0, 80), raw, nouveauteType2);
  document.getElementById('nouv-draft-text2').value = '';
  document.getElementById('admin-compose-inline').style.display = 'none';
}

async function publishNouveaute() {
  const raw = document.getElementById('nouv-draft-text').value.trim();
  if (!raw) { showToast('Veuillez écrire un brouillon', '⚠'); return; }
  const result = await generateProfessionalText(raw, nouveauteType);
  if (!result) { publishNouveauteRaw(); return; }
  saveAndPublishNouveaute(result.title, result.body, nouveauteType);
  document.getElementById('nouv-draft-text').value = '';
  document.getElementById('nouv-panel').classList.remove('open');
}

function publishNouveauteRaw() {
  const raw = document.getElementById('nouv-draft-text').value.trim();
  if (!raw) return;
  saveAndPublishNouveaute(raw.slice(0, 80), raw, nouveauteType);
  document.getElementById('nouv-draft-text').value = '';
  document.getElementById('nouv-panel').classList.remove('open');
}

function saveAndPublishNouveaute(title, body, type, imgData) {
  const nouvs = getNouveautes();
  const n = { id: Date.now(), title, body, type, author: state.user?.name || 'Admin', time: new Date().toISOString(), imgData: imgData || null };
  nouvs.unshift(n);
  saveNouveautes(nouvs);
  updateNouvBadge(); renderNouvPanel(); renderNouvScreen();
  showToast('Nouveauté publiée avec succès !', '📢');
}

function renderNouvScreen() {
  const nouvs = getNouveautes();
  const readIds = getNouvReadIds();
  const list = document.getElementById('nouv-screen-list');
  if (!list) return;
  if (nouvs.length === 0) { list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--dark-gray);">Aucune nouveauté publiée</div>'; return; }
  list.innerHTML = nouvs.map(n => {
    const isRead = readIds.includes(n.id);
    const borderColor = n.type==='urgent'?'#FF5555':n.type==='formation'?'var(--success)':n.type==='evenement'?'#b8960c':'var(--capgemini-blue)';
    const bgGrad = n.type==='annonce'?'#0066CC,#002663':n.type==='formation'?'#00A86B,#005e3b':n.type==='evenement'?'#b8960c,#7a6308':'#FF5555,#c42020';
    const icon = n.type==='annonce'?'📣':n.type==='formation'?'📚':n.type==='evenement'?'🗓':'🚨';
    return `<div style="border:1px solid var(--gray);border-left:4px solid ${borderColor};border-radius:10px;overflow:hidden;margin-bottom:12px;background:${isRead?'var(--white)':'rgba(0,102,204,0.03)'};" onclick="markNouvRead(${n.id});this.style.background='var(--white)'">
      ${n.imgData ? `<img src="${n.imgData}" style="width:100%;height:120px;object-fit:cover;">` : `<div style="width:100%;height:60px;background:linear-gradient(135deg,${bgGrad});display:flex;align-items:center;justify-content:center;font-size:24px;">${icon}</div>`}
      <div style="padding:16px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <span class="nouv-item-tag nouv-tag-${n.type}">${nouvTypeLabel(n.type)}</span>
          ${!isRead?'<span style="font-size:11px;font-weight:700;color:var(--capgemini-blue);">NOUVEAU</span>':''}
          <span style="font-size:12px;color:var(--muted);margin-left:auto;">${new Date(n.time).toLocaleString('fr-FR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}</span>
        </div>
        <div style="font-size:16px;font-weight:700;color:var(--black);margin-bottom:8px;font-family:'Rajdhani',sans-serif;">${n.title}</div>
        <div style="font-size:14px;color:var(--dark-gray);line-height:1.6;">${n.body}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:10px;">Publié par ${n.author} · Nexus Lab</div>
        ${state.user?.isAdmin ? `<button onclick="deleteNouveaute(${n.id});event.stopPropagation();" style="margin-top:8px;padding:4px 10px;font-size:11px;color:#FF5555;border:1px solid rgba(255,75,75,0.3);border-radius:6px;background:transparent;cursor:pointer;">🗑 Supprimer</button>` : ''}
      </div>
    </div>`;
  }).join('');
  const statsEl = document.getElementById('nouv-stats');
  if (statsEl) {
    const types = ['annonce','formation','evenement','urgent'];
    statsEl.innerHTML = types.map(t => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--gray);"><span class="nouv-item-tag nouv-tag-${t}">${nouvTypeLabel(t)}</span><span style="font-weight:700;color:var(--black);">${nouvs.filter(n=>n.type===t).length}</span></div>`).join('') + `<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;font-weight:600;"><span>Total</span><span style="color:var(--capgemini-blue);">${nouvs.length}</span></div>`;
  }
  updateNouvBadge();
}

function deleteNouveaute(id) {
  let nouvs = getNouveautes();
  nouvs = nouvs.filter(n => n.id !== id);
  saveNouveautes(nouvs);
  renderNouvScreen(); renderNouvPanel(); updateNouvBadge();
  showToast('Nouveauté supprimée', '🗑');
}

document.addEventListener('click', function(e) {
  const panel = document.getElementById('nouv-panel');
  const btn = document.getElementById('nouv-btn');
  if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) panel.classList.remove('open');
});

// ===================== COMMUNITY =====================
function getCommunityMembers() { const s = localStorage.getItem('nexus_community'); return s ? JSON.parse(s) : []; }
function saveCommunityMembers(m) { localStorage.setItem('nexus_community', JSON.stringify(m)); }

function addToCommunity(user) {
  const members = getCommunityMembers();
  const exists = members.find(m => m.email === user.email);
  if (!exists) { members.push({ email: user.email, name: user.name, initials: user.initials, dept: 'hardware', school: '', joinedAt: new Date().toISOString(), online: true }); saveCommunityMembers(members); }
  else { exists.online = true; saveCommunityMembers(members); }
}

function renderCommunity() {
  const members = getCommunityMembers();
  const search = (document.getElementById('community-search')?.value || '').toLowerCase();
  const deptFilter = document.getElementById('community-filter')?.value || '';
  const filtered = members.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search) || m.email.toLowerCase().includes(search);
    const matchDept = !deptFilter || m.dept === deptFilter;
    return matchSearch && matchDept;
  });
  const grid = document.getElementById('community-grid');
  if (!grid) return;
  if (filtered.length === 0) { grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--dark-gray);grid-column:1/-1;">Aucun stagiaire trouvé</div>'; }
  else {
    grid.innerHTML = filtered.map(m => {
      const deptName = DEPT_DATA[m.dept]?.name || m.dept || 'Nexus Lab';
      return `<div class="stagiaire-card">
        <div class="stagiaire-avatar-lg">${m.initials}</div>
        <div class="stagiaire-name">${m.name}</div>
        <div class="stagiaire-school">${m.school || 'École non renseignée'}</div>
        <div class="stagiaire-dept">${deptName}</div>
        <div class="online-status"><span class="online-dot"></span>Actif</div>
        <button class="chat-bubble-btn" onclick="showToast('Message envoyé à ${m.name} 📬', '✉')">💬 Contacter</button>
      </div>`;
    }).join('');
  }
  const statsRow = document.getElementById('community-stats-row');
  if (statsRow) {
    const total = members.length;
    const byDept = {};
    members.forEach(m => { byDept[m.dept] = (byDept[m.dept] || 0) + 1; });
    const topDept = Object.entries(byDept).sort((a,b) => b[1]-a[1])[0];
    statsRow.innerHTML = `
      <div class="stat-card" style="padding:12px 16px;flex:0 0 auto;"><div class="stat-value" style="font-size:24px;">${total}</div><div class="stat-label">Stagiaires inscrits</div></div>
      <div class="stat-card" style="padding:12px 16px;flex:0 0 auto;"><div class="stat-value" style="font-size:24px;color:var(--success);">${members.filter(m=>m.online).length}</div><div class="stat-label">En ligne</div></div>
      <div class="stat-card" style="padding:12px 16px;flex:0 0 auto;"><div class="stat-value" style="font-size:24px;color:#FF9800;">${Object.keys(byDept).length}</div><div class="stat-label">Départements</div></div>
      ${topDept ? `<div class="stat-card" style="padding:12px 16px;flex:0 0 auto;"><div style="font-size:13px;font-weight:600;color:var(--capgemini-blue);">${DEPT_DATA[topDept[0]]?.name||topDept[0]}</div><div class="stat-label">${topDept[1]} membres · Top dept</div></div>` : ''}
    `;
  }
}

function filterCommunity() { renderCommunity(); }

// ===================== POWER BI CHARTS =====================
function initPBICharts() {
  if (typeof Chart === 'undefined') return;
  Object.values(pbiChartInstances).forEach(c => { try { c.destroy(); } catch(e) {} });
  pbiChartInstances = {};
  const allRes = state.reservations;
  const monthCounts = Array(12).fill(0);
  allRes.forEach(r => { const m = new Date(r.date).getMonth(); monthCounts[m]++; });
  const c1 = document.getElementById('chart-reservations');
  if (c1) pbiChartInstances.c1 = new Chart(c1, { type:'bar', data:{ labels:['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'], datasets:[{ label:'Réservations', data:monthCounts, backgroundColor:monthCounts.map((v,i)=>i===3?'#0066CC':'rgba(0,102,204,0.3)'), borderRadius:4, borderSkipped:false }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true,ticks:{stepSize:1},grid:{color:'rgba(0,0,0,0.05)'}}, x:{grid:{display:false}} } } });
  const deptCounts = {};
  allRes.forEach(r => { deptCounts[r.dept||'hardware'] = (deptCounts[r.dept||'hardware']||0)+1; });
  const deptLabels = Object.keys(deptCounts).map(d => DEPT_DATA[d]?.name?.split(' ').slice(0,2).join(' ') || d);
  const c2 = document.getElementById('chart-depts');
  if (c2) pbiChartInstances.c2 = new Chart(c2, { type:'doughnut', data:{ labels:deptLabels.length?deptLabels:['Intelligent Hardware'], datasets:[{ data:Object.values(deptCounts).length?Object.values(deptCounts):[1], backgroundColor:['#0066CC','#002663','#00A86B','#FF7800','#9C27B0'], borderWidth:0 }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{legend:{position:'bottom',labels:{font:{size:10},padding:8}}} } });
  const projData = PROJECTS.slice(0, 6);
  const c3 = document.getElementById('chart-progress');
  if (c3) pbiChartInstances.c3 = new Chart(c3, { type:'bar', data:{ labels:projData.map(p=>p.name.length>18?p.name.slice(0,18)+'…':p.name), datasets:[{ label:'Avancement %', data:projData.map(p=>Math.round(p.progress*100)), backgroundColor:projData.map(p=>p.priority==='high'?'#FF7070':p.priority==='medium'?'#0066CC':'#00A86B'), borderRadius:3 }] }, options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{max:100,ticks:{callback:v=>v+'%'},grid:{color:'rgba(0,0,0,0.04)'}}, y:{grid:{display:false},ticks:{font:{size:10}}} } } });
  const high=PROJECTS.filter(p=>p.priority==='high').length, med=PROJECTS.filter(p=>p.priority==='medium').length, low=PROJECTS.filter(p=>p.priority==='low').length;
  const c4 = document.getElementById('chart-priority');
  if (c4) pbiChartInstances.c4 = new Chart(c4, { type:'pie', data:{ labels:['Haute','Moyenne','Basse'], datasets:[{ data:[high||0,med||0,low||0], backgroundColor:['#FF7070','#0066CC','#00A86B'], borderWidth:2, borderColor:'#fff' }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom',labels:{font:{size:11},padding:10}}} } });
  const el2 = document.getElementById('pbi-projets'); if (el2) el2.textContent = PROJECTS.filter(p=>p.status==='Ongoing').length;
  const el4 = document.getElementById('pbi-stagiaires'); if (el4) el4.textContent = getCommunityMembers().length || 12;
}

// ===================== ANALYTICS OVERLAY =====================
let analyticsCharts = {};

function openAnalyticsOverlay() {
  document.getElementById('analytics-overlay').classList.add('open');
  setTimeout(() => { if (typeof Chart !== 'undefined') renderAnalytics(); else { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'; s.onload = renderAnalytics; document.head.appendChild(s); } }, 100);
}

function closeAnalyticsOverlay() { document.getElementById('analytics-overlay').classList.remove('open'); }

function renderAnalytics() {
  if (typeof Chart === 'undefined') return;
  Object.values(analyticsCharts).forEach(c => { try { c.destroy(); } catch(e) {} });
  analyticsCharts = {};
  const allRes = state.reservations;
  const livrables = getLivrables();
  const reclamations = getReclamations();
  const COLORS = ['#0066CC','#002663','#00A86B','#FF7800','#9C27B0','#FF4B4B','#FF9800','#00BCD4'];
  const kpiData = [
    { val:PROJECTS.filter(p=>p.status==='Ongoing').length, lbl:'Projets actifs', color:'var(--capgemini-blue)' },
    { val:allRes.length, lbl:'Total réservations', color:'#0066CC' },
    { val:allRes.filter(r=>r.status==='approved').length, lbl:'Approuvées', color:'var(--success)' },
    { val:allRes.filter(r=>r.status==='confirmed').length, lbl:'En attente', color:'#FF7070' },
    { val:livrables.length, lbl:'Livrables déposés', color:'#9C27B0' },
    { val:reclamations.filter(r=>r.status==='open').length, lbl:'Réclamations ouvertes', color:'#FF7800' },
  ];
  document.getElementById('analytics-kpis').innerHTML = kpiData.map(k => `<div class="analytics-kpi"><div class="analytics-kpi-val" style="color:${k.color};">${k.val}</div><div class="analytics-kpi-lbl">${k.lbl}</div></div>`).join('');
  const months = Array(12).fill(0);
  allRes.forEach(r => { const m = new Date(r.date).getMonth(); months[m]++; });
  const c1 = document.getElementById('ac-res-month');
  if (c1) analyticsCharts.c1 = new Chart(c1, { type:'bar', data:{ labels:['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'], datasets:[{ label:'Réservations', data:months, backgroundColor:'rgba(0,102,204,0.6)', borderRadius:4 }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{stepSize:1}},x:{grid:{display:false}}} } });
  const deptCounts = {};
  allRes.forEach(r => { deptCounts[r.dept||'hardware'] = (deptCounts[r.dept||'hardware']||0)+1; });
  const c2 = document.getElementById('ac-depts');
  if (c2) analyticsCharts.c2 = new Chart(c2, { type:'doughnut', data:{ labels:Object.keys(deptCounts).map(d=>DEPT_DATA[d]?.name?.split(' ').slice(0,2).join(' ')||d), datasets:[{ data:Object.values(deptCounts).length?Object.values(deptCounts):[1], backgroundColor:COLORS, borderWidth:0 }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'55%', plugins:{legend:{position:'bottom',labels:{font:{size:10},padding:6}}} } });
  const c3 = document.getElementById('ac-progress');
  if (c3) analyticsCharts.c3 = new Chart(c3, { type:'bar', data:{ labels:PROJECTS.slice(0,6).map(p=>p.name.slice(0,15)+'…'), datasets:[{ data:PROJECTS.slice(0,6).map(p=>Math.round(p.progress*100)), backgroundColor:PROJECTS.slice(0,6).map(p=>p.priority==='high'?'#FF7070':p.priority==='medium'?'#0066CC':'#00A86B'), borderRadius:3 }] }, options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{max:100,ticks:{callback:v=>v+'%'}},y:{grid:{display:false},ticks:{font:{size:10}}}} } });
  const matCount = {};
  allRes.forEach(r => { (r.materials||[]).forEach(m => { matCount[m] = (matCount[m]||0)+1; }); });
  const matEntries = Object.entries(matCount).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const c5 = document.getElementById('ac-materials');
  if (c5) analyticsCharts.c5 = new Chart(c5, { type:'bar', data:{ labels:matEntries.map(e=>e[0].slice(0,14)), datasets:[{ data:matEntries.map(e=>e[1])||[0], backgroundColor:'rgba(156,33,243,0.6)', borderRadius:3 }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{stepSize:1}},x:{grid:{display:false},ticks:{font:{size:10}}}} } });
  const confirmed=allRes.filter(r=>r.status==='confirmed').length, approved=allRes.filter(r=>r.status==='approved').length, rejected=allRes.filter(r=>r.status==='rejected').length;
  const c6 = document.getElementById('ac-status');
  if (c6) analyticsCharts.c6 = new Chart(c6, { type:'pie', data:{ labels:['En attente','Approuvées','Rejetées'], datasets:[{ data:[confirmed||0,approved||0,rejected||0], backgroundColor:['#FF9800','#00A86B','#FF4B4B'], borderWidth:2, borderColor:'#fff' }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom',labels:{font:{size:11}}}} } });
  const livTypes = {rapport:0,presentation:0,code:0,documentation:0,autre:0};
  livrables.forEach(l => { livTypes[l.type] = (livTypes[l.type]||0)+1; });
  const c8 = document.getElementById('ac-livrables');
  if (c8) analyticsCharts.c8 = new Chart(c8, { type:'doughnut', data:{ labels:['Rapport','Présentation','Code','Doc','Autre'], datasets:[{ data:Object.values(livTypes), backgroundColor:['#FF7070','#0066CC','#00A86B','#FF9800','#9C27B0'], borderWidth:0 }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'50%', plugins:{legend:{position:'bottom',labels:{font:{size:9},padding:5}}} } });
  const reclCats = {equipement:0,planning:0,technique:0,autre:0};
  reclamations.forEach(r => { reclCats[r.category] = (reclCats[r.category]||0)+1; });
  const c9 = document.getElementById('ac-reclamations');
  if (c9) analyticsCharts.c9 = new Chart(c9, { type:'bar', data:{ labels:['Équipement','Planning','Technique','Autre'], datasets:[{ data:Object.values(reclCats), backgroundColor:['#FF7800','#9C27B0','#0066CC','#888'], borderRadius:4 }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{stepSize:1}},x:{grid:{display:false},ticks:{font:{size:10}}}} } });
}

// ===================== CHAT =====================
const CHAT_ROOMS = [
  { id:'general', name:'🏠 Général', desc:'Discussion générale', icon:'🏠' },
  { id:'hardware', name:'🔧 Intelligent Hardware', desc:'Département Hardware', icon:'🔧' },
  { id:'electronics', name:'⚡ Electronics Eng.', desc:'Département Electronics', icon:'⚡' },
  { id:'ai', name:'🤖 Next Gen AI', desc:'Département AI', icon:'🤖' },
  { id:'projets', name:'📁 Projets', desc:'Discussion projets', icon:'📁' },
  { id:'off', name:'☕ Off-topic', desc:'Discussion libre', icon:'☕' },
];
let activeChatRoom = 'general';

function getChatMessages(roomId) { const s = localStorage.getItem('nexus_chat_' + roomId); return s ? JSON.parse(s) : []; }
function saveChatMessages(roomId, msgs) { localStorage.setItem('nexus_chat_' + roomId, JSON.stringify(msgs)); }
function getUnreadChatCount(roomId) {
  const msgs = getChatMessages(roomId);
  const lastSeen = localStorage.getItem('nexus_chat_seen_' + (state.user?.email||'') + '_' + roomId);
  const lastSeenTime = lastSeen ? parseInt(lastSeen) : 0;
  return msgs.filter(m => m.timestamp > lastSeenTime && m.userEmail !== state.user?.email).length;
}
function markChatRoomRead(roomId) { localStorage.setItem('nexus_chat_seen_' + (state.user?.email||'') + '_' + roomId, Date.now().toString()); updateChatNavBadge(); }
function updateChatNavBadge() {
  let total = 0;
  CHAT_ROOMS.forEach(r => { total += getUnreadChatCount(r.id); });
  const badge = document.getElementById('chat-nav-badge');
  if (badge) { if (total > 0) { badge.style.display = 'inline-flex'; badge.textContent = total; } else { badge.style.display = 'none'; } }
}

function initChatScreen() {
  CHAT_ROOMS.forEach(r => {
    const msgs = getChatMessages(r.id);
    if (msgs.length === 0) saveChatMessages(r.id, [{ id: Date.now() + Math.random(), userEmail:'system@nexus', userName:'Nexus Bot 🤖', userInitials:'NB', text:`Bienvenue dans ${r.name} ! C'est le début de votre conversation. 👋`, timestamp: Date.now() - 86400000 }]);
  });
  renderChatRoomsList();
  switchChatRoom(activeChatRoom);
}

function renderChatRoomsList() {
  const list = document.getElementById('chat-rooms-list');
  if (!list) return;
  list.innerHTML = CHAT_ROOMS.map(r => {
    const msgs = getChatMessages(r.id);
    const lastMsg = msgs[msgs.length - 1];
    const unread = getUnreadChatCount(r.id);
    return `<div class="chat-room-item ${activeChatRoom===r.id?'active':''}" onclick="switchChatRoom('${r.id}')">
      <div class="chat-room-icon">${r.icon}</div>
      <div style="flex:1;min-width:0;"><div class="chat-room-name">${r.name}</div><div class="chat-room-last">${lastMsg ? lastMsg.text : 'Aucun message'}</div></div>
      ${unread > 0 ? `<span class="chat-unread-dot"></span>` : ''}
    </div>`;
  }).join('');
}

function switchChatRoom(roomId) {
  activeChatRoom = roomId;
  markChatRoomRead(roomId);
  const room = CHAT_ROOMS.find(r => r.id === roomId);
  const members = getCommunityMembers();
  document.getElementById('chat-active-icon').textContent = room?.icon || '💬';
  document.getElementById('chat-active-name').textContent = room?.name || roomId;
  document.getElementById('chat-active-members').textContent = `${members.length + 1} membre(s) · Nexus Lab`;
  renderChatRoomsList(); renderChatMessages();
}

function renderChatMessages() {
  const msgs = getChatMessages(activeChatRoom);
  const container = document.getElementById('chat-messages');
  if (!container) return;
  if (msgs.length === 0) { container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--dark-gray);font-size:13px;">Aucun message</div>'; return; }
  container.innerHTML = msgs.map(m => {
    const isMine = m.userEmail === state.user?.email;
    const time = new Date(m.timestamp).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
    const date = new Date(m.timestamp).toLocaleDateString('fr-FR', {day:'numeric', month:'short'});
    return `<div class="chat-msg ${isMine?'mine':''}">
      <div class="chat-msg-avatar">${m.userInitials}</div>
      <div><div class="chat-bubble">${escapeHtml(m.text)}</div><div class="chat-msg-meta">${isMine?'':m.userName+' · '}${date} ${time}</div></div>
    </div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) { return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>'); }

function sendChatMessage() {
  const input = document.getElementById('chat-msg-input');
  const text = input.value.trim();
  if (!text) return;
  const msgs = getChatMessages(activeChatRoom);
  msgs.push({ id:Date.now(), userEmail:state.user.email, userName:state.user.name, userInitials:state.user.initials, text, timestamp:Date.now() });
  saveChatMessages(activeChatRoom, msgs);
  input.value = ''; input.style.height = 'auto';
  renderChatMessages(); renderChatRoomsList(); updateChatNavBadge();
}

function chatKeyDown(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }
function autoResizeChatInput(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 100) + 'px'; }

// ===================== LIVRABLES =====================
function getLivrables() { const s = localStorage.getItem('nexus_livrables'); return s ? JSON.parse(s) : []; }
function saveLivrables(l) { localStorage.setItem('nexus_livrables', JSON.stringify(l)); }
let pendingLivrableFile = null;

function handleLivrableUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  pendingLivrableFile = file;
  const uploadZone = document.getElementById('upload-zone');
  uploadZone.innerHTML = `<div style="font-size:20px;margin-bottom:8px;">${getLivrableIcon(file.name)}</div><div style="font-size:14px;font-weight:600;color:var(--black);">${file.name}</div><div style="font-size:12px;color:var(--dark-gray);margin-top:4px;">${(file.size/1024/1024).toFixed(2)} MB</div>`;
  const prog = document.getElementById('upload-progress-area');
  prog.innerHTML = '<div class="file-progress"><div class="file-progress-bar" id="fpb" style="width:0%"></div></div><div style="font-size:11px;color:var(--capgemini-blue);margin-top:4px;">Chargement...</div>';
  let w = 0;
  const iv = setInterval(() => { w += 20; document.getElementById('fpb').style.width = w + '%'; if (w >= 100) { clearInterval(iv); prog.innerHTML = '<div style="font-size:12px;color:var(--success);margin-top:4px;">✓ Fichier prêt</div>'; document.getElementById('livrable-form').style.display = 'block'; document.getElementById('livrable-project').value = state.reservations[0]?.project || ''; } }, 100);
  document.getElementById('livrable-dept').value = state.currentDept || 'hardware';
}

function uploadDragOver(e) { e.preventDefault(); document.getElementById('upload-zone').classList.add('drag-over'); }
function uploadDragLeave(e) { document.getElementById('upload-zone').classList.remove('drag-over'); }
function uploadDrop(e) {
  e.preventDefault(); document.getElementById('upload-zone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) { const input = document.getElementById('livrable-file-input'); const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files; handleLivrableUpload({target:{files:[file]}}); }
}

function getLivrableIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return '📄';
  if (['doc','docx'].includes(ext)) return '📝';
  if (['ppt','pptx'].includes(ext)) return '📊';
  if (['zip','rar','7z'].includes(ext)) return '📦';
  if (['py','js','ts','cpp','c','java'].includes(ext)) return '💻';
  if (['png','jpg','jpeg','gif'].includes(ext)) return '🖼';
  return '📎';
}

function getLivrableTypeBadge(type) {
  const map = {rapport:'livrable-pdf', presentation:'livrable-doc', code:'livrable-zip', documentation:'livrable-doc', autre:'livrable-other'};
  const labels = {rapport:'📄 Rapport', presentation:'📊 Présentation', code:'💻 Code', documentation:'📚 Doc', autre:'📎 Autre'};
  return `<span class="livrable-type-badge ${map[type]||'livrable-other'}">${labels[type]||type}</span>`;
}

function cancelLivrableUpload() {
  pendingLivrableFile = null;
  document.getElementById('livrable-form').style.display = 'none';
  document.getElementById('upload-progress-area').innerHTML = '';
  document.getElementById('upload-zone').innerHTML = '<div class="upload-zone-icon">📤</div><div class="upload-zone-text">Glissez vos fichiers ici ou cliquez pour choisir</div><div class="upload-zone-sub">PDF, DOCX, PPTX, ZIP, images — Max 50 MB</div>';
  document.getElementById('livrable-file-input').value = '';
}

function submitLivrable() {
  const title = document.getElementById('livrable-title').value.trim();
  const project = document.getElementById('livrable-project').value.trim();
  if (!title) { showToast('Veuillez donner un titre', '⚠'); return; }
  const livrables = getLivrables();
  const newLiv = {
    id: Date.now(), title, filename: pendingLivrableFile?.name || 'fichier.pdf',
    project: project || 'Non spécifié', dept: document.getElementById('livrable-dept').value,
    type: document.getElementById('livrable-type').value, desc: document.getElementById('livrable-desc').value,
    size: pendingLivrableFile ? (pendingLivrableFile.size/1024/1024).toFixed(2) + ' MB' : '—',
    userEmail: state.user.email, userName: state.user.name, userInitials: state.user.initials,
    status: 'submitted', submittedAt: new Date().toISOString()
  };
  livrables.unshift(newLiv);
  saveLivrables(livrables);
  addNotification('📁 Nouveau livrable déposé', `${state.user.name} — ${newLiv.title}`, 'LIV-' + newLiv.id);
  cancelLivrableUpload();
  renderLivrables();
  showToast('Livrable soumis avec succès !', '📁');
}

function renderLivrables() {
  const all = getLivrables();
  const filter = document.getElementById('livrables-filter')?.value || '';
  const isAdmin = state.user?.isAdmin;
  const mine = isAdmin ? all : all.filter(l => l.userEmail === state.user?.email);
  const filtered = filter ? mine.filter(l => l.type === filter) : mine;
  document.getElementById('livrables-list-title').textContent = isAdmin ? 'Tous les Livrables' : 'Mes Livrables';
  if (isAdmin) { document.getElementById('livrable-upload-card').style.display = 'none'; }
  const list = document.getElementById('livrables-list');
  if (!list) return;
  if (filtered.length === 0) { list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--dark-gray);">Aucun livrable trouvé</div>'; }
  else {
    list.innerHTML = filtered.map(l => {
      const date = new Date(l.submittedAt).toLocaleDateString('fr-FR', {day:'numeric',month:'short',year:'numeric'});
      const deptName = DEPT_DATA[l.dept]?.name || l.dept;
      return `<div class="livrable-card">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="font-size:28px;flex-shrink:0;">${getLivrableIcon(l.filename)}</div>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">${getLivrableTypeBadge(l.type)}<span style="font-size:11px;color:var(--muted);">${date}</span>${l.status==='reviewed'?'<span style="font-size:11px;background:rgba(0,168,107,0.12);color:var(--success);padding:2px 8px;border-radius:10px;font-weight:600;">✓ Vu</span>':'<span style="font-size:11px;background:rgba(0,102,204,0.1);color:var(--capgemini-blue);padding:2px 8px;border-radius:10px;font-weight:600;">⏳ Soumis</span>'}</div>
            <div style="font-size:15px;font-weight:600;color:var(--black);">${l.title}</div>
            <div style="font-size:12px;color:var(--dark-gray);margin-top:3px;">📁 ${l.project} · 🏢 ${deptName} · 💾 ${l.size}</div>
            ${isAdmin ? `<div style="font-size:12px;color:var(--capgemini-blue);margin-top:4px;">👤 ${l.userName}</div>` : ''}
            ${l.desc ? `<div style="font-size:12px;color:var(--dark-gray);margin-top:6px;padding:8px;background:var(--light-gray);border-radius:6px;">${l.desc}</div>` : ''}
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;">
            ${isAdmin ? `<button class="btn-icon" onclick="markLivrableReviewed(${l.id})">👁 Vu</button>` : ''}
            <button class="btn-icon btn-danger-sm" onclick="deleteLivrable(${l.id})">🗑</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }
  const stats = document.getElementById('livrables-stats');
  if (stats) {
    const total = mine.length;
    const byType = {rapport:0,presentation:0,code:0,documentation:0,autre:0};
    mine.forEach(l => byType[l.type] = (byType[l.type]||0)+1);
    stats.innerHTML = `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray);"><span style="font-size:13px;">Total</span><strong style="color:var(--capgemini-blue);">${total}</strong></div>${Object.entries(byType).map(([t,c])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray);">${getLivrableTypeBadge(t)}<strong>${c}</strong></div>`).join('')}`;
  }
}

function markLivrableReviewed(id) {
  const livs = getLivrables();
  const l = livs.find(x => x.id === id);
  if (l) { l.status = 'reviewed'; saveLivrables(livs); renderLivrables(); showToast('Livrable marqué comme vu', '👁'); }
}
function deleteLivrable(id) { let livs = getLivrables().filter(l => l.id !== id); saveLivrables(livs); renderLivrables(); showToast('Livrable supprimé', '🗑'); }

// ===================== RECLAMATIONS =====================
function getReclamations() { const s = localStorage.getItem('nexus_reclamations'); return s ? JSON.parse(s) : []; }
function saveReclamations(r) { localStorage.setItem('nexus_reclamations', JSON.stringify(r)); }

function updateReclNavBadge() {
  const recls = getReclamations();
  const open = state.user?.isAdmin ? recls.filter(r => r.status === 'open').length : 0;
  const badge = document.getElementById('recl-nav-badge');
  if (badge) { if (open > 0 && state.user?.isAdmin) { badge.style.display = 'inline-flex'; badge.textContent = open; } else { badge.style.display = 'none'; } }
}

function toggleReclForm() {
  const body = document.getElementById('recl-form-body');
  body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

function submitReclamation() {
  const title = document.getElementById('recl-title').value.trim();
  const desc = document.getElementById('recl-desc').value.trim();
  if (!title) { showToast('Veuillez saisir un titre', '⚠'); return; }
  if (!desc) { showToast('Veuillez décrire le problème', '⚠'); return; }
  const recls = getReclamations();
  recls.unshift({
    id: Date.now(), title, desc,
    category: document.getElementById('recl-category').value,
    priority: document.getElementById('recl-priority').value,
    reservation: document.getElementById('recl-reservation').value,
    status: 'open', userEmail: state.user.email, userName: state.user.name,
    userInitials: state.user.initials, createdAt: new Date().toISOString(), reply: null, repliedAt: null
  });
  saveReclamations(recls);
  addNotification('📣 Nouvelle réclamation', `${state.user.name} — ${title}`, 'RECL');
  updateReclNavBadge();
  toggleReclForm();
  ['recl-title','recl-desc','recl-reservation'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  renderReclamations();
  showToast('Réclamation envoyée !', '📣');
}

function renderReclamations() {
  const all = getReclamations();
  const isAdmin = state.user?.isAdmin;
  const mine = isAdmin ? all : all.filter(r => r.userEmail === state.user?.email);
  const statusFilter = document.getElementById('recl-filter-status')?.value || '';
  const filtered = statusFilter ? mine.filter(r => r.status === statusFilter) : mine;
  document.getElementById('recl-list-title').textContent = isAdmin ? 'Toutes les Réclamations' : 'Mes Réclamations';
  const list = document.getElementById('reclamations-list');
  if (!list) return;
  if (filtered.length === 0) { list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--dark-gray);">Aucune réclamation</div>'; }
  else {
    const catLabels = {equipement:'🔌 Équipement', planning:'📅 Planning', technique:'💻 Technique', autre:'📋 Autre'};
    const catClass = {equipement:'recl-cat-equipement', planning:'recl-cat-planning', technique:'recl-cat-technique', autre:'recl-cat-autre'};
    list.innerHTML = filtered.map(r => {
      const date = new Date(r.createdAt).toLocaleDateString('fr-FR', {day:'numeric',month:'short',year:'numeric'});
      const statusBadge = r.status==='open'?'<span class="recl-badge-open">🔴 Ouverte</span>':r.status==='progress'?'<span class="recl-badge-progress">🔵 En cours</span>':'<span class="recl-badge-closed">✓ Clôturée</span>';
      return `<div class="recl-card recl-status-${r.status}">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
              <span class="recl-cat-badge ${catClass[r.category]||'recl-cat-autre'}">${catLabels[r.category]||r.category}</span>
              ${statusBadge} ${priorityBadge(r.priority)}<span style="font-size:11px;color:var(--muted);">${date}</span>
            </div>
            <div style="font-size:15px;font-weight:600;color:var(--black);">${r.title}</div>
            ${isAdmin?`<div style="font-size:12px;color:var(--capgemini-blue);margin-top:4px;">👤 ${r.userName}</div>`:''}
            <div style="font-size:13px;color:var(--dark-gray);margin-top:8px;line-height:1.5;">${r.desc}</div>
            ${r.reply?`<div style="margin-top:12px;padding:10px 14px;background:rgba(0,168,107,0.08);border:1px solid rgba(0,168,107,0.2);border-radius:8px;"><div style="font-size:11px;font-weight:600;color:var(--success);margin-bottom:4px;">💬 Réponse admin</div><div style="font-size:13px;color:var(--black);">${r.reply}</div></div>`:''}
          </div>
          <div>${isAdmin&&r.status!=='closed'?`<button class="btn-yellow" style="padding:7px 14px;font-size:12px;" onclick="openReclReply(${r.id})">💬 Répondre</button>`:''}${isAdmin?`<button class="btn-icon btn-danger-sm" style="margin-top:6px;display:block;" onclick="deleteRecl(${r.id})">🗑</button>`:''}</div>
        </div>
      </div>`;
    }).join('');
  }
  const stats = document.getElementById('recl-stats');
  if (stats) {
    const open=mine.filter(r=>r.status==='open').length, progress=mine.filter(r=>r.status==='progress').length, closed=mine.filter(r=>r.status==='closed').length;
    stats.innerHTML = `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray);"><span class="recl-badge-open">🔴 Ouvertes</span><strong>${open}</strong></div><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray);"><span class="recl-badge-progress">🔵 En cours</span><strong>${progress}</strong></div><div style="display:flex;justify-content:space-between;padding:8px 0;"><span class="recl-badge-closed">✓ Clôturées</span><strong>${closed}</strong></div>`;
  }
}

let currentReclId = null;
function openReclReply(id) {
  currentReclId = id;
  const recls = getReclamations();
  const r = recls.find(x => x.id === id);
  if (!r) return;
  document.getElementById('recl-reply-content').innerHTML = `<div style="padding:12px;background:var(--light-gray);border-radius:8px;margin-bottom:4px;"><div style="font-size:13px;font-weight:600;">${r.title}</div><div style="font-size:12px;color:var(--dark-gray);margin-top:4px;">${r.userName} · ${r.desc.slice(0,120)}</div></div>`;
  document.getElementById('recl-reply-text').value = '';
  document.getElementById('recl-reply-modal').classList.add('open');
}

function sendReclReply() {
  const reply = document.getElementById('recl-reply-text').value.trim();
  if (!reply) { showToast('Veuillez écrire une réponse', '⚠'); return; }
  const recls = getReclamations();
  const r = recls.find(x => x.id === currentReclId);
  if (r) {
    r.reply = reply; r.status = document.getElementById('recl-reply-status').value; r.repliedAt = new Date().toISOString();
    saveReclamations(recls);
    document.getElementById('recl-reply-modal').classList.remove('open');
    renderReclamations(); updateReclNavBadge();
    showToast('Réponse envoyée !', '✅');
  }
}

function deleteRecl(id) { saveReclamations(getReclamations().filter(r => r.id !== id)); renderReclamations(); showToast('Réclamation supprimée', '🗑'); }

// ===================== NOUVEAUTE AI MODAL =====================
let naiType = 'annonce', naiGeneratedData = null, naiImgData = null;

function openNaiModal() {
  naiType = 'annonce'; naiGeneratedData = null; naiImgData = null;
  document.getElementById('nai-raw-text').value = '';
  document.getElementById('nai-step1').style.display = 'block';
  document.getElementById('nai-step2').style.display = 'none';
  document.getElementById('nai-generating').style.display = 'none';
  document.getElementById('nai-preview').style.display = 'none';
  document.getElementById('nouv-img-preview').innerHTML = '🖼';
  setNaiStepUI(1);
  document.getElementById('nouv-ai-modal').classList.add('open');
}

function closeNaiModal() { document.getElementById('nouv-ai-modal').classList.remove('open'); }

function setNaiType(t) {
  naiType = t;
  ['annonce','formation','evenement','urgent'].forEach(x => { const el = document.getElementById('nai-t-' + x); if (el) el.classList.toggle('selected', x === t); });
}

function setNaiStepUI(active) {
  [1,2,3,4].forEach(i => {
    const el = document.getElementById('nas-' + i); if (!el) return;
    el.classList.remove('active','done');
    if (i < active) el.classList.add('done'); else if (i === active) el.classList.add('active');
  });
}

function naiBackToStep1() { document.getElementById('nai-step1').style.display = 'block'; document.getElementById('nai-step2').style.display = 'none'; setNaiStepUI(1); }

async function naiStep2() {
  const raw = document.getElementById('nai-raw-text').value.trim();
  if (!raw) { showToast('Veuillez décrire votre nouveauté', '⚠'); return; }
  document.getElementById('nai-step1').style.display = 'none';
  document.getElementById('nai-step2').style.display = 'block';
  document.getElementById('nai-generating').style.display = 'block';
  document.getElementById('nai-preview').style.display = 'none';
  setNaiStepUI(2);
  const result = await generateProfessionalText(raw, naiType);
  document.getElementById('nai-generating').style.display = 'none';
  document.getElementById('nai-preview').style.display = 'block';
  setNaiStepUI(3);
  naiGeneratedData = result || { title: raw.split('\n')[0].slice(0, 80), body: raw };
  document.getElementById('nai-edit-title').value = naiGeneratedData.title;
  document.getElementById('nai-edit-body').value = naiGeneratedData.body;
  document.getElementById('nai-edit-title').oninput = updateNaiPreview;
  document.getElementById('nai-edit-body').oninput = updateNaiPreview;
  updateNaiPreview();
}

function updateNaiPreview() {
  const title = document.getElementById('nai-edit-title')?.value || '';
  const body = document.getElementById('nai-edit-body')?.value || '';
  document.getElementById('nai-preview-tag').innerHTML = `<span class="nouv-item-tag nouv-tag-${naiType}">${nouvTypeLabel(naiType)}</span>`;
  document.getElementById('nai-preview-title').textContent = title;
  document.getElementById('nai-preview-body').textContent = body;
  document.getElementById('nai-preview-meta').textContent = `Par ${state.user?.name || 'Admin'} · Nexus Lab`;
  const imgEl = document.getElementById('nai-preview-img');
  const colors = {annonce:'#0066CC,#002663', formation:'#00A86B,#005e3b', evenement:'#b8960c,#7a6308', urgent:'#FF5555,#c42020'};
  imgEl.style.display = 'block';
  imgEl.innerHTML = naiImgData ? `<img src="${naiImgData}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;">` : `<div style="width:100%;height:80px;border-radius:8px;background:linear-gradient(135deg,${colors[naiType]||colors.annonce});display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:8px;">${naiType==='annonce'?'📣':naiType==='formation'?'📚':naiType==='evenement'?'🗓':'🚨'}</div>`;
}

function previewNouvImg(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => { naiImgData = e.target.result; document.getElementById('nouv-img-preview').innerHTML = `<img src="${naiImgData}" style="width:100%;height:60px;object-fit:cover;border-radius:6px;">`; };
  reader.readAsDataURL(file);
}

function naiPublish() {
  const title = document.getElementById('nai-edit-title').value.trim();
  const body = document.getElementById('nai-edit-body').value.trim();
  if (!title || !body) { showToast('Titre et contenu requis', '⚠'); return; }
  setNaiStepUI(4);
  saveAndPublishNouveaute(title, body, naiType, naiImgData);
  setTimeout(() => closeNaiModal(), 500);
}

function openNaiModal_screen() { openNaiModal(); }

// ===================== POST-LOGIN =====================
function postLoginInit() { updateChatNavBadge(); updateReclNavBadge(); checkDisplacedNotifications(); }

function checkDisplacedNotifications() {
  if (!state.user || state.user.isAdmin) return;
  const notifs = JSON.parse(localStorage.getItem('nexus_displaced_notifs_' + state.user.email) || '[]');
  if (notifs.length === 0) return;
  const latest = notifs[0];
  setTimeout(() => {
    showToast('⚡ Votre réservation ' + latest.code + ' a été déplacée', '⚡');
    localStorage.removeItem('nexus_displaced_notifs_' + state.user.email);
  }, 1500);
}

// ===================== PRIORITY CONFLICT =====================
const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };

function checkSlotConflict(date, start, end, excludeCode) {
  return state.reservations.filter(r => {
    if (excludeCode && r.code === excludeCode) return false;
    if (r.status === 'rejected') return false;
    if (r.date !== date) return false;
    const pad = t => t.replace(':','').padStart(4,'0');
    return !(pad(end) <= pad(r.start) || pad(start) >= pad(r.end));
  });
}

function resolveConflict(newPriority, existingPriority) {
  return (PRIORITY_RANK[newPriority]||1) > (PRIORITY_RANK[existingPriority]||1) ? 'DISPLACE' : 'BLOCKED';
}

function validateSlotBeforeConfirm(priority, dateStr, tStart, tEnd) {
  if (!dateStr || dateStr.includes('undefined') || dateStr.includes('NaN')) return { ok: false, reason: 'no_date' };
  const conflicts = checkSlotConflict(dateStr, tStart, tEnd, null);
  if (conflicts.length === 0) return { ok: true };
  const conflict = conflicts[0];
  const action = resolveConflict(priority, conflict.priority);
  const pLabel = p => p==='high'?'🔥 Haute':p==='medium'?'⏰ Moyenne':'🟢 Basse';
  if (action === 'DISPLACE') return { ok: true, displace: conflict, message: `Votre priorité <strong>${pLabel(priority)}</strong> est supérieure. Vous pouvez prendre ce créneau.` };
  return { ok: false, reason: 'blocked', conflict, message: `Ce créneau est réservé avec une priorité supérieure ou égale. Choisissez un autre horaire.` };
}

function showConflictModal(check, mode, onConfirm) {
  const wrap = document.getElementById('conflict-modal-wrap');
  const box = document.getElementById('conflict-modal-box');
  wrap.style.display = 'flex';
  if (mode === 'blocked') {
    box.style.borderTop = '4px solid #FF4B4B';
    document.getElementById('conflict-modal-title').textContent = '⛔ Créneau non disponible';
    document.getElementById('conflict-modal-msg').innerHTML = check.message;
    const c = check.conflict;
    document.getElementById('conflict-detail-box').innerHTML = `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;"><span>Code</span><span style="font-family:'Rajdhani',sans-serif;color:var(--capgemini-blue);">${c.code}</span></div><div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;"><span>Projet</span><span>${c.project}</span></div>`;
    document.getElementById('conflict-actions').innerHTML = `<button class="btn-secondary" onclick="closeConflictModal()">Fermer</button><button class="btn-yellow" onclick="closeConflictModal(); goStep(4);">← Changer créneau</button>`;
  } else {
    box.style.borderTop = '4px solid #FF9800';
    document.getElementById('conflict-modal-title').textContent = '⚡ Créneau déplaçable';
    document.getElementById('conflict-modal-msg').innerHTML = check.message;
    const c = check.displace;
    document.getElementById('conflict-detail-box').innerHTML = `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;"><span>Code déplacé</span><span style="font-family:'Rajdhani',sans-serif;color:var(--capgemini-blue);">${c.code}</span></div><div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;"><span>Projet</span><span>${c.project}</span></div>`;
    document.getElementById('conflict-actions').innerHTML = `<button class="btn-secondary" onclick="closeConflictModal()">Annuler</button><button class="btn-yellow" style="background:#FF9800;" onclick="closeConflictModal(); (${onConfirm.toString()})();">⚡ Confirmer</button>`;
  }
}

function closeConflictModal() { document.getElementById('conflict-modal-wrap').style.display = 'none'; }

function displaceReservation(conflictRes) {
  const r = state.reservations.find(x => x.code === conflictRes.code);
  if (!r) return;
  r.status = 'displaced'; r.displacedAt = new Date().toISOString();
  saveReservations(state.reservations);
  addNotification('⚡ Réservation déplacée', `${r.member} (${r.code}) — ${r.project}`, r.code);
  const displacedNotifs = JSON.parse(localStorage.getItem('nexus_displaced_notifs_' + r.userEmail) || '[]');
  displacedNotifs.unshift({ code: r.code, project: r.project, date: r.date, start: r.start, end: r.end, msg: 'Votre réservation a été déplacée.', time: new Date().toISOString() });
  localStorage.setItem('nexus_displaced_notifs_' + r.userEmail, JSON.stringify(displacedNotifs));
  showToast('Réservation ' + r.code + ' déplacée.', '⚡');
}

function onTimeSelectChange() { if (state.currentStep === 4) renderCalendar(); }

// ===================== DARK MODE =====================
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('nexus_dark_mode', isDark ? '1' : '0');
  document.getElementById('dark-toggle-btn').textContent = isDark ? '☀️' : '🌙';
}

function initDarkMode() {
  const saved = localStorage.getItem('nexus_dark_mode');
  if (saved === '1') { document.body.classList.add('dark-mode'); const btn = document.getElementById('dark-toggle-btn'); if (btn) btn.textContent = '☀️'; }
}

// ===================== LANGUAGE SYSTEM =====================
let currentLang = localStorage.getItem('nexus_lang') || 'fr';

const TRANSLATIONS = {
  fr: { dashboard:'Dashboard', reservation:'Réservation', mes_reservations:'Mes Réservations', nouveautes:'Nouveautés', community:'Communauté', chat:'Messagerie', livrables:'Livrables', reclamations:'Réclamations', guidelines:'Guidelines', admin:'Admin', validations:'Validations', logout:'Déconnexion', topbar_sub:'Nexus Lab · Intelligent Hardware', overview:'Vue globale', export_csv:'Export CSV', history:'Historique', users:'Utilisateurs', enter_platform:'Accéder à la plateforme →', reserved_access:'Accès réservé aux équipes Nexus Lab · Capgemini Engineering', profile_user:'Stagiaire', profile_admin:'Admin · EUM' },
  en: { dashboard:'Dashboard', reservation:'Booking', mes_reservations:'My Bookings', nouveautes:'News', community:'Community', chat:'Messaging', livrables:'Deliverables', reclamations:'Complaints', guidelines:'Guidelines', admin:'Admin', validations:'Validations', logout:'Logout', topbar_sub:'Nexus Lab · Intelligent Hardware', overview:'Overview', export_csv:'Export CSV', history:'History', users:'Users', enter_platform:'Access Platform →', reserved_access:'Access reserved to Nexus Lab teams · Capgemini Engineering', profile_user:'Intern', profile_admin:'Admin · EUM' }
};

function t(key) { return (TRANSLATIONS[currentLang] || TRANSLATIONS['fr'])[key] || key; }

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('nexus_lang', lang);
  document.getElementById('lang-fr')?.classList.toggle('active', lang === 'fr');
  document.getElementById('lang-en')?.classList.toggle('active', lang === 'en');
  applyTranslations();
}

function applyTranslations() {
  const navMap = { 'nav-dashboard':'dashboard', 'nav-reservation':'reservation', 'nav-mes-reservations':'mes_reservations', 'nav-nouveautes':'nouveautes', 'nav-community':'community', 'nav-chat':'chat', 'nav-livrables':'livrables', 'nav-reclamations':'reclamations', 'nav-guidelines':'guidelines', 'nav-admin':'admin', 'nav-validations':'validations' };
  Object.entries(navMap).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) { const icon = el.querySelector('.nav-icon'); const badge = el.querySelector('.notif-badge, .nouv-badge'); el.innerHTML = (icon ? icon.outerHTML : '') + ' ' + t(key) + (badge ? badge.outerHTML : ''); }
  });
  const logoutBtn = document.getElementById('btn-logout'); if (logoutBtn) logoutBtn.textContent = t('logout');
  const sub = document.getElementById('topbar-sub'); if (sub) sub.textContent = t('topbar_sub');
  if (state.user) { const roleEl = document.getElementById('sidebar-role'); if (roleEl) roleEl.textContent = state.user.isAdmin ? t('profile_admin') : t('profile_user'); }
  const tabMap = { 'atab-overview':'📊 ' + t('overview'), 'atab-export':'⬇ ' + t('export_csv'), 'atab-history':'📋 ' + t('history'), 'atab-users':'👥 ' + t('users') };
  Object.entries(tabMap).forEach(([id, txt]) => { const el = document.getElementById(id); if (el) el.textContent = txt; });
}

function initLang() {
  const saved = localStorage.getItem('nexus_lang') || 'fr';
  currentLang = saved;
  document.getElementById('lang-fr')?.classList.toggle('active', saved === 'fr');
  document.getElementById('lang-en')?.classList.toggle('active', saved === 'en');
  if (saved !== 'fr') applyTranslations();
}

// ===================== ADMIN TABS =====================
function switchAdminTab(tab) {
  ['overview','export','history','users'].forEach(t => {
    const content = document.getElementById('admin-tab-' + t);
    const btn = document.getElementById('atab-' + t);
    if (content) content.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });
  if (tab === 'export') refreshExportStats();
  if (tab === 'history') renderActionLog();
  if (tab === 'users') renderUserManagement();
}

// ===================== CSV EXPORT =====================
function refreshExportStats() {
  const res = state.reservations;
  const el1 = document.getElementById('exp-total'); if (el1) el1.textContent = res.length;
  const el2 = document.getElementById('exp-approved'); if (el2) el2.textContent = res.filter(r=>r.status==='approved').length;
  const el3 = document.getElementById('exp-pending'); if (el3) el3.textContent = res.filter(r=>r.status==='confirmed').length;
}

function getFilteredForExport() {
  let res = [...state.reservations];
  const approvedOnly = document.getElementById('exp-approved-only')?.checked;
  const pendingOnly = document.getElementById('exp-pending-only')?.checked;
  const dateFrom = document.getElementById('exp-date-from')?.value;
  const dateTo = document.getElementById('exp-date-to')?.value;
  if (approvedOnly) res = res.filter(r=>r.status==='approved');
  else if (pendingOnly) res = res.filter(r=>r.status==='confirmed');
  if (dateFrom) res = res.filter(r=>r.date>=dateFrom);
  if (dateTo) res = res.filter(r=>r.date<=dateTo);
  return res;
}

function buildCSVContent(reservations) {
  const headers = ['Code','Stagiaire','Email','Projet','Département','Date','Début','Fin','Ressource','Matériels','Priorité','Statut'];
  const rows = reservations.map(r => {
    const statusLabel = r.status==='approved'?'Approuvée':r.status==='confirmed'?'En attente':r.status==='rejected'?'Rejetée':r.status;
    const priorityLabel = r.priority==='high'?'Haute':r.priority==='medium'?'Moyenne':'Basse';
    return [r.code,r.member,r.userEmail||'',r.project,r.department||'Intelligent Hardware',r.date,r.start,r.end,r.resource,(r.materials||[]).join(' | '),priorityLabel,statusLabel].map(v=>'"'+String(v||'').replace(/"/g,'""')+'"').join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

function exportCSV() {
  const res = getFilteredForExport();
  if (res.length === 0) { showToast('Aucune réservation à exporter', '⚠'); return; }
  const blob = new Blob(['\uFEFF' + buildCSVContent(res)], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'nexuslab_reservations_' + new Date().toISOString().slice(0,10) + '.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  logAction('export', '⬇ Export CSV', res.length + ' réservation(s)', '');
  showToast(res.length + ' réservations exportées ✅', '⬇');
}

function previewCSV() {
  const res = getFilteredForExport();
  const preview = document.getElementById('csv-preview');
  if (!preview) return;
  if (res.length === 0) { preview.style.display = 'block'; preview.textContent = 'Aucune donnée.'; return; }
  preview.style.display = 'block';
  preview.textContent = (res.length > 10 ? '(Aperçu 10/' + res.length + ')\n\n' : '') + buildCSVContent(res.slice(0, 10));
}

// ===================== ACTION LOG =====================
function getActionLog() { const s = localStorage.getItem('nexus_action_log'); return s ? JSON.parse(s) : []; }
function saveActionLog(log) { localStorage.setItem('nexus_action_log', JSON.stringify(log)); }

function logAction(type, title, sub, code) {
  const log = getActionLog();
  log.unshift({ id:Date.now(), type, title, sub, code, admin:state.user?.name||'Admin', time:new Date().toISOString() });
  if (log.length > 200) log.pop();
  saveActionLog(log);
}

function renderActionLog() {
  const log = getActionLog();
  const container = document.getElementById('action-log-list');
  if (!container) return;
  if (log.length === 0) { container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--dark-gray);">Aucune action enregistrée</div>'; return; }
  const iconMap = { approve:{icon:'✓',cls:'action-log-approve'}, reject:{icon:'✕',cls:'action-log-reject'}, create:{icon:'+',cls:'action-log-create'}, delete:{icon:'🗑',cls:'action-log-delete'}, export:{icon:'⬇',cls:'action-log-create'}, displace:{icon:'⚡',cls:'action-log-delete'} };
  container.innerHTML = log.map(item => {
    const m = iconMap[item.type] || {icon:'●',cls:'action-log-create'};
    const time = new Date(item.time).toLocaleString('fr-FR', {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
    return `<div class="action-log-item"><div class="action-log-icon ${m.cls}">${m.icon}</div><div class="action-log-body"><div class="action-log-title">${item.title}${item.code?` <span style="font-family:Rajdhani,sans-serif;color:var(--capgemini-blue);font-size:12px;">${item.code}</span>`:''}</div><div class="action-log-sub">${item.sub}</div><div class="action-log-time">Par ${item.admin} · ${time}</div></div></div>`;
  }).join('');
}

function clearActionLog() { if (!confirm('Vider le journal ?')) return; saveActionLog([]); renderActionLog(); showToast('Journal vidé', '🗑'); }

// ===================== USER MANAGEMENT =====================
function renderUserManagement() {
  const accounts = getAccounts();
  const search = (document.getElementById('user-search')?.value || '').toLowerCase();
  const filtered = search ? accounts.filter(a => a.name.toLowerCase().includes(search) || a.email.toLowerCase().includes(search)) : accounts;
  const disabled = JSON.parse(localStorage.getItem('nexus_disabled_users') || '[]');
  const el1 = document.getElementById('usr-total'); if (el1) el1.textContent = accounts.length;
  const el2 = document.getElementById('usr-admins'); if (el2) el2.textContent = accounts.filter(a=>a.isAdmin).length;
  const el3 = document.getElementById('usr-users'); if (el3) el3.textContent = accounts.filter(a=>!a.isAdmin).length;
  const el4 = document.getElementById('usr-disabled'); if (el4) el4.textContent = disabled.length;
  const container = document.getElementById('user-mgmt-list');
  if (!container) return;
  if (filtered.length === 0) { container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--dark-gray);">Aucun utilisateur trouvé</div>'; return; }
  container.innerHTML = filtered.map(acc => {
    const isDisabled = disabled.includes(acc.email);
    const initials = acc.initials || acc.name.slice(0,2).toUpperCase();
    const userRes = state.reservations.filter(r => r.userEmail === acc.email).length;
    const joined = acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('fr-FR') : '—';
    return `<div class="user-mgmt-row">
      <div class="user-avatar" style="background:${acc.isAdmin?'#FF9800':'var(--capgemini-blue)'};flex-shrink:0;">${initials}</div>
      <div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;${isDisabled?'text-decoration:line-through;color:var(--muted);':''}">${acc.name}</div><div style="font-size:12px;color:var(--dark-gray);">${acc.email}</div><div style="font-size:11px;color:var(--muted);margin-top:2px;">Inscrit le ${joined} · ${userRes} rés.</div></div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <span class="${acc.isAdmin?'mat-tag-pending':'mat-tag-avail'}" style="font-size:11px;">${acc.isAdmin?'⚙️ Admin':'👤 Stagiaire'}</span>
        <span class="${isDisabled?'user-status-disabled':'user-status-active'}">${isDisabled?'● Désactivé':'● Actif'}</span>
        <button class="btn-icon" style="font-size:11px;" onclick="toggleUserDisable('${acc.email}')">${isDisabled?'✓ Activer':'⛔ Désactiver'}</button>
        ${!acc.isAdmin?`<button class="btn-icon btn-danger-sm" style="font-size:11px;" onclick="deleteUserAccount('${acc.email}')">🗑</button>`:''}
      </div>
    </div>`;
  }).join('');
}

function toggleUserDisable(email) {
  const disabled = JSON.parse(localStorage.getItem('nexus_disabled_users') || '[]');
  const idx = disabled.indexOf(email);
  if (idx > -1) { disabled.splice(idx, 1); showToast('Compte réactivé', '✅'); logAction('create','✅ Compte réactivé',email,''); }
  else { disabled.push(email); showToast('Compte désactivé', '⛔'); logAction('delete','⛔ Compte désactivé',email,''); }
  localStorage.setItem('nexus_disabled_users', JSON.stringify(disabled));
  renderUserManagement();
}

function deleteUserAccount(email) {
  if (!confirm('Supprimer le compte ' + email + ' ?')) return;
  saveAccounts(getAccounts().filter(a => a.email !== email));
  logAction('delete','🗑 Compte supprimé',email,'');
  showToast('Compte supprimé', '🗑');
  renderUserManagement();
}

function filterAdminTable() {
  const q = (document.getElementById('admin-filter-input')?.value || '').toLowerCase();
  const status = document.getElementById('admin-filter-status')?.value || '';
  let res = state.reservations;
  if (status) res = res.filter(r=>r.status===status);
  if (q) res = res.filter(r=>r.member?.toLowerCase().includes(q)||r.project?.toLowerCase().includes(q)||r.code?.toLowerCase().includes(q));
  const tbody = document.getElementById('admin-tbody');
  if (!tbody) return;
  tbody.innerHTML = res.map(r => `<tr>
    <td><span style="font-family:'Rajdhani',sans-serif;color:var(--capgemini-blue);">${r.code}</span></td>
    <td>${r.member}</td><td>${r.project}</td>
    <td><span style="font-size:12px;color:var(--dark-gray);">Intelligent Hardware</span></td>
    <td>${new Date(r.date).toLocaleDateString('fr-FR')}</td><td>${r.start}–${r.end}</td>
    <td style="max-width:140px;">${r.materials?.length>0?`<div style="font-size:11px;color:var(--capgemini-blue);">${r.materials.slice(0,2).join(', ')}${r.materials.length>2?' +'+(r.materials.length-2):''}</div>`:'<span style="font-size:11px;color:var(--muted);">—</span>'}</td>
    <td>${priorityBadge(r.priority)}</td>
    <td><span class="status-badge ${r.status==='rejected'?'status-pending':r.status==='confirmed'?'status-ongoing':'status-done'}">${r.status==='confirmed'?'⏳ À valider':r.status==='approved'?'✓ Approuvée':'❌ Rejetée'}</span></td>
    <td>${r.status==='confirmed'?`<button class="btn-secondary" style="padding:5px 10px;font-size:11px;margin-right:4px;" onclick="updateReservationStatus('${r.code}','approved')">Valider</button><button class="btn-secondary" style="padding:5px 10px;font-size:11px;color:#FF5555;" onclick="updateReservationStatus('${r.code}','rejected')">Rejeter</button>`:`<span style="font-size:11px;color:var(--dark-gray);">Traitée</span>`}</td>
  </tr>`).join('');
}

// ===================== INIT =====================
window.onload = () => {
  state.reservations = getReservations();
  initDarkMode();
  initLang();
  document.getElementById('welcome-screen').style.display = 'flex';
  document.getElementById('create-account-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'none';

  // Key listeners
  ['create-email','create-password','create-confirm-password','create-admin-key'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doCreateAccount(); });
  });
  ['login-email','login-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });

  // Preload Chart.js
  if (typeof Chart === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    s.onload = () => { if (document.getElementById('screen-dashboard')?.classList.contains('active')) initPBICharts(); };
    document.head.appendChild(s);
  }
};
