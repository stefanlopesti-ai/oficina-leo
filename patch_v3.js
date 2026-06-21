/**
 * ============================================================
 *  OFICINA APP — PATCH V3B
 *  Funcionalidades de segurança e senha
 *
 *  Adiciona:
 *  1. Reset de senha no Painel Master
 *  2. Primeiro acesso → troca de senha obrigatória
 *  3. Pergunta de segurança no primeiro acesso
 *  4. "Esqueceu sua senha?" com recuperação por pergunta
 *
 *  COMO USAR:
 *  Adicione APÓS o patch_v3.js no oficina.html:
 *    <script src="patch_v3b.js"></script>
 * ============================================================
 */
(function () {
  'use strict';

  const PERGUNTAS = [
    'Qual o nome da sua mãe?',
    'Qual o nome do seu primeiro animal de estimação?',
    'Em qual cidade você nasceu?',
    'Qual o nome da sua escola primária?',
    'Qual o modelo do seu primeiro carro?',
    'Qual o apelido da sua infância?',
    'Qual o nome do seu melhor amigo de infância?',
    'Qual o time de futebol que você torce?',
  ];

  // ============================================================
  // § 1 — CSS
  // ============================================================
  function injetarCSS() {
    if (document.getElementById('patch-v3b-css')) return;
    const s = document.createElement('style');
    s.id = 'patch-v3b-css';
    s.textContent = `
      /* Overlay genérico para modais de senha */
      .overlay-senha {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.75);
        z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
        animation: fadeIn 0.2s ease;
      }
      .overlay-senha .modal-box {
        background: var(--surface);
        border-radius: var(--radius);
        width: 100%; max-width: 460px;
        padding: 32px;
        box-shadow: 0 24px 64px rgba(0,0,0,0.5);
        animation: slideUp 0.3s ease;
      }
      .senha-icon { font-size: 2.5rem; margin-bottom: 12px; }
      .senha-title { font-size: 1.2rem; font-weight: 900; margin-bottom: 6px; }
      .senha-sub   { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 24px; line-height: 1.5; }

      /* Barra de força da senha */
      .strength-wrap { margin-top: 6px; }
      .strength-bar  { height: 4px; border-radius: 2px; background: var(--border); overflow: hidden; }
      .strength-fill { height: 100%; border-radius: 2px; transition: width .3s, background .3s; width: 0%; }
      .strength-label { font-size: 0.72rem; color: var(--text-muted); margin-top: 3px; }

      /* Link esqueceu senha */
      #linkEsqueceuSenha {
        display: block; text-align: center; margin-top: 14px;
        font-size: 0.82rem; color: var(--accent);
        cursor: pointer; text-decoration: underline;
        opacity: 0.85;
      }
      #linkEsqueceuSenha:hover { opacity: 1; }

      /* Botão reset no master */
      .btn-reset-senha {
        background: none; border: 1px solid var(--border);
        border-radius: 6px; padding: 3px 10px;
        font-size: 0.72rem; cursor: pointer;
        color: var(--text-muted); margin-left: 8px;
        transition: all 0.15s;
      }
      .btn-reset-senha:hover { border-color: var(--accent); color: var(--accent); }
    `;
    document.head.appendChild(s);
  }

  // ============================================================
  // § 2 — HELPERS
  // ============================================================
  function opcoesPerguntas() {
    return PERGUNTAS.map(q => `<option value="${q}">${q}</option>`).join('');
  }

  window.v3bCheckStrength = function (val, barId, labelId) {
    let score = 0;
    if (val.length >= 6)  score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const pcts  = [0, 20, 40, 65, 85, 100];
    const cores = ['#EF4444','#EF4444','#F59E0B','#F5C400','#10B981','#10B981'];
    const nomes = ['','Fraca','Fraca','Média','Boa','Forte'];

    const bar   = document.getElementById(barId);
    const label = document.getElementById(labelId);
    if (bar)   { bar.style.width = pcts[score] + '%'; bar.style.background = cores[score]; }
    if (label) label.textContent = nomes[score] ? 'Força: ' + nomes[score] : '';
  };

  // ============================================================
  // § 3 — MODAL PRIMEIRO ACESSO
  // ============================================================
  function criarModalPrimeiroAcesso() {
    if (document.getElementById('overlayPrimeiroAcesso')) return;
    const el = document.createElement('div');
    el.id = 'overlayPrimeiroAcesso';
    el.className = 'overlay-senha';
    el.style.display = 'none';
    el.innerHTML = `
      <div class="modal-box">
        <div class="senha-icon">🔐</div>
        <div class="senha-title">Bem-vindo! Crie sua senha pessoal</div>
        <div class="senha-sub">
          Por segurança você precisa criar uma <strong>senha própria</strong> e
          cadastrar uma <strong>pergunta de segurança</strong> para recuperar o acesso
          caso esqueça sua senha no futuro.
        </div>

        <div class="form-group" style="margin-bottom:4px">
          <label>Nova senha <span style="color:var(--red)">*</span></label>
          <input type="password" id="pa-nova" placeholder="Mínimo 6 caracteres"
                 oninput="v3bCheckStrength(this.value,'pa-strength','pa-strength-label')"
                 autocomplete="new-password">
          <div class="strength-wrap">
            <div class="strength-bar"><div class="strength-fill" id="pa-strength"></div></div>
            <div class="strength-label" id="pa-strength-label"></div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:20px;margin-top:12px">
          <label>Confirmar nova senha <span style="color:var(--red)">*</span></label>
          <input type="password" id="pa-conf" placeholder="Repita a senha" autocomplete="new-password">
        </div>

        <div style="border-top:1px solid var(--border);padding-top:20px;margin-bottom:14px">
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:14px">
            🔒 Escolha uma pergunta de segurança. Você precisará responder corretamente
            para recuperar sua senha se esquecer.
          </p>
        </div>

        <div class="form-group" style="margin-bottom:14px">
          <label>Pergunta de segurança <span style="color:var(--red)">*</span></label>
          <select id="pa-pergunta">${opcoesPerguntas()}</select>
        </div>

        <div class="form-group" style="margin-bottom:28px">
          <label>Sua resposta <span style="color:var(--red)">*</span></label>
          <input type="text" id="pa-resposta"
                 placeholder="Resposta (não diferencia maiúsculas/minúsculas)"
                 autocomplete="off">
        </div>

        <button class="btn btn-accent" id="pa-btn"
                style="width:100%;padding:14px;font-size:1rem;font-weight:800"
                onclick="window.confirmarPrimeiroAcesso()">
          Salvar e entrar no sistema →
        </button>
      </div>
    `;
    document.body.appendChild(el);
  }

  window.confirmarPrimeiroAcesso = async function () {
    const nova  = document.getElementById('pa-nova')?.value || '';
    const conf  = document.getElementById('pa-conf')?.value || '';
    const perg  = document.getElementById('pa-pergunta')?.value || '';
    const resp  = (document.getElementById('pa-resposta')?.value || '').trim();

    if (nova.length < 6)  { window.toast('Senha precisa ter mínimo 6 caracteres', '⚠️'); return; }
    if (nova !== conf)    { window.toast('As senhas não conferem', '⚠️'); return; }
    if (!resp)            { window.toast('Digite a resposta da pergunta de segurança', '⚠️'); return; }

    const btn = document.getElementById('pa-btn');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      const res = await window.apiNuvem({
        acao:               'trocarSenhaPrimeiroAcesso',
        usuario:            window.mecanicoLogado.usuario,
        novaSenha:          nova,
        perguntaSeguranca:  perg,
        respostaSeguranca:  resp.toLowerCase(),
      });

      if (res.erro) {
        window.toast('Erro ao salvar: ' + res.erro, '⚠️');
        btn.disabled = false;
        btn.textContent = 'Salvar e entrar no sistema →';
        return;
      }

      // Atualizar sessão local
      window.mecanicoLogado.primeiroAcesso = false;
      sessionStorage.setItem('oleo_mecanico', JSON.stringify(window.mecanicoLogado));

      document.getElementById('overlayPrimeiroAcesso').style.display = 'none';
      window.toast('Senha criada com sucesso! Bem-vindo! 🎉');
      window.abrirApp();

    } catch (e) {
      window.toast('Erro de conexão. Tente novamente.', '⚠️');
      btn.disabled = false;
      btn.textContent = 'Salvar e entrar no sistema →';
    }
  };

  // ============================================================
  // § 4 — MODAL ESQUECEU A SENHA
  // ============================================================
  function criarModalRecuperacao() {
    if (document.getElementById('overlayRecuperacao')) return;
    const el = document.createElement('div');
    el.id = 'overlayRecuperacao';
    el.className = 'overlay-senha';
    el.style.display = 'none';
    el.innerHTML = `
      <div class="modal-box">
        <div class="senha-icon">🔑</div>
        <div class="senha-title">Recuperar senha</div>
        <div class="senha-sub">Informe seu usuário. Se tiver uma pergunta de segurança cadastrada, você poderá redefinir sua senha.</div>

        <!-- Step 1: usuário -->
        <div id="rec-step1">
          <div class="form-group" style="margin-bottom:20px">
            <label>Usuário</label>
            <input type="text" id="rec-usuario" placeholder="Seu usuário de acesso" autocomplete="off">
          </div>
          <div style="display:flex;gap:10px">
            <button class="btn" style="flex:1" onclick="window.fecharRecuperacao()">Cancelar</button>
            <button class="btn btn-accent" id="rec-btn1" style="flex:2" onclick="window.recStep1()">Buscar →</button>
          </div>
        </div>

        <!-- Step 2: resposta + nova senha -->
        <div id="rec-step2" style="display:none">
          <div style="background:var(--surface2);border-radius:8px;padding:14px;margin-bottom:16px;font-size:0.875rem">
            <div style="color:var(--text-muted);font-size:0.72rem;text-transform:uppercase;margin-bottom:4px">Pergunta de segurança</div>
            <div id="rec-pergunta-texto" style="font-weight:700"></div>
          </div>

          <div class="form-group" style="margin-bottom:14px">
            <label>Sua resposta</label>
            <input type="text" id="rec-resposta" placeholder="Resposta cadastrada" autocomplete="off">
          </div>

          <div class="form-group" style="margin-bottom:4px">
            <label>Nova senha</label>
            <input type="password" id="rec-nova"
                   oninput="v3bCheckStrength(this.value,'rec-strength','rec-strength-label')"
                   placeholder="Mínimo 6 caracteres" autocomplete="new-password">
            <div class="strength-wrap">
              <div class="strength-bar"><div class="strength-fill" id="rec-strength"></div></div>
              <div class="strength-label" id="rec-strength-label"></div>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:20px;margin-top:12px">
            <label>Confirmar nova senha</label>
            <input type="password" id="rec-conf" placeholder="Repita a senha" autocomplete="new-password">
          </div>

          <div style="display:flex;gap:10px">
            <button class="btn" style="flex:1" onclick="window.fecharRecuperacao()">Cancelar</button>
            <button class="btn btn-accent" id="rec-btn2" style="flex:2" onclick="window.recStep2()">Redefinir senha →</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(el);
  }

  window.fecharRecuperacao = function () {
    const el = document.getElementById('overlayRecuperacao');
    if (el) el.style.display = 'none';
  };

  window.abrirRecuperacao = function () {
    criarModalRecuperacao();
    const el = document.getElementById('overlayRecuperacao');
    if (!el) return;
    // Reset
    document.getElementById('rec-step1').style.display = '';
    document.getElementById('rec-step2').style.display = 'none';
    document.getElementById('rec-usuario').value = '';
    el.style.display = 'flex';
  };

  window.recStep1 = async function () {
    const usuario = (document.getElementById('rec-usuario')?.value || '').trim();
    if (!usuario) { window.toast('Digite seu usuário', '⚠️'); return; }

    const btn = document.getElementById('rec-btn1');
    btn.disabled = true;
    btn.textContent = 'Buscando...';

    try {
      const res = await window.apiNuvem({ acao: 'getPerguntaSeguranca', usuario });
      btn.disabled = false;
      btn.textContent = 'Buscar →';

      if (res.erro || !res.pergunta) {
        window.toast('Usuário não encontrado ou sem pergunta cadastrada ⚠️', '⚠️');
        return;
      }

      document.getElementById('rec-pergunta-texto').textContent = res.pergunta;
      document.getElementById('rec-step1').style.display = 'none';
      document.getElementById('rec-step2').style.display = '';
      document.getElementById('rec-resposta').focus();

    } catch (e) {
      btn.disabled = false;
      btn.textContent = 'Buscar →';
      window.toast('Erro de conexão', '⚠️');
    }
  };

  window.recStep2 = async function () {
    const usuario  = (document.getElementById('rec-usuario')?.value  || '').trim();
    const resposta = (document.getElementById('rec-resposta')?.value || '').trim().toLowerCase();
    const nova     = document.getElementById('rec-nova')?.value  || '';
    const conf     = document.getElementById('rec-conf')?.value  || '';

    if (!resposta)     { window.toast('Digite a resposta', '⚠️'); return; }
    if (nova.length < 6) { window.toast('Senha precisa ter mínimo 6 caracteres', '⚠️'); return; }
    if (nova !== conf) { window.toast('As senhas não conferem', '⚠️'); return; }

    const btn = document.getElementById('rec-btn2');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      const res = await window.apiNuvem({
        acao:              'recuperarSenha',
        usuario,
        respostaSeguranca: resposta,
        novaSenha:         nova,
      });

      btn.disabled = false;
      btn.textContent = 'Redefinir senha →';

      if (res.erro) {
        window.toast('Resposta incorreta ou erro: ' + res.erro, '⚠️');
        return;
      }

      window.fecharRecuperacao();
      window.toast('Senha redefinida com sucesso! Faça login agora. 🎉');

    } catch (e) {
      btn.disabled = false;
      btn.textContent = 'Redefinir senha →';
      window.toast('Erro de conexão', '⚠️');
    }
  };

  // ============================================================
  // § 5 — ADICIONAR "ESQUECEU SUA SENHA?" NA TELA DE LOGIN
  // ============================================================
  function adicionarLinkEsqueceu() {
    const loginBox = document.getElementById('loginMecanicoBox');
    if (!loginBox || loginBox.querySelector('#linkEsqueceuSenha')) return;
    const link = document.createElement('span');
    link.id = 'linkEsqueceuSenha';
    link.textContent = 'Esqueceu sua senha?';
    link.addEventListener('click', window.abrirRecuperacao);
    loginBox.appendChild(link);
  }

  // ============================================================
  // § 6 — INTERCEPT loginMecanico → checar primeiroAcesso
  // ============================================================
  const _loginOrig = window.loginMecanico;
  window.loginMecanico = async function () {
    const usuario = (document.getElementById('loginUsuario')?.value || '').trim();
    const senha   = document.getElementById('loginSenha')?.value || '';
    if (!usuario || !senha) { window.toast('Preencha usuário e senha', '⚠️'); return; }

    const res = await window.apiNuvem({ acao: 'loginMecanico', usuario, senha });

    const erroEl = document.getElementById('loginErro');
    if (res.erro || !res.ok) {
      if (erroEl) erroEl.style.display = '';
      return;
    }
    if (erroEl) erroEl.style.display = 'none';

    // Montar objeto do mecânico
    window.mecanicoLogado = res.mecanico || {
      usuario,
      nome:           res.nome || usuario,
      tipo:           res.tipo || 'funcionario',
      primeiroAcesso: res.primeiroAcesso || false,
    };
    sessionStorage.setItem('oleo_mecanico', JSON.stringify(window.mecanicoLogado));

    // ← Primeiro acesso: forçar troca de senha
    if (res.primeiroAcesso || window.mecanicoLogado.primeiroAcesso) {
      criarModalPrimeiroAcesso();
      document.getElementById('overlayPrimeiroAcesso').style.display = 'flex';
      return;
    }

    window.abrirApp();
  };

  // ============================================================
  // § 7 — BOTÃO "RESET SENHA" NO PAINEL MASTER
  // ============================================================
  function patchMasterPanel() {
    // Observa quando o painel master renderiza a lista de mecânicos
    const observer = new MutationObserver(() => {
      document.querySelectorAll('[data-usuario]').forEach(item => {
        if (item.querySelector('.btn-reset-senha')) return;
        const usuario = item.dataset.usuario;
        if (!usuario) return;
        const btn = document.createElement('button');
        btn.className = 'btn-reset-senha';
        btn.innerHTML = '🔑 Resetar senha';
        btn.title = 'Resetar senha para 123456 e forçar troca no próximo acesso';
        btn.addEventListener('click', e => {
          e.stopPropagation();
          window.masterResetarSenha(usuario);
        });
        item.appendChild(btn);
      });
    });

    const root = document.getElementById('masterContent')
              || document.getElementById('masterPanel')
              || document.getElementById('appMaster')
              || document.body;
    observer.observe(root, { childList: true, subtree: true });
  }

  window.masterResetarSenha = async function (usuario) {
    const novaSenha = prompt(
      `🔑 Resetar senha de "${usuario}"\n\n` +
      `Digite a nova senha temporária (deixe vazio para usar 123456):`
    );
    if (novaSenha === null) return; // cancelou

    const senha = novaSenha.trim() || '123456';

    const res = await window.apiNuvem({
      acao:           'resetarSenha',
      usuario,
      novaSenha:      senha,
      primeiroAcesso: true,
    });

    if (res.erro) { window.toast('Erro: ' + res.erro, '⚠️'); return; }
    window.toast(`✅ Senha de "${usuario}" resetada → "${senha}"\nEle deverá trocar no próximo acesso.`);
  };

  // ============================================================
  // § 8 — INIT
  // ============================================================
  function initPatchB() {
    injetarCSS();
    criarModalPrimeiroAcesso();
    criarModalRecuperacao();
    adicionarLinkEsqueceu();
    patchMasterPanel();
    console.log('[Patch v3b] ✅ Reset senha + Primeiro acesso prontos!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPatchB);
  } else {
    initPatchB();
  }

})();
