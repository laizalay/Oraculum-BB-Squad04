// =====================================================
// src/pages/Login.jsx
// Tela de Login e Recuperação de Senha — Oraculum BB
// Responsáveis: Jean Silva & João Santino (US01/US02)
//
// ⚠️ ATENÇÃO — INTEGRAÇÃO COM FIREBASE:
// Quando o pessoal do Firebase subir o firebase.js,
// substitua o bloco marcado com "🔴 SIMULADO" pelo
// bloco marcado com "🟢 FIREBASE". As instruções estão
// nos comentários abaixo.
// =====================================================

import { useState, useEffect } from 'react';

// 🟢 FIREBASE — Descomente estas linhas quando o firebase.js estiver pronto:
// import { auth } from '../services/firebase';
// import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

// =====================================================
// ESTILOS — todo o visual da tela
// =====================================================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; }
  .obb-root {
    min-height: 100vh;
    background: #0d2a5e;
    background-image:
      radial-gradient(ellipse 80% 60% at 50% -10%, #1a4a9e55 0%, transparent 70%),
      radial-gradient(ellipse 40% 40% at 80% 90%, #f5c80015 0%, transparent 60%);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif; padding: 24px;
  }
  .obb-header { text-align: center; color: #ffffff; margin-bottom: 28px; animation: fadeDown .55s ease both; }
  .obb-shield {
    width: 70px; height: 70px; background: #f5c800; border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 18px;
    box-shadow: 0 0 0 8px rgba(245,200,0,0.12), 0 8px 28px rgba(245,200,0,0.30);
    animation: pop .5s cubic-bezier(.34,1.56,.64,1) .1s both;
  }
  .obb-title { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.3px; color: #ffffff; }
  .obb-sub   { font-size: 0.9rem; opacity: 0.7; margin-top: 4px; }
  .obb-card {
    background: #fff; border-radius: 20px; color-scheme: light;
    padding: 36px 32px 28px; width: 100%; max-width: 420px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.35);
    animation: fadeUp .55s ease .1s both;
  }
  .obb-card-title { font-size: 1.3rem; font-weight: 700; color: #0d2a5e; margin-bottom: 26px; }
  .obb-field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 18px; }
  .obb-label { font-size: .8rem; font-weight: 700; color: #2c3e60; letter-spacing: .3px; text-transform: uppercase; }
  .obb-input {
    padding: 13px 15px; border: 1.5px solid #dde3ef; border-radius: 10px;
    font-family: 'Sora', sans-serif; font-size: .95rem; color: #1a2a4a;
    background: #f8f9fc; outline: none; width: 100%;
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .obb-input:focus { border-color: #1a4a9e; background: #fff; box-shadow: 0 0 0 4px rgba(26,74,158,.10); }
  .obb-input::placeholder { color: #aab2c4; }
  .obb-pass-wrap { position: relative; }
  .obb-pass-wrap .obb-input { padding-right: 48px; }
  .obb-eye {
    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 4px;
    color: #8896b0; transition: color .15s; display: flex; align-items: center;
  }
  .obb-eye:hover { color: #1a4a9e; }
  .obb-forgot {
    display: block; margin-top: 7px; font-size: .78rem; color: #6b7fa8;
    text-decoration: none; cursor: pointer;
    background: none; border: none; font-family: inherit;
    transition: color .15s; text-align: left; padding: 0;
  }
  .obb-forgot:hover { color: #1a4a9e; text-decoration: underline; }
  .obb-error {
    background: #fff2f2; border-left: 3px solid #e03c3c; border-radius: 0 8px 8px 0;
    color: #c0302b; font-size: .82rem; padding: 10px 13px;
    margin-bottom: 14px; animation: shake .35s ease;
  }
  .obb-success {
    background: #f0fff6; border-left: 3px solid #2eb87a; border-radius: 0 8px 8px 0;
    color: #1a7d52; font-size: .82rem; padding: 10px 13px; margin-bottom: 14px;
  }
  .obb-btn {
    width: 100%; padding: 15px; background: #f5c800;
    color: #0d1f40; font-size: .98rem; font-weight: 700;
    font-family: 'Sora', sans-serif; border: none; border-radius: 12px;
    cursor: pointer; margin-top: 6px;
    transition: background .18s, transform .12s, box-shadow .18s;
    box-shadow: 0 4px 18px rgba(245,200,0,0.30);
  }
  .obb-btn:hover:not(:disabled) { background: #e8bb00; box-shadow: 0 6px 22px rgba(245,200,0,0.40); }
  .obb-btn:active:not(:disabled) { transform: scale(.98); }
  .obb-btn:disabled { opacity: .65; cursor: not-allowed; }
  .obb-spinner {
    display: inline-block; width: 16px; height: 16px;
    border: 2px solid rgba(13,31,64,.25); border-top-color: #0d1f40;
    border-radius: 50%; animation: spin .7s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }
  .obb-divider { border: none; border-top: 1px solid #eaecf4; margin: 22px 0 16px; }
  .obb-register { text-align: center; font-size: .85rem; color: #6b7fa8; }
  .obb-register a { color: #1a4a9e; font-weight: 600; text-decoration: none; }
  .obb-register a:hover { text-decoration: underline; }
  .obb-back-btn {
    background: none; border: none; cursor: pointer;
    font-family: 'Sora', sans-serif; font-size: .82rem; color: #6b7fa8;
    display: flex; align-items: center; gap: 5px;
    margin-bottom: 20px; padding: 0; transition: color .15s;
  }
  .obb-back-btn:hover { color: #1a4a9e; }
  .obb-footer { margin-top: 22px; color: rgba(255,255,255,.40); font-size: .75rem; animation: fadeUp .55s ease .25s both; }
  @keyframes fadeDown { from { opacity:0; transform:translateY(-18px); } to { opacity:1; transform:none; } }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px);  } to { opacity:1; transform:none; } }
  @keyframes pop      { from { opacity:0; transform:scale(.6); }         to { opacity:1; transform:scale(1); } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes shake    { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
`;

// =====================================================
// ÍCONES
// =====================================================

// Ícone do escudo no topo da página
function ShieldIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 5.5V11c0 5.25 3.4 10.1 8 11.4 4.6-1.3 8-6.15 8-11.4V5.5L12 2z" fill="#0d2a5e"/>
      <path d="M9 12l2.2 2.2 3.8-4.4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Ícone do olho (mostrar/ocultar senha)
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

// =====================================================
// COMPONENTE — Formulário de Login (US02)
// =====================================================
function LoginView({ onForgot, onSuccess }) {
  const [email,   setEmail]   = useState('');
  const [senha,   setSenha]   = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [erro,    setErro]    = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    // Validação básica dos campos
    if (!email || !senha) {
      setErro('Preencha todos os campos.');
      return;
    }

    setLoading(true);

    // =================================================
    // 🔴 SIMULADO — apague este bloco quando integrar o Firebase
    // =================================================
    setTimeout(() => {
      setErro('E-mail ou senha incorretos.');
      setLoading(false);
    }, 1200);
    // =================================================

    // =================================================
    // 🟢 FIREBASE — descomente este bloco quando o firebase.js estiver pronto
    // =================================================
    // try {
    //   const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    //   onSuccess(userCredential.user);
    //   // useNavigate() para redirecionar — configurar no App.jsx
    // } catch (error) {
    //   // Mensagem genérica — não revela qual campo está errado (requisito de segurança US02)
    //   setErro('E-mail ou senha incorretos.');
    // } finally {
    //   setLoading(false);
    // }
    // =================================================
  }

  return (
    <>
      <h2 className="obb-card-title">Entrar</h2>
      <form onSubmit={handleSubmit} noValidate>

        {/* Campo e-mail */}
        <div className="obb-field">
          <label className="obb-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="obb-input"
            type="email"
            placeholder="seu.email@bb.com.br"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        {/* Campo senha com botão de mostrar/ocultar */}
        <div className="obb-field">
          <label className="obb-label" htmlFor="login-senha">Senha</label>
          <div className="obb-pass-wrap">
            <input
              id="login-senha"
              className="obb-input"
              type={showPwd ? 'text' : 'password'}
              placeholder="Sua senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button type="button" className="obb-eye" onClick={() => setShowPwd(v => !v)}>
              <EyeIcon open={showPwd}/>
            </button>
          </div>

          {/* Link para recuperação de senha */}
          <button type="button" className="obb-forgot" onClick={onForgot}>
            Esqueci minha senha
          </button>
        </div>

        {/* Mensagem de erro (aparece só se houver erro) */}
        {erro && <p className="obb-error">{erro}</p>}

        {/* Botão de entrar */}
        <button type="submit" className="obb-btn" disabled={loading}>
          {loading && <span className="obb-spinner"/>}
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

      </form>

      <hr className="obb-divider"/>

      {/* Link para cadastro */}
      <p className="obb-register">
        Não tem conta? <a href="/cadastro">Criar conta</a>
      </p>
    </>
  );
}

// =====================================================
// COMPONENTE — Formulário de Recuperação de Senha (US03)
// =====================================================
function ForgotView({ onBack }) {
  const [email,   setEmail]   = useState('');
  const [msg,     setMsg]     = useState('');
  const [erro,    setErro]    = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setErro('');
    setMsg('');

    if (!email) {
      setErro('Digite seu e-mail.');
      return;
    }

    setLoading(true);

    // =================================================
    // 🔴 SIMULADO — apague este bloco quando integrar o Firebase
    // =================================================
    setTimeout(() => {
      // Mensagem genérica — não revela se o e-mail existe (requisito de segurança US03)
      setMsg('Se o e-mail estiver cadastrado, você receberá o link em breve.');
      setLoading(false);
    }, 1000);
    // =================================================

    // =================================================
    // 🟢 FIREBASE — descomente este bloco quando o firebase.js estiver pronto
    // =================================================
    // try {
    //   await sendPasswordResetEmail(auth, email);
    //   // Mensagem genérica — não revela se o e-mail existe (requisito de segurança US03)
    //   setMsg('Se o e-mail estiver cadastrado, você receberá o link em breve.');
    // } catch (error) {
    //   setMsg('Se o e-mail estiver cadastrado, você receberá o link em breve.');
    //   // Mesmo em caso de erro, exibe mensagem genérica por segurança
    // } finally {
    //   setLoading(false);
    // }
    // =================================================
  }

  return (
    <>
      {/* Botão de voltar */}
      <button className="obb-back-btn" onClick={onBack}>
        ← Voltar para o login
      </button>

      <h2 className="obb-card-title">Recuperar senha</h2>

      <form onSubmit={handleReset} noValidate>
        <div className="obb-field">
          <label className="obb-label" htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            className="obb-input"
            type="email"
            placeholder="seu.email@bb.com.br"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        {erro && <p className="obb-error">{erro}</p>}
        {msg  && <p className="obb-success">{msg}</p>}

        <button type="submit" className="obb-btn" disabled={loading || !!msg}>
          {loading && <span className="obb-spinner"/>}
          {loading ? 'Enviando…' : 'Enviar link de recuperação'}
        </button>
      </form>
    </>
  );
}

// =====================================================
// COMPONENTE PRINCIPAL — Página de Login
// Exportado para ser usado no App.jsx com React Router
// =====================================================
export default function Login() {
  // Controla qual formulário está visível: 'login' ou 'forgot'
  const [view, setView] = useState('login');

  // Injeta os estilos da página no <head> do documento
  useEffect(() => {
    const id = 'obb-styles';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = css;
      document.head.appendChild(el);
    }
    // Remove os estilos quando sair da página (limpeza)
    return () => { document.getElementById('obb-styles')?.remove(); };
  }, []);

  return (
    <div className="obb-root">

      {/* Cabeçalho com logo e título */}
      <header className="obb-header">
        <div className="obb-shield">
          <ShieldIcon/>
        </div>
        <h1 className="obb-title">Oraculum BB</h1>
        <p className="obb-sub">Avaliação de Cibersegurança</p>
      </header>

      {/* Card central — alterna entre login e recuperação */}
      <main className="obb-card">
        {view === 'login'  && (
          <LoginView
            onForgot={() => setView('forgot')}
            onSuccess={(user) => {
              // 🟢 FIREBASE: trocar por useNavigate('/home') quando integrar
              console.log('Login realizado:', user);
            }}
          />
        )}
        {view === 'forgot' && (
          <ForgotView onBack={() => setView('login')}/>
        )}
      </main>

      {/* Rodapé */}
      <footer className="obb-footer">
        Patrocinado pelo Banco do Brasil
      </footer>

    </div>
  );
}
