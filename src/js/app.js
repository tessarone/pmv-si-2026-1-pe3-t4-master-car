// ─── MASTERCAR APP JS ───────────────────────────────────────────

// ── NAVEGACAO CENTRALIZADA ──
function navigate(page) {
  const pages = {
    'dashboard': 'dashboard.html',
    'reservas':  'reservas.html',
    'veiculos':  'veiculos.html',
    'clientes':  'clientes.html',
    'users':     'users.html',
    'login':     'login.html'
  };
  if (pages[page]) window.location.href = pages[page];
}

// ── TOAST ──
function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const colors = { info: 'var(--gray-900)', success: 'rgba(80,200,120,0.15)', error: 'rgba(255,80,80,0.15)' };
  toast.style.cssText = `background:${colors[type] || colors.info};border:1px solid var(--gray-800);color:var(--white);padding:12px 18px;border-radius:6px;font-size:.82rem;font-family:'Barlow Condensed',sans-serif;letter-spacing:.06em;`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── MODAL ──
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.display = 'flex'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.display = 'none'; }
}

////////////////////////////////////////////////
// VEÍCULOS
////////////////////////////////////////////////

const MC_SCHEMA_VERSION = '3';

function initAllData() {
  const stored = localStorage.getItem('mc_schema_version');
  if (stored !== MC_SCHEMA_VERSION) {
    Object.keys(localStorage)
      .filter(k => k.startsWith('mc_'))
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem('mc_schema_version', MC_SCHEMA_VERSION);
  }

  if (!localStorage.getItem('mc_veiculos')) {
    localStorage.setItem('mc_veiculos', JSON.stringify([
      { id: 1, nome: 'Toyota Corolla', placa: 'ABC-1234', ano: '2023', cor: 'Prata',  status: 'disponivel', _manualManut: false },
      { id: 2, nome: 'Honda Civic',    placa: 'HND-2022', ano: '2022', cor: 'Preto',  status: 'disponivel', _manualManut: false },
      { id: 3, nome: 'Fiat Argo',      placa: 'ARG-1010', ano: '2024', cor: 'Branco', status: 'disponivel', _manualManut: false },
      { id: 4, nome: 'VW Polo',        placa: 'POL-2024', ano: '2024', cor: 'Cinza',  status: 'disponivel', _manualManut: false }
    ]));
  }
  if (!localStorage.getItem('mc_clientes')) {
    localStorage.setItem('mc_clientes', JSON.stringify([
      { id: 1, nome: 'João Silva',    email: 'jsilva@email.com',  telefone: '(31) 99999-1111', cpf: '123.456.789-00', status: 'ativo'   },
      { id: 2, nome: 'Maria Santos',  email: 'msantos@email.com', telefone: '(31) 98888-2222', cpf: '987.654.321-00', status: 'ativo'   },
      { id: 3, nome: 'Carlos Mendes', email: 'cmendes@email.com', telefone: '(31) 97777-3333', cpf: '111.222.333-44', status: 'inativo' }
    ]));
  }
  if (!localStorage.getItem('mc_reservas')) {
    localStorage.setItem('mc_reservas', JSON.stringify([
      { id: 1, cliente: 'João Silva',    email: 'jsilva@email.com',  veiculo: 'Fiat Argo',      placa: 'ARG-1010', inicio: '2026-05-01', fim: '2026-05-08', status: 'ativa',     valor: 560 },
      { id: 2, cliente: 'Maria Santos',  email: 'msantos@email.com', veiculo: 'VW Polo',        placa: 'POL-2024', inicio: '2026-05-10', fim: '2026-05-15', status: 'pendente',  valor: 450 },
      { id: 3, cliente: 'Carlos Mendes', email: 'cmendes@email.com', veiculo: 'Toyota Corolla', placa: 'ABC-1234', inicio: '2026-04-20', fim: '2026-04-28', status: 'encerrada', valor: 720 }
    ]));
  }
}

function initFrota()    { initAllData(); }

function getVeiculos()  { return JSON.parse(localStorage.getItem('mc_veiculos')  || '[]'); }
function getClientes()  { return JSON.parse(localStorage.getItem('mc_clientes')  || '[]'); }
function getReservas()  { return JSON.parse(localStorage.getItem('mc_reservas')  || '[]'); }
function saveVeiculos(v){ localStorage.setItem('mc_veiculos', JSON.stringify(v)); }
function saveClientes(c){ localStorage.setItem('mc_clientes', JSON.stringify(c)); }
function saveReservas(r){ localStorage.setItem('mc_reservas', JSON.stringify(r)); }

// Reserva ativa SEMPRE ganha -> 'locado'.
// Sem reserva ativa: respeita _manualManut === true → 'manutencao'; senão 'disponivel'.
function syncVeiculoStatus() {
  const reservas = getReservas();
  const placasAtivas = new Set(
    reservas.filter(r => r.status === 'ativa').map(r => (r.placa || '').toUpperCase())
  );
  const veiculos = getVeiculos().map(v => {
    if (placasAtivas.has((v.placa || '').toUpperCase())) return { ...v, status: 'locado' };
    if (v._manualManut === true)                         return { ...v, status: 'manutencao' };
    return { ...v, status: 'disponivel' };
  });
  saveVeiculos(veiculos);
}

function renderVehicleTable() {}

function _legacyRenderVehicleTable_DO_NOT_USE() {
  const tbody = document.getElementById('vehicleTableBody');
  if (!tbody) return;
  const veiculos = JSON.parse(localStorage.getItem('mc_veiculos')) || [];
  tbody.innerHTML = veiculos.map(v => `
    <tr>
      <td>
        <div style="font-weight:600;color:var(--white);">${v.nome}</div>
        <div style="font-size:.75rem;color:var(--gray-500);text-transform:uppercase;">${v.placa}</div>
      </td>
      <td style="color:var(--gray-300);">${v.ano}</td>
      <td style="color:var(--gray-300);">${v.cor}</td>
      <td>
        <select class="status-select-custom" onchange="updateVehicleStatus(${v.id}, this.value)">
          <option value="disponivel" ${v.status === 'disponivel' ? 'selected' : ''}>Disponível</option>
          <option value="locado"     ${v.status === 'locado'     ? 'selected' : ''}>Locado</option>
          <option value="manutencao" ${v.status === 'manutencao' ? 'selected' : ''}>Manutenção</option>
        </select>
      </td>
      <td>
        <button class="action-btn delete" onclick="removeVehicle(${v.id})">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          Excluir
        </button>
      </td>
    </tr>
  `).join('');
}

function updateVehicleStatus(id, newStatus) {
  let veiculos = JSON.parse(localStorage.getItem('mc_veiculos')) || [];
  veiculos = veiculos.map(v => v.id == id ? { ...v, status: newStatus } : v);
  localStorage.setItem('mc_veiculos', JSON.stringify(veiculos));
  updateDashboardStats();
}

function removeVehicle(id) {
  if (confirm("Tem certeza que deseja remover este veículo?")) {
    let veiculos = JSON.parse(localStorage.getItem('mc_veiculos')) || [];
    veiculos = veiculos.filter(v => v.id != id);
    localStorage.setItem('mc_veiculos', JSON.stringify(veiculos));
    renderVehicleTable();
    showToast('Veículo removido.', 'info');
  }
}

function handleSaveVehicle(e) {
  e.preventDefault();
  const novo = {
    id: Date.now(),
    nome:  document.getElementById('v_nome').value,
    placa: document.getElementById('v_placa').value,
    ano:   document.getElementById('v_ano').value,
    cor:   document.getElementById('v_cor').value,
    status: 'disponivel'
  };
  let veiculos = JSON.parse(localStorage.getItem('mc_veiculos')) || [];
  veiculos.push(novo);
  localStorage.setItem('mc_veiculos', JSON.stringify(veiculos));
  closeModal('vehicleModal');
  renderVehicleTable();
  e.target.reset();
  showToast('Veículo cadastrado!', 'success');
}

// ── ATUALIZA DASHBOARD ──
function updateDashboardStats() {
  const veiculos    = JSON.parse(localStorage.getItem('mc_veiculos'))  || [];
  const reservas    = JSON.parse(localStorage.getItem('mc_reservas'))  || [];
  const locados     = veiculos.filter(v => v.status === 'locado').length;
  const manutencao  = veiculos.filter(v => v.status === 'manutencao').length;
  const disponiveis = veiculos.filter(v => v.status === 'disponivel').length;
  const total       = veiculos.length;
  const ativas      = reservas.filter(r => r.status === 'ativa').length;

  const kpiValues = document.querySelectorAll('.kpi-value');
  if (kpiValues.length >= 4) {
    kpiValues[0].textContent = disponiveis;
    kpiValues[1].textContent = locados;
    kpiValues[2].textContent = manutencao;
    kpiValues[3].textContent = ativas;
  }

  const donutCenter = document.querySelector('.donut-center-value');
  if (donutCenter) donutCenter.textContent = total;

  const legendValues = document.querySelectorAll('.donut-legend-value');
  if (legendValues.length >= 3) {
    legendValues[0].textContent = locados;
    legendValues[1].textContent = manutencao;
    legendValues[2].textContent = disponiveis;
  }

  renderDashboardReservas();
}

function renderDashboardReservas() {
  const tbody = document.getElementById('recentReservasTbody');
  if (!tbody) return;
  const reservas = JSON.parse(localStorage.getItem('mc_reservas')) || [];
  const recentes = reservas.slice(-5).reverse();
  if (recentes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--gray-600);padding:20px;">Nenhuma reserva registrada</td></tr>';
    return;
  }
  tbody.innerHTML = recentes.map(r => {
    const badgeClass = r.status === 'ativa' ? 'badge-green' : r.status === 'pendente' ? 'badge-yellow' : 'badge-gray';
    const badgeLabel = r.status === 'ativa' ? 'Ativa' : r.status === 'pendente' ? 'Pendente' : 'Encerrada';
    return `<tr>
      <td><strong>${r.cliente}</strong><br><small style="color:var(--gray-600);">${r.email||''}</small></td>
      <td>${r.veiculo}</td>
      <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
    </tr>`;
  }).join('');
}

////////////////////////////////////////////////
// CLIENTES
////////////////////////////////////////////////

function initClientes() { initAllData(); }

function renderClientesTable(filter) {
  const tbody = document.getElementById('clientesTableBody');
  if (!tbody) return;
  let clientes = JSON.parse(localStorage.getItem('mc_clientes')) || [];
  if (filter) {
    const f = filter.toLowerCase();
    clientes = clientes.filter(c =>
      c.nome.toLowerCase().includes(f) ||
      c.email.toLowerCase().includes(f) ||
      (c.cpf && c.cpf.includes(f))
    );
  }
  if (clientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--gray-600);padding:24px;">Nenhum cliente encontrado</td></tr>';
    return;
  }
  tbody.innerHTML = clientes.map(c => {
    const initials = c.nome.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
    const badgeClass = c.status === 'ativo' ? 'badge-green' : 'badge-yellow';
    const badgeLabel = c.status === 'ativo' ? 'Ativo' : 'Inativo';
    return `<tr>
      <td>
        <div class="user-cell">
          <div class="user-cell-avatar">${initials}</div>
          <div>
            <div class="user-cell-name">${c.nome}</div>
            <div class="user-cell-email">${c.email}</div>
          </div>
        </div>
      </td>
      <td style="color:var(--gray-300);font-size:.82rem;">${c.cpf}</td>
      <td style="color:var(--gray-300);font-size:.82rem;">${c.telefone}</td>
      <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
      <td>
        <div class="actions-cell">
          <button class="action-btn" title="Editar" onclick="openEditCliente(${c.id})">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button class="action-btn delete" title="Remover" onclick="removeCliente(${c.id})">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function handleSaveCliente(e) {
  e.preventDefault();
  const modal = document.getElementById('clienteModal');
  const editId = modal ? modal.dataset.editId : null;
  const cliente = {
    id:       editId ? parseInt(editId) : Date.now(),
    nome:     document.getElementById('c_nome').value,
    email:    document.getElementById('c_email').value,
    telefone: document.getElementById('c_telefone').value,
    cpf:      document.getElementById('c_cpf').value,
    status:   document.getElementById('c_status').value,
    reservas: 0
  };
  let clientes = JSON.parse(localStorage.getItem('mc_clientes')) || [];
  if (editId) {
    clientes = clientes.map(c => c.id == editId ? { ...c, ...cliente } : c);
    showToast('Cliente atualizado!', 'success');
  } else {
    clientes.push(cliente);
    showToast('Cliente cadastrado!', 'success');
  }
  localStorage.setItem('mc_clientes', JSON.stringify(clientes));
  closeModal('clienteModal');
  renderClientesTable();
  e.target.reset();
  if (modal) delete modal.dataset.editId;
  document.querySelector('#clienteModal .modal-title').textContent = 'Novo Cliente';
}

function openEditCliente(id) {
  const clientes = JSON.parse(localStorage.getItem('mc_clientes')) || [];
  const c = clientes.find(x => x.id == id);
  if (!c) return;
  document.getElementById('c_nome').value     = c.nome;
  document.getElementById('c_email').value    = c.email;
  document.getElementById('c_telefone').value = c.telefone;
  document.getElementById('c_cpf').value      = c.cpf;
  document.getElementById('c_status').value   = c.status;
  const modal = document.getElementById('clienteModal');
  modal.dataset.editId = id;
  document.querySelector('#clienteModal .modal-title').textContent = 'Editar Cliente';
  openModal('clienteModal');
}

function removeCliente(id) {
  if (confirm("Deseja remover este cliente?")) {
    let clientes = JSON.parse(localStorage.getItem('mc_clientes')) || [];
    clientes = clientes.filter(c => c.id != id);
    localStorage.setItem('mc_clientes', JSON.stringify(clientes));
    renderClientesTable();
    showToast('Cliente removido.', 'info');
  }
}

////////////////////////////////////////////////
// RESERVAS
////////////////////////////////////////////////

function initReservas() { initAllData(); }

function renderReservasTable(filter, statusFilter) {
  const tbody = document.getElementById('reservasTableBody');
  if (!tbody) return;
  let reservas = JSON.parse(localStorage.getItem('mc_reservas')) || [];
  if (filter) {
    const f = filter.toLowerCase();
    reservas = reservas.filter(r =>
      r.cliente.toLowerCase().includes(f) ||
      r.veiculo.toLowerCase().includes(f) ||
      r.placa.toLowerCase().includes(f)
    );
  }
  if (statusFilter) reservas = reservas.filter(r => r.status === statusFilter);

  if (reservas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--gray-600);padding:24px;">Nenhuma reserva encontrada</td></tr>';
    return;
  }
  const fmtDate = d => { try { const [y,m,dd] = d.split('-'); return `${dd}/${m}/${y}`; } catch(e) { return d; } };
  tbody.innerHTML = reservas.map(r => {
    const badgeClass = r.status === 'ativa' ? 'badge-green' : r.status === 'pendente' ? 'badge-yellow' : 'badge-gray';
    const badgeLabel = r.status === 'ativa' ? 'Ativa' : r.status === 'pendente' ? 'Pendente' : 'Encerrada';
    return `<tr>
      <td>
        <div style="font-weight:600;color:var(--white);">${r.cliente}</div>
        <div style="font-size:.75rem;color:var(--gray-500);">${r.email}</div>
      </td>
      <td>
        <div style="color:var(--gray-200);">${r.veiculo}</div>
        <div style="font-size:.73rem;color:var(--gray-600);text-transform:uppercase;">${r.placa}</div>
      </td>
      <td style="color:var(--gray-300);font-size:.82rem;">${fmtDate(r.inicio)}</td>
      <td style="color:var(--gray-300);font-size:.82rem;">${fmtDate(r.fim)}</td>
      <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
      <td>
        <div class="actions-cell">
          <button class="action-btn" title="Editar" onclick="openEditReserva(${r.id})">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button class="action-btn delete" title="Remover" onclick="removeReserva(${r.id})">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function handleSaveReserva(e) {
  e.preventDefault();
  const modal = document.getElementById('reservaModal');
  const editId = modal ? modal.dataset.editId : null;
  const clienteSel = document.getElementById('r_cliente_sel');
  const nomeCliente = clienteSel ? clienteSel.value || document.getElementById('r_cliente').value : document.getElementById('r_cliente').value;
  const reserva = {
    id:      editId ? parseInt(editId) : Date.now(),
    cliente: nomeCliente,
    email:   document.getElementById('r_email').value,
    veiculo: document.getElementById('r_veiculo').value,
    placa:   document.getElementById('r_placa').value,
    inicio:  document.getElementById('r_inicio').value,
    fim:     document.getElementById('r_fim').value,
    status:  document.getElementById('r_status').value,
    valor:   parseFloat(document.getElementById('r_valor').value) || 0
  };
  let reservas = JSON.parse(localStorage.getItem('mc_reservas')) || [];
  if (editId) {
    reservas = reservas.map(r => r.id == editId ? { ...r, ...reserva } : r);
    showToast('Reserva atualizada!', 'success');
  } else {
    reservas.push(reserva);
    showToast('Reserva criada!', 'success');
  }
  localStorage.setItem('mc_reservas', JSON.stringify(reservas));
  if (typeof syncStatusFromReservas === 'function') syncStatusFromReservas();
  closeModal('reservaModal');
  renderReservasTable();
  e.target.reset();
  if (modal) delete modal.dataset.editId;
  document.querySelector('#reservaModal .modal-title').textContent = 'Nova Reserva';
}

function openEditReserva(id) {
  const reservas = JSON.parse(localStorage.getItem('mc_reservas')) || [];
  const r = reservas.find(x => x.id == id);
  if (!r) return;
  const clienteSel = document.getElementById('r_cliente_sel');
  if (clienteSel) clienteSel.value = r.cliente;
  const clienteInput = document.getElementById('r_cliente');
  if (clienteInput) clienteInput.value = r.cliente;
  document.getElementById('r_email').value   = r.email;
  document.getElementById('r_veiculo').value = r.veiculo;
  document.getElementById('r_placa').value   = r.placa;
  document.getElementById('r_inicio').value  = r.inicio;
  document.getElementById('r_fim').value     = r.fim;
  document.getElementById('r_status').value  = r.status;
  document.getElementById('r_valor').value   = r.valor;
  const modal = document.getElementById('reservaModal');
  modal.dataset.editId = id;
  document.querySelector('#reservaModal .modal-title').textContent = 'Editar Reserva';
  openModal('reservaModal');
}

function removeReserva(id) {
  if (confirm("Deseja remover esta reserva?")) {
    let reservas = JSON.parse(localStorage.getItem('mc_reservas')) || [];
    reservas = reservas.filter(r => r.id != id);
    localStorage.setItem('mc_reservas', JSON.stringify(reservas));
    if (typeof syncStatusFromReservas === 'function') syncStatusFromReservas();
    renderReservasTable();
    showToast('Reserva removida.', 'info');
  }
}

function populateVeiculoSelect() {
  const sel = document.getElementById('r_veiculo');
  if (!sel) return;
  const veiculos = JSON.parse(localStorage.getItem('mc_veiculos')) || [];
  sel.innerHTML = '<option value="">Selecionar veículo</option>' +
    veiculos.map(v => `<option value="${v.nome}" data-placa="${v.placa}">${v.nome} — ${v.placa}</option>`).join('');
  sel.onchange = function() {
    const opt = this.options[this.selectedIndex];
    const placaInput = document.getElementById('r_placa');
    if (placaInput && opt.dataset.placa) placaInput.value = opt.dataset.placa;
  };
}

function populateClienteSelect() {
  const sel = document.getElementById('r_cliente_sel');
  if (!sel) return;
  const clientes = JSON.parse(localStorage.getItem('mc_clientes')) || [];
  sel.innerHTML = '<option value="">Selecionar cliente</option>' +
    clientes.map(c => `<option value="${c.nome}" data-email="${c.email}">${c.nome}</option>`).join('');
  sel.onchange = function() {
    const opt = this.options[this.selectedIndex];
    const clienteInput = document.getElementById('r_cliente');
    const emailInput   = document.getElementById('r_email');
    if (clienteInput) clienteInput.value = opt.value;
    if (emailInput && opt.dataset.email) emailInput.value = opt.dataset.email;
  };
}
