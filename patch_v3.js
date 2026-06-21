/**
 * ============================================================
 *  OFICINA APP — PATCH V3
 *  Fase 1: Correções de bugs urgentes
 *  Fase 2: Melhorias de UX e formulários
 *
 *  COMO USAR:
 *  1. Salve este arquivo como "patch_v3.js" na mesma pasta
 *     que o seu oficina.html
 *  2. Adicione esta linha ANTES de </body> em oficina.html:
 *       <script src="patch_v3.js"></script>
 * ============================================================
 */
(function () {
  'use strict';

  // ============================================================
  // § 1 — CSS ADICIONAIS
  // ============================================================
  function injetarCSS() {
    if (document.getElementById('patch-v3-css')) return;
    const style = document.createElement('style');
    style.id = 'patch-v3-css';
    style.textContent = `
      /* Novos status de OS */
      .os-card.status-aguardando { border-left-color: #F59E0B; }
      .os-card.status-reprovado  { border-left-color: #EF4444; }
      .badge-amber { background:#FEF3C7; color:#B45309; }

      /* Gráfico de pizza */
      .pie-chart-wrap { display:flex; align-items:center; gap:20px; padding:16px 20px; flex-wrap:wrap; }
      .pie-svg { flex-shrink:0; }
      .pie-legend { display:flex; flex-direction:column; gap:8px; flex:1; min-width:140px; }
      .pie-legend-item { display:flex; align-items:center; gap:8px; font-size:0.78rem; }
      .pie-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
      .pie-pct { margin-left:auto; font-weight:700; color:var(--text-muted); }

      /* Financeiro - busca */
      .fin-search-bar { display:flex; gap:10px; margin-bottom:4px; flex-wrap:wrap; padding:16px 20px 0; }
      .fin-search-bar input, .fin-search-bar select {
        padding:8px 12px; border:1.5px solid var(--border); border-radius:8px;
        background:var(--surface2); color:var(--text);
        font-family:'Inter',sans-serif; font-size:0.875rem; outline:none;
      }
      .fin-search-bar input:focus, .fin-search-bar select:focus { border-color:var(--accent); }

      /* Pagamento na OS */
      .os-payment-section { border-top:1.5px solid var(--border); padding-top:16px; margin-top:12px; }

      /* Status de revisão */
      .rev-ok    { color:#059669; font-weight:700; font-size:0.8rem; }
      .rev-warn  { color:#B45309; font-weight:700; font-size:0.8rem; }
      .rev-alert { color:#EF4444; font-weight:700; font-size:0.8rem; }

      /* Plano lock */
      .lock-badge {
        display:inline-flex; align-items:center; gap:4px;
        font-size:0.7rem; font-weight:700;
        background:var(--amber-bg); color:#B45309;
        border:1px solid var(--amber); border-radius:20px;
        padding:2px 8px; margin-left:8px;
      }

      @media (max-width:640px) {
        .fin-search-bar { flex-direction:column; }
        .fin-search-bar input, .fin-search-bar select { width:100%; }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // § 2 — NOME DINÂMICO DA OFICINA
  // ============================================================
  window.getNomeOficina = function () {
    const saved = localStorage.getItem('oleo_cfg_nome');
    if (saved && saved.trim()) return saved.trim();
    if (window.infoOficinaAtual?.oficina?.nome) return window.infoOficinaAtual.oficina.nome;
    return 'Coloque o nome da sua oficina aqui';
  };

  function atualizarNomeOficina() {
    const nome = window.getNomeOficina();
    // Sidebar logo
    const logoName = document.querySelector('.logo-name');
    if (logoName) {
      const small = logoName.querySelector('small');
      logoName.textContent = nome + ' ';
      if (small) logoName.appendChild(small);
    }
    // Avatar com iniciais do mecânico
    const avatarBtn = document.querySelector('.avatar-btn');
    if (avatarBtn && window.mecanicoLogado) {
      const iniciais = (window.mecanicoLogado.nome || window.mecanicoLogado.usuario || 'M')
        .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      avatarBtn.textContent = iniciais;
      avatarBtn.title = window.mecanicoLogado.nome || window.mecanicoLogado.usuario;
    }
    // Login screen
    const loginNome = document.getElementById('loginOficinaNome');
    if (loginNome) loginNome.textContent = nome;
    // Config input (só se não foi tocado)
    const cfgInput = document.getElementById('cfgNomeOficina');
    if (cfgInput && !cfgInput.dataset.touched) cfgInput.value = nome;
  }

  // ============================================================
  // § 3 — STATUS MAP COMPLETO
  // ============================================================
  window.statusMap = {
    'Orçamento':       { cls: 'status-orcamento',  badge: 'badge-gray'   },
    'Aprovado':        { cls: 'status-aprovado',   badge: 'badge-blue'   },
    'Em andamento':    { cls: 'status-andamento',  badge: 'badge-yellow' },
    'Aguardando Peça': { cls: 'status-aguardando', badge: 'badge-amber'  },
    'Pronto':          { cls: 'status-pronto',     badge: 'badge-green'  },
    'Entregue':        { cls: 'status-entregue',   badge: 'badge-gray'   },
    'Reprovado':       { cls: 'status-reprovado',  badge: 'badge-red'    },
  };

  // ============================================================
  // § 4 — PATCH DO HTML
  // ============================================================
  function patchHTML() {
    // Select de status da OS
    const selStatus = document.getElementById('os-status');
    if (selStatus) {
      selStatus.innerHTML = `
        <option value="Orçamento">Orçamento</option>
        <option value="Aprovado">Aprovado</option>
        <option value="Em andamento">Em andamento</option>
        <option value="Aguardando Peça">Aguardando Peça</option>
        <option value="Pronto">Pronto</option>
        <option value="Entregue">Entregue</option>
        <option value="Reprovado">Reprovado</option>
      `;
    }

    // Barra de filtros de status
    const statusBar = document.getElementById('osStatusBar');
    if (statusBar) {
      statusBar.innerHTML = `
        <button class="status-filter active" onclick="filtroStatus('todos',this)">Todas</button>
        <button class="status-filter" onclick="filtroStatus('Orçamento',this)">💬 Orçamento</button>
        <button class="status-filter" onclick="filtroStatus('Aprovado',this)">✅ Aprovado</button>
        <button class="status-filter" onclick="filtroStatus('Em andamento',this)">⚙️ Em andamento</button>
        <button class="status-filter" onclick="filtroStatus('Aguardando Peça',this)">⏳ Ag. Peça</button>
        <button class="status-filter" onclick="filtroStatus('Pronto',this)">🟢 Pronto</button>
        <button class="status-filter" onclick="filtroStatus('Entregue',this)">📦 Entregue</button>
        <button class="status-filter" onclick="filtroStatus('Reprovado',this)">❌ Reprovado</button>
      `;
    }

    // Busca de veículos (estava sem oninput)
    const veiculoSearch = document.querySelector('#page-veiculos .search-box input');
    if (veiculoSearch) {
      veiculoSearch.placeholder = 'Buscar por placa, modelo ou proprietário...';
      veiculoSearch.oninput = e => window.filtrarVeiculos(e.target.value);
    }

    // Auto-fill de revisão
    const ultKmEl   = document.getElementById('vei-ultrev');
    const ultDataEl = document.getElementById('vei-ultrev-data');
    if (ultKmEl)   ultKmEl.addEventListener('input',  window.autoFillRevisao);
    if (ultDataEl) ultDataEl.addEventListener('change', window.autoFillRevisao);

    // Marcar config input para não sobrescrever digitação manual
    const cfgInput = document.getElementById('cfgNomeOficina');
    if (cfgInput) {
      cfgInput.addEventListener('input', () => { cfgInput.dataset.touched = '1'; });
    }

    // Expandir thead de veículos
    atualizarTabelaVeiculos();

    // Expandir formulário de equipe
    expandirFormEquipe();

    // Adicionar busca no financeiro
    expandirFinanceiro();

    // Adicionar container do gráfico no dashboard
    adicionarContainerGrafico();
  }

  // ============================================================
  // § 5 — AUTO-FILL PRÓXIMA REVISÃO
  // ============================================================
  window.autoFillRevisao = function () {
    const ultKm    = parseInt(document.getElementById('vei-ultrev')?.value || '0');
    const ultData  = document.getElementById('vei-ultrev-data')?.value;
    const proxKmEl = document.getElementById('vei-proxrev');
    const proxDtEl = document.getElementById('vei-proxrev-data');
    if (!proxKmEl || !proxDtEl) return;

    if (!proxKmEl.value && ultKm > 0)
      proxKmEl.value = ultKm + 10000;

    if (!proxDtEl.value && ultData) {
      try {
        const d = new Date(ultData + 'T12:00');
        d.setFullYear(d.getFullYear() + 1);
        proxDtEl.value = d.toISOString().split('T')[0];
      } catch (e) {}
    }
  };

  // ============================================================
  // § 6 — VALIDAÇÃO CPF + NOME DUPLICADO
  // ============================================================
  const _salvarClienteOrig = window.salvarCliente;
  window.salvarCliente = async function () {
    const nome = document.getElementById('cli-nome').value.trim();
    const tel  = document.getElementById('cli-tel').value.trim();
    const cpf  = (document.getElementById('cli-cpf').value || '').replace(/\D/g, '');

    if (!nome || !tel) { window.toast('Preencha nome e telefone', '⚠️'); return; }

    if (cpf.length === 11) {
      const dupCPF = (window.clientes || []).find((c, i) =>
        (c.cpf || '').replace(/\D/g, '') === cpf && i !== window.editingClienteIdx
      );
      if (dupCPF) { window.toast(`CPF já cadastrado para "${dupCPF.nome}" ⚠️`, '⚠️'); return; }
    }

    const dupNome = (window.clientes || []).find((c, i) =>
      c.nome.trim().toLowerCase() === nome.toLowerCase() && i !== window.editingClienteIdx
    );
    if (dupNome) {
      const ok = confirm(`Já existe um cliente com o nome "${dupNome.nome}".\nDeseja cadastrar mesmo assim?`);
      if (!ok) return;
    }

    return _salvarClienteOrig();
  };

  // ============================================================
  // § 7 — openNovaOS: status padrão = Orçamento
  // ============================================================
  const _openNovaOSOrig = window.openNovaOS;
  window.openNovaOS = function () {
    _openNovaOSOrig();
    const sel = document.getElementById('os-status');
    if (sel) sel.value = 'Orçamento';
    setTimeout(garantirCampoAdiantamento, 200);
  };

  // ============================================================
  // § 8 — CAMPO DE ADIANTAMENTO NA OS
  // ============================================================
  function garantirCampoAdiantamento() {
    const obsPanel = document.getElementById('os-obs');
    if (!obsPanel || obsPanel.querySelector('#os-adiantamento')) return;
    obsPanel.insertAdjacentHTML('beforeend', `
      <div class="os-payment-section">
        <div class="section-divider">Pagamento</div>
        <div class="form-grid cols-3">
          <div class="form-group">
            <label>Adiantamento (R$)</label>
            <input type="number" id="os-adiantamento" placeholder="0,00" step="0.01" min="0">
          </div>
          <div class="form-group">
            <label>Data do pagamento</label>
            <input type="date" id="os-data-pagamento">
          </div>
          <div class="form-group">
            <label>Forma de pagamento</label>
            <select id="os-forma-pgto">
              <option value="">Não informado</option>
              <option>Pix</option>
              <option>Dinheiro</option>
              <option>Cartão débito</option>
              <option>Cartão crédito</option>
              <option>Boleto</option>
            </select>
          </div>
        </div>
      </div>
    `);
  }

  // ============================================================
  // § 9 — editarOS: restaurar adiantamento
  // ============================================================
  const _editarOSOrig = window.editarOS;
  window.editarOS = function (id) {
    _editarOSOrig(id);
    setTimeout(() => {
      garantirCampoAdiantamento();
      const idx = (window.ordens || []).findIndex(o => String(o.id) === String(id));
      if (idx < 0) return;
      const os = window.ordens[idx];
      const adEl = document.getElementById('os-adiantamento');
      const dtEl = document.getElementById('os-data-pagamento');
      const fmEl = document.getElementById('os-forma-pgto');
      if (adEl) adEl.value = os.adiantamento || '';
      if (dtEl) dtEl.value = os.dataPagamento || '';
      if (fmEl) fmEl.value = os.formaPagamento || '';
    }, 220);
  };

  // ============================================================
  // § 10 — salvarOS: salvar adiantamento
  // ============================================================
  const _salvarOSOrig = window.salvarOS;
  window.salvarOS = function () {
    window._pgto = {
      adiantamento:   parseFloat(document.getElementById('os-adiantamento')?.value) || 0,
      dataPagamento:  document.getElementById('os-data-pagamento')?.value || '',
      formaPagamento: document.getElementById('os-forma-pgto')?.value || '',
    };
    _salvarOSOrig();
  };

  const _enviarOrdemOrig = window.enviarOrdemNuvem;
  window.enviarOrdemNuvem = async function (os) {
    if (window._pgto) {
      Object.assign(os, window._pgto);
      // Persistir localmente também
      const idx = (window.ordens || []).findIndex(o => String(o.id) === String(os.id));
      if (idx >= 0) {
        Object.assign(window.ordens[idx], window._pgto);
        localStorage.setItem('oleo_os', JSON.stringify(window.ordens));
      }
      window._pgto = null;
    }
    return _enviarOrdemOrig(os);
  };

  // ============================================================
  // § 11 — BUSCA/FILTRO DE VEÍCULOS
  // ============================================================
  window.filtrarVeiculos = function (q) {
    const lista = (window.clientes || []).filter(c => {
      if (!c.veiculo?.placa) return false;
      if (!q) return true;
      const ql = q.toLowerCase();
      return (
        c.veiculo.placa.toLowerCase().includes(ql) ||
        (c.veiculo.modelo || '').toLowerCase().includes(ql) ||
        (c.veiculo.marca  || '').toLowerCase().includes(ql) ||
        c.nome.toLowerCase().includes(ql)
      );
    });
    renderVeiculosList(lista);
  };

  // ============================================================
  // § 12 — renderVeiculos COM ORDENAÇÃO POR REVISÃO
  // ============================================================
  function scoreRevisao(c) {
    const v = c.veiculo || {};
    const kmAt = parseInt(v.km || 0);
    const pKm  = parseInt(v.proxRev || 0);
    const pDt  = v.proxRevData ? new Date(v.proxRevData + 'T12:00') : null;
    const dKm  = pKm > 0 ? pKm - kmAt : 99999;
    const dDias = pDt ? Math.floor((pDt - new Date()) / 86400000) : 99999;
    return Math.min(dKm, dDias * 20);
  }

  function renderVeiculosList(lista) {
    const tb = document.getElementById('veiculosTbody');
    if (!tb) return;
    if (!lista.length) {
      tb.innerHTML = `<tr><td colspan="9"><div class="empty-state">
        <div class="empty-icon">🚗</div>
        <h3>Nenhum veículo encontrado</h3>
        <p>Veículos são adicionados ao cadastrar um cliente</p>
      </div></td></tr>`;
      return;
    }

    const sorted = [...lista].sort((a, b) => scoreRevisao(a) - scoreRevisao(b));
    const hoje = new Date();

    tb.innerHTML = sorted.map(c => {
      const v    = c.veiculo;
      const nOS  = (window.ordens || []).filter(o => o.clienteId === c.id).length;
      const kmAt = parseInt(v.km || 0);
      const pKm  = parseInt(v.proxRev || 0);
      const pDt  = v.proxRevData ? new Date(v.proxRevData + 'T12:00') : null;

      let revCls = '', revTxt = '—';
      if (pKm > 0 && kmAt > 0) {
        const d = pKm - kmAt;
        if (d <= 0)      { revCls = 'rev-alert'; revTxt = `⚠️ Vencida ${Math.abs(d).toLocaleString('pt-BR')} km`; }
        else if (d <= 1000) { revCls = 'rev-warn';  revTxt = `⏳ ${d.toLocaleString('pt-BR')} km restantes`; }
        else             { revCls = 'rev-ok';   revTxt = `✅ ${d.toLocaleString('pt-BR')} km restantes`; }
      } else if (pDt) {
        const dias = Math.floor((pDt - hoje) / 86400000);
        if (dias < 0)      { revCls = 'rev-alert'; revTxt = `⚠️ Data vencida`; }
        else if (dias <= 30)  { revCls = 'rev-warn';  revTxt = `⏳ ${dias} dias`; }
        else               { revCls = 'rev-ok';   revTxt = `✅ ${dias} dias`; }
      }

      const ultStr = v.ultRevData
        ? new Date(v.ultRevData + 'T12:00').toLocaleDateString('pt-BR')
        : (v.ultRev ? `${Number(v.ultRev).toLocaleString('pt-BR')} km` : '—');

      const proxStr = pDt
        ? pDt.toLocaleDateString('pt-BR')
        : (pKm ? `${pKm.toLocaleString('pt-BR')} km` : '—');

      return `<tr>
        <td><strong>${v.placa}</strong></td>
        <td>${v.marca || ''} ${v.modelo || ''}</td>
        <td>${v.ano || '—'}</td>
        <td>${v.km ? Number(v.km).toLocaleString('pt-BR') + ' km' : '—'}</td>
        <td>${c.nome}</td>
        <td>${ultStr}</td>
        <td>${proxStr}</td>
        <td class="${revCls}">${revTxt}</td>
        <td><span class="badge badge-blue">${nOS}</span></td>
      </tr>`;
    }).join('');
  }

  function atualizarTabelaVeiculos() {
    const thead = document.querySelector('#page-veiculos table thead tr');
    if (thead && !thead.dataset.patched) {
      thead.dataset.patched = '1';
      thead.innerHTML = `
        <th>Placa</th><th>Veículo</th><th>Ano</th><th>Km atual</th>
        <th>Proprietário</th>
        <th>Última revisão</th>
        <th>Próxima revisão</th>
        <th>Status revisão</th>
        <th>OS</th>
      `;
    }
  }

  window.renderVeiculos = function () {
    atualizarTabelaVeiculos();
    renderVeiculosList((window.clientes || []).filter(c => c.veiculo?.placa));
  };

  // ============================================================
  // § 13 — FORMULÁRIO DE EQUIPE EXPANDIDO
  // ============================================================
  function expandirFormEquipe() {
    const grid = document.querySelector('#page-equipe .form-grid');
    if (!grid || grid.querySelector('#eq-cpf')) return;
    grid.insertAdjacentHTML('beforeend', `
      <div class="form-group">
        <label>CPF</label>
        <input type="text" id="eq-cpf" placeholder="000.000.000-00" oninput="maskCPF(this)">
      </div>
      <div class="form-group">
        <label>Telefone</label>
        <input type="text" id="eq-tel" placeholder="(xx) xxxxx-xxxx" oninput="maskPhone(this)">
      </div>
      <div class="form-group span2">
        <label>Endereço completo</label>
        <input type="text" id="eq-end" placeholder="Rua, número, bairro, cidade">
      </div>
      <div class="form-group">
        <label>Horário de entrada</label>
        <input type="time" id="eq-entrada" value="08:00">
      </div>
      <div class="form-group">
        <label>Horário de saída</label>
        <input type="time" id="eq-saida" value="17:00">
      </div>
    `);
  }

  const _adicionarMecanicoOrig = window.adicionarMecanico;
  window.adicionarMecanico = async function () {
    const usuario = document.getElementById('eq-usuario').value.trim();
    const senha   = document.getElementById('eq-senha').value;
    const nome    = document.getElementById('eq-nome').value.trim();
    if (!usuario || !senha) { window.toast('Preencha usuário e senha', '⚠️'); return; }

    const dados = {
      usuario, senha, nome,
      cpf:            document.getElementById('eq-cpf')?.value || '',
      tel:            document.getElementById('eq-tel')?.value || '',
      end:            document.getElementById('eq-end')?.value || '',
      horarioEntrada: document.getElementById('eq-entrada')?.value || '08:00',
      horarioSaida:   document.getElementById('eq-saida')?.value || '17:00',
      primeiroAcesso: true,
      tipo:           'funcionario',
    };

    const res = await window.apiNuvem({ acao: 'criarMecanico', dados });
    if (res.erro) { window.toast('⚠️ ' + res.erro); return; }
    window.toast('Mecânico adicionado ✅');
    ['eq-usuario','eq-senha','eq-nome','eq-cpf','eq-tel','eq-end'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    window.carregarEquipe();
  };

  // ============================================================
  // § 14 — FINANCEIRO: BUSCA + FILTRO + ADIANTAMENTO
  // ============================================================
  function expandirFinanceiro() {
    const finPage = document.getElementById('page-financeiro');
    if (!finPage || finPage.querySelector('#fin-search')) return;
    const statsGrid = finPage.querySelector('.stats-grid');
    if (!statsGrid) return;

    const bar = document.createElement('div');
    bar.className = 'fin-search-bar';
    bar.innerHTML = `
      <input type="text" id="fin-search"
        placeholder="🔍 Buscar por cliente ou nº OS..."
        oninput="window.filtrarFinanceiro(this.value)"
        style="flex:1;min-width:180px">
      <select id="fin-filter-status"
        onchange="window.filtrarFinanceiro(document.getElementById('fin-search')?.value||'')"
        style="min-width:160px">
        <option value="">Todos os status</option>
        <option value="Entregue">✅ Pagos (Entregue)</option>
        <option value="Pronto">🟢 Prontos</option>
        <option value="Em andamento">⚙️ Em andamento</option>
        <option value="Aguardando Peça">⏳ Aguardando Peça</option>
        <option value="Reprovado">❌ Reprovados</option>
      </select>
    `;
    finPage.insertBefore(bar, finPage.firstChild);
  }

  window.filtrarFinanceiro = function (q) {
    const sf = document.getElementById('fin-filter-status')?.value || '';
    const finList = document.getElementById('fin-os-list');
    if (!finList) return;

    const mes = new Date().getMonth();
    const ano = new Date().getFullYear();
    let lista = (window.ordens || []).filter(o => {
      const d = new Date(o.criadoEm);
      return d.getMonth() === mes && d.getFullYear() === ano;
    });
    if (q) {
      const ql = q.toLowerCase();
      lista = lista.filter(o =>
        o.clienteNome.toLowerCase().includes(ql) || String(o.id).includes(ql)
      );
    }
    if (sf) lista = lista.filter(o => o.status === sf);

    if (!lista.length) {
      finList.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text-muted)">Nenhuma OS encontrada</div>`;
      return;
    }

    const fmt = v => 'R$ ' + (v || 0).toFixed(2).replace('.', ',');
    finList.innerHTML = '';
    lista.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)).forEach(os => {
      const pago = os.status === 'Entregue';
      const adiantHTML = os.adiantamento > 0
        ? `<div style="font-size:0.72rem;color:var(--green)">💵 Adiantamento: ${fmt(os.adiantamento)}</div>` : '';
      const row = document.createElement('div');
      row.className = 'fin-os-row';
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        window.navigate('os');
        setTimeout(() => window.editarOS(String(os.id)), 150);
      });
      row.innerHTML = `
        <div>
          <div class="fin-os-row-left">${os.clienteNome} · #${os.id}</div>
          <div class="fin-os-row-sub">
            ${os.veiculoObj ? os.veiculoObj.modelo : '—'} ·
            ${new Date(os.criadoEm).toLocaleDateString('pt-BR')}
            ${os.formaPagamento ? ' · ' + os.formaPagamento : ''}
          </div>
          ${adiantHTML}
        </div>
        <div style="text-align:right">
          <span class="fin-os-row-val ${pago ? 'pago' : 'pendente'}">${fmt(os.total)}</span>
          <div style="margin-top:3px">
            <span class="badge badge-${pago ? 'green' : 'amber'}" style="font-size:0.68rem">${os.status}</span>
          </div>
        </div>`;
      finList.appendChild(row);
    });
  };

  // ============================================================
  // § 15 — PLANO: perfil do mecânico
  // ============================================================
  const _carregarPlanoOrig = window.carregarPlano;
  window.carregarPlano = async function () {
    await _carregarPlanoOrig();
    const planoPage = document.getElementById('page-plano');
    if (!planoPage || planoPage.querySelector('#mecPerfil') || !window.mecanicoLogado) return;
    const m = window.mecanicoLogado;
    const iniciais = (m.nome || m.usuario || 'M').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const perfilCard = document.createElement('div');
    perfilCard.className = 'card';
    perfilCard.id = 'mecPerfil';
    perfilCard.style.marginBottom = '20px';
    perfilCard.innerHTML = `
      <div class="card-head"><div class="card-head-title">👤 Meu perfil</div></div>
      <div style="padding:20px;display:flex;align-items:center;gap:16px">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--accent);
             color:var(--charcoal);font-weight:900;font-size:1.2rem;
             display:flex;align-items:center;justify-content:center;flex-shrink:0">${iniciais}</div>
        <div>
          <div style="font-weight:800;font-size:1rem">${m.nome || 'Mecânico'}</div>
          <div style="color:var(--text-muted);font-size:0.875rem">@${m.usuario}</div>
          <div style="margin-top:6px">
            <span class="badge badge-${m.tipo === 'adm' || m.adm ? 'blue' : 'gray'}">
              ${m.tipo === 'adm' || m.adm ? '🛡️ Administrador' : '🔧 Funcionário'}
            </span>
          </div>
        </div>
      </div>
    `;
    planoPage.insertBefore(perfilCard, planoPage.firstChild);
  };

  // ============================================================
  // § 16 — PERMISSÕES POR PAPEL
  // ============================================================
  window.aplicarPermissoes = function () {
    if (!window.mecanicoLogado) return;
    const m = window.mecanicoLogado;
    const isAdm = m.tipo === 'adm' || m.adm === true || m.role === 'adm' || m.tipo === 'dono';
    if (isAdm) return;

    const proibidos = ['financeiro', 'equipe', 'plano'];
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(btn => {
      const oc = btn.getAttribute('onclick') || '';
      if (proibidos.some(p => oc.includes(`'${p}'`) || oc.includes(`"${p}"`))) {
        btn.style.display = 'none';
      }
    });
    // Config: esconder seção "Oficina" e botão salvar
    const secs = document.querySelectorAll('#page-config .config-section');
    secs.forEach((s, i) => { if (i > 0) s.style.display = 'none'; });
    const saveCfgBtn = document.querySelector('#page-config .btn-primary');
    if (saveCfgBtn) saveCfgBtn.style.display = 'none';
  };

  // ============================================================
  // § 17 — GRÁFICO DE PIZZA: ORIGEM DOS CLIENTES
  // ============================================================
  function adicionarContainerGrafico() {
    const dashPage = document.getElementById('page-dashboard');
    if (!dashPage || dashPage.querySelector('#origemChartCard')) return;
    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'origemChartCard';
    card.style.marginTop = '16px';
    card.innerHTML = `
      <div class="card-head">
        <span class="card-head-title">📊 Como os clientes conheceram a oficina</span>
        <span id="origemChartCount" style="font-size:0.78rem;color:var(--text-muted)"></span>
      </div>
      <div id="origemChartContent" class="pie-chart-wrap">
        <div style="color:var(--text-muted);font-size:0.875rem">Nenhum dado ainda</div>
      </div>
    `;
    // Insere antes do último card
    const cards = dashPage.querySelectorAll('.card');
    const last = cards[cards.length - 1];
    if (last) dashPage.insertBefore(card, last);
    else dashPage.appendChild(card);
  }

  window.renderOrigemChart = function () {
    const cont    = document.getElementById('origemChartContent');
    const countEl = document.getElementById('origemChartCount');
    if (!cont) return;

    const comOrigem = (window.clientes || []).filter(c => c.origem);
    if (!comOrigem.length) {
      cont.innerHTML = `<div style="color:var(--text-muted);font-size:0.875rem;padding:12px 0">
        Nenhum dado ainda — origem é registrada ao cadastrar clientes
      </div>`;
      if (countEl) countEl.textContent = '';
      return;
    }

    const total = comOrigem.length;
    if (countEl) countEl.textContent = `${total} cliente${total !== 1 ? 's' : ''}`;

    const counts = {};
    comOrigem.forEach(c => { counts[c.origem] = (counts[c.origem] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const cores   = ['#F5C400','#2563EB','#10B981','#EF4444','#F59E0B','#8B5CF6','#EC4899','#14B8A6'];

    const cx = 50, cy = 50, r = 40;
    let ang = -Math.PI / 2;
    let paths = '', legend = '';

    entries.forEach(([orig, count], i) => {
      const cor = cores[i % cores.length];
      const pct = count / total;
      const angFim = ang + pct * 2 * Math.PI;

      if (entries.length === 1) {
        paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${cor}"/>`;
      } else {
        const x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
        const x2 = cx + r * Math.cos(angFim), y2 = cy + r * Math.sin(angFim);
        paths += `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${pct > 0.5 ? 1 : 0},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${cor}"><title>${orig}: ${count}</title></path>`;
      }

      legend += `
        <div class="pie-legend-item">
          <div class="pie-dot" style="background:${cor}"></div>
          <span style="flex:1">${orig}</span>
          <span style="color:var(--text-muted);margin-right:6px">${count}</span>
          <span class="pie-pct">${Math.round(pct * 100)}%</span>
        </div>`;
      ang = angFim;
    });

    cont.innerHTML = `
      <svg class="pie-svg" width="100" height="100" viewBox="0 0 100 100">${paths}</svg>
      <div class="pie-legend">${legend}</div>
    `;
  };

  // ============================================================
  // § 18 — salvarConfig: atualizar nome em toda a UI
  // ============================================================
  const _salvarConfigOrig = window.salvarConfig;
  window.salvarConfig = function () {
    _salvarConfigOrig();
    setTimeout(atualizarNomeOficina, 100);
  };

  // ============================================================
  // § 19 — Overrides de navigate e refreshDashboard
  // ============================================================
  const _refreshDashOrig = window.refreshDashboard;
  window.refreshDashboard = function () {
    _refreshDashOrig();
    window.renderOrigemChart();
  };

  const _navigateOrig = window.navigate;
  window.navigate = function (page) {
    _navigateOrig(page);
    if (page === 'veiculos') {
      atualizarTabelaVeiculos();
      window.renderVeiculos();
    }
    if (page === 'financeiro') setTimeout(() => window.filtrarFinanceiro(''), 100);
    if (page === 'dashboard')  setTimeout(window.renderOrigemChart, 100);
  };

  const _abrirAppOrig = window.abrirApp;
  window.abrirApp = function () {
    _abrirAppOrig();
    window.aplicarPermissoes();
    atualizarNomeOficina();
  };

  // ============================================================
  // § 20 — INIT
  // ============================================================
  function initPatch() {
    injetarCSS();
    patchHTML();
    atualizarNomeOficina();

    if (document.getElementById('appShell')?.style.display !== 'none') {
      window.aplicarPermissoes();
    }
    if (document.getElementById('page-dashboard')?.classList.contains('active')) {
      window.renderOrigemChart();
    }
    console.log('[Patch v3] ✅ Fases 1 e 2 carregadas com sucesso!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPatch);
  } else {
    initPatch();
  }

})();
