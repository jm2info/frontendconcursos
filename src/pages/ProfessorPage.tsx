import React, { useEffect, useState } from 'react';
import '../styles/home.css';

const frasesBanner = [
  "Ensinar é multiplicar sonhos.",
  "O conhecimento transforma realidades.",
  "Obrigado por compartilhar o seu saber.",
];

const ProfessorPage = () => {
  const [professor, setProfessor] = useState({
    nome: '',
    area_atuacao: '',
    foto_perfil: ''
  });

  const [frase, setFrase] = useState('');

  const [abaSelecionada, setAbaSelecionada] = useState('meuEnsino');

  const [formacao, setFormacao] = useState('');
const [linkCurriculo, setLinkCurriculo] = useState('');
const [senhaAtual, setSenhaAtual] = useState('');
const [novaSenha, setNovaSenha] = useState('');

const TITULOS_ABA = {
  meuEnsino: 'Meu ensino',
  minhasAulas: 'Minhas aulas',
  novaAula: 'Nova aula',
  trilhas: 'Trilhas de ensino',
  configuracoes: 'Configurações'
};

  useEffect(() => {
    const dados = localStorage.getItem('professorLogado');
    if (dados) {
      const p = JSON.parse(dados);
      setProfessor({
        nome: p.nome || 'Professor',
        area_atuacao: p.area_atuacao || '',
        foto_perfil: p.foto_perfil || ''
      });
    }

    // troca de frase automática
    let i = 0;
    setFrase(frasesBanner[i]);

    const intervalo = setInterval(() => {
      i = (i + 1) % frasesBanner.length;
      setFrase(frasesBanner[i]);
    }, 10000);

    return () => clearInterval(intervalo);
  }, []);
  
// ===== Atualizar formação/link =====
const handleAtualizarPerfil = async () => {
  const token = localStorage.getItem('tokenProfessor'); // ✅ chave corrigida
  if (!token) { alert('Token não encontrado'); return; }
  const auth = 'Bearer ' + token;

  try {
    const res = await fetch('http://localhost:3001/professores/perfil', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth
      },
      body: JSON.stringify({
        formacao: formacao,
        link_curriculo: linkCurriculo
      })
    });
    const data = await res.json();
    alert(data.message || data.error);
  } catch (err) {
    console.error(err);
  }
};

// ===== Alterar senha =====
const handleAlterarSenha = async () => {
  const token = localStorage.getItem('tokenProfessor'); // ✅ chave corrigida
  if (!token) { alert('Token não encontrado'); return; }

  if (!senhaAtual || !novaSenha) {
    alert('Preencha senha atual e nova senha.');
    return;
  }
  if (novaSenha.length < 8) {
    alert('Nova senha deve ter pelo menos 8 caracteres.');
    return;
  }
  if (novaSenha !== novaSenha2) {
    alert('A confirmação da nova senha não confere.');
    return;
  }

  const auth = 'Bearer ' + token;
  try {
    const res = await fetch('http://localhost:3001/professores/senha', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth
      },
      body: JSON.stringify({
        senhaAtual: senhaAtual,
        novaSenha: novaSenha
      })
    });
    const data = await res.json();
    alert(data.message || data.error);
  } catch (err) {
    console.error(err);
  }
};
const [cfgTab, setCfgTab] = useState('senha');
const [novaSenha2, setNovaSenha2] = useState('');
// ✅ avisos de sucesso
const [msgSenha, setMsgSenha] = useState('');
const [msgPerfil, setMsgPerfil] = useState('');

// ✅ carrega os dados do perfil ao entrar na aba "perfil"
useEffect(() => {
  const carregarPerfil = async () => {
    if (cfgTab !== 'perfil') return;

    const token = localStorage.getItem('tokenProfessor');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3001/professores/me', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) return;

      const data = await res.json();
      setFormacao(data.formacao || '');
      setLinkCurriculo(data.link_curriculo || '');
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  };

  carregarPerfil();
}, [cfgTab]);
 // modal esqueci senha - professor
const [forgotOpenP, setForgotOpenP] = useState(false);
const [fpStepP, setFpStepP] = useState<1 | 2>(1);
const [fpEmailP, setFpEmailP] = useState('');
const [fpTokenP, setFpTokenP] = useState('');
const [fpNewPassP, setFpNewPassP] = useState('');
const [fpNewPass2P, setFpNewPass2P] = useState('');
const [fpMsgErrP, setFpMsgErrP] = useState<string | null>(null);
const [fpMsgOkP, setFpMsgOkP] = useState<string | null>(null);
const [fpExpiresAtP, setFpExpiresAtP] = useState<number | null>(null);
const [fpSecondsLeftP, setFpSecondsLeftP] = useState<number>(0);

// abre modal e preenche e-mail do professor logado
function esqueciSenhaProfessor() {
  setForgotOpenP(true);
  setFpStepP(1);
  setFpMsgErrP(null);
  setFpMsgOkP(null);

  try {
    const raw = localStorage.getItem('professorLogado');
    if (raw) {
      const u = JSON.parse(raw);
      setFpEmailP(u?.email || '');
    }
  } catch {}
}

async function handleForgotSendCodeProfessor(e: React.FormEvent) {
  e.preventDefault();
  setFpMsgErrP(null);
  setFpMsgOkP(null);

  try {
    const res = await fetch('http://localhost:3001/professores/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fpEmailP }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Não foi possível enviar o código.');

    setFpMsgOkP('Se existir uma conta, enviamos um código para o seu e-mail.');
    setFpStepP(2);

    // 60s para reenviar (front); e-mail fala 15 min de validade
    setFpExpiresAtP(Date.now() + 60 * 1000);
    setFpSecondsLeftP(60);
  } catch (err: any) {
    setFpMsgErrP(err?.message || 'Falha ao enviar código.');
  }
}

async function handleForgotResendProfessor(e?: React.SyntheticEvent) {
  if (e) e.preventDefault();
  setFpMsgErrP(null);
  setFpMsgOkP(null);

  try {
    const res = await fetch('http://localhost:3001/professores/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fpEmailP }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Não foi possível enviar o código.');

    setFpMsgOkP('Novo código enviado para o seu e-mail.');
    setFpTokenP('');
    setFpExpiresAtP(Date.now() + 60 * 1000);
    setFpSecondsLeftP(60);
  } catch (err: any) {
    setFpMsgErrP(err?.message || 'Falha ao enviar código.');
  }
}

async function handleForgotConfirmProfessor(e: React.FormEvent) {
  e.preventDefault();
  setFpMsgErrP(null);
  setFpMsgOkP(null);

  // validações
  if (!fpTokenP.trim()) {
    setFpMsgErrP('Digite o código que você recebeu por e-mail.');
    return;
  }
  if (fpNewPassP.length < 8) {
    setFpMsgErrP('A nova senha deve ter pelo menos 8 caracteres.');
    return;
  }
  if (fpNewPassP !== fpNewPass2P) {
    setFpMsgErrP('A confirmação não confere.');
    return;
  }

  try {
    const res = await fetch('http://localhost:3001/professores/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fpEmailP,
        token: fpTokenP,
        novaSenha: fpNewPassP,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) throw new Error(data?.error || 'Código inválido ou expirado.');
      throw new Error(data?.error || 'Não foi possível redefinir a senha.');
    }

    setFpMsgOkP('Senha redefinida com sucesso!');
    setTimeout(() => {
      setForgotOpenP(false);
      setFpTokenP('');
      setFpNewPassP('');
      setFpNewPass2P('');
      setFpMsgErrP(null);
      setFpMsgOkP(null);
      setFpStepP(1);
    }, 800);
  } catch (err: any) {
    setFpMsgErrP(err?.message || 'Falha ao redefinir a senha.');
  }
}

// contador do botão "Reenviar código"
useEffect(() => {
  if (!forgotOpenP || fpStepP !== 2 || !fpExpiresAtP) return;

  const id = setInterval(() => {
    const secs = Math.max(0, Math.ceil((fpExpiresAtP - Date.now()) / 1000));
    setFpSecondsLeftP(secs);
    if (secs === 0) clearInterval(id);
  }, 500);

  return () => clearInterval(id);
}, [forgotOpenP, fpStepP, fpExpiresAtP]);
 return (
    <div style={{ backgroundColor: '#b2d8dc', minHeight: '100vh', padding: 0 }}>
      {/* HEADER */}
      <header className="header">
        <div className="container header-content">
          {/* Logo */}
          <a href="/">
            <img src="/assets/logo.png" alt="logo" className="logo" />
          </a>

          {/* Foto, nome e matéria */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={professor.foto_perfil}
              alt="Foto de Perfil"
              width={48}
              height={48}
              style={{ borderRadius: '50%', background: '#F5F5F5', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', color: 'white' }}>
              <span style={{ fontWeight: 'bold' }}>{professor.nome}</span>
              <span style={{ fontSize: '12px', color: '#FFD580' }}>{professor.area_atuacao}</span>
            </div>
          </div>
        </div>
      </header>

      {/* BANNER ANIMADO DE FRASE */}
<div style={{
  backgroundColor: '#014751',
  width: '100%',
  height: '50px',
  overflow: 'hidden',
  position: 'relative',
}}>
  <div
    style={{
      position: 'absolute',
      top: '15%',
      transform: 'translateY(-50%)',
      whiteSpace: 'nowrap',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '24px',
      paddingLeft: '100%',
      animation: 'deslizar 22s linear infinite',
    }}
  >
    {frase}
  </div>
</div>
{/* CONTAINER GERAL */}
<div style={{ position: 'relative', height: '120px' }}>

  {/* FAIXA LARANJA */}
  <div style={{
    backgroundColor: '#F47B35',
  height: '60px',
  width: '100%',
  zIndex: 0,
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '200px',
  fontSize: '20px',
  fontWeight: 'bold',
  color: 'white'
  }}> {abaSelecionada === 'meuEnsino' && 'Meu ensino'}
  {abaSelecionada === 'minhasAulas' && 'Minhas aulas'}
  {abaSelecionada === 'novaAula' && 'Nova aula'}
  {abaSelecionada === 'trilhas' && 'Trilhas de ensino'}
  {abaSelecionada === 'configuracoes' && 'Configurações'}</div>

  {/* CARD AZUL EM CIMA DA FAIXA */}
  <div style={{
    position: 'absolute',
    top: '0px', // ajusta se quiser mais pra cima ou mais pra baixo
    left: '0px',
    zIndex: 2,
    width: '180px',
    backgroundColor: '#2AB0BF',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderTopRightRadius: '12px',
    borderBottomRightRadius: '12px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
  }}>
    {/* FOTO */}
    <img
      src={professor.foto_perfil}
      alt="Foto do Professor"
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        objectFit: 'cover',
        backgroundColor: '#fff'
      }}
    />
    {/* NOME */}
    <span style={{
      marginTop: '10px',
      color: '#fff',
      fontWeight: 'bold',
      fontSize: '14px',
      textAlign: 'center'
    }}>
      {professor.nome}
    </span>
    {/* MATÉRIA */}
    <span style={{
      fontSize: '13px',
      color: '#fff',
      textAlign: 'center'
    }}>
      {professor.area_atuacao}
    </span>
    {/* SELO VERIFICADO */}
    <div style={{
      marginTop: '12px',
      backgroundColor: '#F47B35',
      color: 'white',
      fontSize: '12px',
      padding: '6px 10px',
      borderRadius: '6px',
      fontWeight: 'bold',
      textAlign: 'center'
    }}>
      Perfil verificado
      </div>
    </div>
    </div>
 {/* MENU LATERAL */}
<div style={{
  backgroundColor: 'white',
  padding: '20px',
  width: '180px',
  borderRadius: '0 0 10px 10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  marginTop: '90px'
}}>
  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
    <li
      className="menu-item"
      data-ativo={abaSelecionada === 'meuEnsino'}
      onClick={() => setAbaSelecionada('meuEnsino')}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}
    >
      📘 <span>Meu ensino</span>
    </li>

    <li
      className="menu-item"
      data-ativo={abaSelecionada === 'minhasAulas'}
      onClick={() => setAbaSelecionada('minhasAulas')}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}
    >
      🖥️ <span>Minhas aulas</span>
    </li>

    <li
      className="menu-item"
      data-ativo={abaSelecionada === 'novaAula'}
      onClick={() => setAbaSelecionada('novaAula')}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}
    >
      ➕ <span>Nova aula</span>
    </li>

    <li
      className="menu-item"
      data-ativo={abaSelecionada === 'trilhas'}
      onClick={() => setAbaSelecionada('trilhas')}
      style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}
    >
      🧭 <span>Trilhas de ensino</span>
    </li>

    <li
      className="menu-item"
      data-ativo={abaSelecionada === 'configuracoes'}
      onClick={() => setAbaSelecionada('configuracoes')}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}
    >
      ⚙️ <span>Configurações</span>
    </li>

    <li
      className="menu-item sair"
      onClick={() => {
        localStorage.removeItem('professorLogado');
        window.location.href = '/';
      }}
      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
    >
      🚪 <span>Sair</span>
    </li>
  </ul>
</div>
{/* CONTAINER GERAL DO CONTEÚDO */}
{/* CONTEÚDO POR ABA */}
{abaSelecionada === 'meuEnsino' && (
  <div style={{ padding: '40px', marginLeft: '260px', marginTop: '20px' }}>
    {/* TÍTULO E FRASE DE BOAS-VINDAS */}
    <div style={{ marginTop: '-490px' }}>
      <h1 style={{ fontSize: '32px', color: '#015C63', marginBottom: '10px' }}>
        Bem vindo, {professor.nome}!
      </h1>

      <p style={{ fontSize: '16px', color: '#00363D' }}>
        Gerencie suas aulas e acompanhe o impacto do seu conteúdo
      </p>

      {/* CARDS ESTATÍSTICOS */}
      <div style={{ position: 'relative', height: '200px', marginTop: '110px' }}>
        <div style={{ position: 'absolute', top: 0, display: 'flex', gap: '40px', marginLeft: '80px' }}>
          {/* BLOCO DO CARD 1 + BOTÃO */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* CARD 1 */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              width: '250px',
              textAlign: 'center',
              height: '190px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h2 style={{ fontSize: '20px', marginBottom: '5px' }}>N ex 12</h2>
              <p>Aulas publicadas</p>
            </div>

            {/* BOTÃO ABAIXO DO CARD */}
            <button onClick={()=> setAbaSelecionada('novaAula')} 
            style={{
              backgroundColor: '#F47B35',
              color: 'white',
              border: 'none',
              padding: '14px 70px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '18px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}>
              Enviar nova aula
            </button>
          </div>

          {/* CARD 2 */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            width: '250px',
            textAlign: 'center',
            height: '250px'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '5px' }}>👁️ Número ex</h2>
            <p>Visualizações</p>
          </div>

          {/* CARD 3 */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            width: '250px',
            textAlign: 'center',
            height: '250px'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '5px' }}>⭐ 4,7 / 5</h2>
            <p>Avaliação média das suas aulas</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{abaSelecionada === 'minhasAulas' && (
  <div style={{ padding: '40px', marginLeft: '260px', marginTop: '20px' }}>
   
  </div>
)}

{abaSelecionada === 'novaAula' && (
  <div style={{ padding: '40px', marginLeft: '260px', marginTop: '20px' }}>
  
  </div>
)}

{abaSelecionada === 'trilhas' && (
  <div style={{ padding: '40px', marginLeft: '260px', marginTop: '20px' }}>
   
  </div>
)}

{abaSelecionada === 'configuracoes' && (
  <div style={{ padding: '40px', marginLeft: '260px', marginTop: '20px' }}>
   
  </div>
)}
{abaSelecionada === 'configuracoes' && (
  <div style={{ position:'relative', top:'-580px', margin:'24px 24px 40px 250px' }}>
    <div style={{ fontSize: '32px', color: '#015C63', marginBottom: '130px'}}>
      Aqui voce personaliza sua conta. Gerencie sua senha e seu perfil.
    </div>

    <div
      role="tablist"
      aria-label="Configuracoes"
      style={{
        display:'flex',
        gap:'24px',
        borderBottom:'1px solid #e3eaec',
        marginBottom:'18px',
        paddingBottom:'6px',
        position:'relative'
      }}
    >
      {[
        { id:'senha', label:'Alterar senha' },
        { id:'perfil', label:'Perfil (formacao e link)' },
      ].map(t => {
        const ativo = cfgTab === t.id
        return (
          <div
            key={t.id}
            role="tab"
            aria-selected={ativo}
            onClick={() => setCfgTab(t.id)}
            style={{
              cursor:'pointer',
              padding:'6px 0',
              color: ativo ? '#000' : '#3f6a71',
              fontWeight: ativo ? 900 : 700,
              fontSize: ativo ? 17 : 16,
              position:'relative',
              userSelect:'none'
            }}
          >
            {t.label}
            {ativo && (
              <span style={{
                position:'absolute',
                left:0, right:0, bottom:-7,
                height:3,
                borderRadius:2,
                background:'#2AB0BF'
              }} />
            )}
          </div>
        )
      })}
    </div>

    {cfgTab === 'senha' && (
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          if (!senhaAtual) { alert('Informe a senha atual.'); return; }
          if (!novaSenha) { alert('Informe a nova senha.'); return; }
          if (novaSenha.length < 8) { alert('Nova senha deve ter pelo menos 8 caracteres.'); return; }
          if (novaSenha !== novaSenha2) { alert('Confirmacao da nova senha nao confere.'); return; }

          const token = localStorage.getItem('tokenProfessor');
          if (!token) { alert('Token nao encontrado. Faca login novamente.'); return; }

          try {
            const res = await fetch('http://localhost:3001/professores/senha', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
              },
              body: JSON.stringify({ senhaAtual, novaSenha })
            });

            const data = await res.json();
            if (!res.ok) {
              alert(data.error || 'Erro ao alterar senha');
              return;
            }

            setMsgSenha('Senha alterada com sucesso! ✅');
            setTimeout(() => setMsgSenha(''), 3000);
            setSenhaAtual('');
            setNovaSenha('');
            setNovaSenha2('');
          } catch (err) {
            console.error(err);
            alert('Erro de conexao com o servidor');
          }
        }}
        style={{
          background:'#fff', borderRadius:12, boxShadow:'0 6px 20px rgba(0,0,0,0.08)',
          padding:24, maxWidth:780
        }}
      >
        {msgSenha && (
          <div style={{
            backgroundColor: '#E6FFED',
            color: '#066A15',
            fontWeight: 700,
            padding: '12px 16px',
            borderRadius: 10,
            marginBottom: 12,
            boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}>
            {msgSenha}
          </div>
        )}

        <div style={{ fontSize:22, fontWeight:800, color:'#013440', marginBottom:6 }}>
          Alterar senha
        </div>
        <div style={{ fontSize:14, opacity:.75, marginBottom:16 }}>
          Defina uma nova senha segura.
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#013440', marginBottom:6 }}>Senha atual</div>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e)=>setSenhaAtual(e.target.value)}
              placeholder="****"
              style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #C5D7D9' }}
              required
            />
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#013440', marginBottom:6 }}>Nova senha</div>
            <input
              type="password"
              value={novaSenha}
              onChange={(e)=>setNovaSenha(e.target.value)}
              placeholder="Minimo 8 caracteres"
              style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #C5D7D9' }}
              required
              minLength={8}
            />
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#013440', marginBottom:6 }}>Confirmar nova senha</div>
            <input
              type="password"
              value={novaSenha2}
              onChange={(e)=>setNovaSenha2(e.target.value)}
              placeholder="Repita a nova senha"
              style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #C5D7D9' }}
              required
            />
          </div>
        </div>

        <div style={{ display:'flex', gap:12, marginTop:16, flexWrap:'wrap' }}>
          <button
            type="submit"
            style={{ background:'#F47B35', color:'#fff', border:'none', padding:'12px 18px',
                     borderRadius:12, fontWeight:800, cursor:'pointer', boxShadow:'0 6px 14px rgba(244,123,53,.25)' }}
          >
            Salvar
          </button>
        </div>
      </form>
    )}

    {cfgTab === 'perfil' && (
      <div style={{
        background:'#fff', borderRadius:12, boxShadow:'0 6px 20px rgba(0,0,0,0.08)',
        padding:24, maxWidth:780
      }}>
        {msgPerfil && (
          <div style={{
            backgroundColor: '#E6FFED',
            color: '#066A15',
            fontWeight: 700,
            padding: '12px 16px',
            borderRadius: 10,
            marginBottom: 12,
            boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}>
            {msgPerfil}
          </div>
        )}

        <div style={{ fontSize:22, fontWeight:800, color:'#013440', marginBottom:6 }}>
  Perfil (formacao e link)
</div>
<div style={{ fontSize:14, opacity:.75, marginBottom:16 }}>
  Atualize sua formacao academica e o link do seu curriculo ou LinkedIn.
</div>

<div style={{ display:'grid', gridTemplateColumns:'1fr', gap:16 }}>
  <div>
    <div style={{ fontSize:13, fontWeight:600, color:'#013440', marginBottom:6 }}>
      Formacao academica
    </div>
    <textarea
      value={formacao}
      onChange={(e)=>setFormacao(e.target.value)}
      placeholder="Exemplo: Licenciatura em Letras, Mestrado em..."
      rows={4}
      style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #C5D7D9', resize:'vertical' }}
    />
  </div>

  <div>
    <div style={{ fontSize:13, fontWeight:600, color:'#013440', marginBottom:6 }}>
      Link (LinkedIn/CV)
    </div>
    <input
      type="url"
      value={linkCurriculo}
      onChange={(e)=>setLinkCurriculo(e.target.value)}
      placeholder="https://www.linkedin.com/in/seu-perfil"
      style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #C5D7D9' }}
    />
  </div>
</div>

{/* 🔹 Aqui entra o link do esqueci senha */}
<div
  onClick={esqueciSenhaProfessor}
  style={{ color:'#026873', fontWeight:700, textDecoration:'underline', cursor:'pointer', marginTop:8 }}
>
  Esqueci a senha
</div>

<button
  onClick={async () => {
    const token = localStorage.getItem('tokenProfessor');
    if (!token) { alert('Token nao encontrado. Faca login novamente.'); return; }

    try {
      const res = await fetch('http://localhost:3001/professores/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ formacao, link_curriculo: linkCurriculo })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao atualizar perfil');
        return;
      }

      setMsgPerfil('Perfil atualizado com sucesso! ✅');
      setTimeout(() => setMsgPerfil(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Erro de conexao com o servidor');
    }
  }}
  style={{
    marginTop:16,
    background:'#F47B35',
    color:'#fff',
    border:'none',
    padding:'12px 18px',
    borderRadius:12,
    fontWeight:800,
    cursor:'pointer',
    boxShadow:'0 6px 14px rgba(244,123,53,.25)'
  }}
>
  Salvar
</button>
      </div>
    )}
  </div>
)}
{forgotOpenP && (
  <div style={{
    position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
    display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999
  }}>
    <div style={{
      width: 420, maxWidth:'90%', background:'#fff', borderRadius:12,
      padding:24, boxShadow:'0 12px 30px rgba(0,0,0,0.25)'
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h3 style={{ margin:0 }}>Redefinir senha</h3>
        <button
          onClick={() => {
            setForgotOpenP(false);
            setFpMsgErrP(null);
            setFpMsgOkP(null);
            setFpStepP(1);
            setFpTokenP('');
            setFpExpiresAtP(null);
            setFpSecondsLeftP(0);
          }}
          style={{ background:'none', border:'none', fontSize:20, cursor:'pointer' }}
        >
          ×
        </button>
      </div>

      {fpMsgErrP && (
        <div style={{ background:'#ffebee', color:'#c62828', padding:'8px 12px', borderRadius:8, marginTop:12 }}>
          {fpMsgErrP}
        </div>
      )}
      {fpMsgOkP && (
        <div style={{ background:'#e8f5e9', color:'#2e7d32', padding:'8px 12px', borderRadius:8, marginTop:12 }}>
          {fpMsgOkP}
        </div>
      )}

      {fpStepP === 1 && (
        <form onSubmit={handleForgotSendCodeProfessor} style={{ marginTop:16, display:'grid', gap:12 }}>
          <label style={{ fontWeight:600 }}>E-mail da conta</label>
          <input
            type="email"
            value={fpEmailP}
            onChange={e => setFpEmailP(e.target.value)}
            placeholder="seuemail@exemplo.com"
            style={{ padding:12, borderRadius:8, border:'1px solid #ccc' }}
          />
          <button type="submit" className="btn-orange" style={{ padding:'10px 16px', borderRadius:8, border:'none', cursor:'pointer' }}>
            Enviar código para o e-mail
          </button>
        </form>
      )}

      {fpStepP === 2 && (
        <form onSubmit={handleForgotConfirmProfessor} style={{ marginTop:16, display:'grid', gap:12 }}>
          <label style={{ fontWeight:600 }}>Código recebido por e-mail</label>
          <input
            type="text"
            value={fpTokenP}
            onChange={e => setFpTokenP(e.target.value)}
            placeholder="Ex: 123456"
            style={{ padding:12, borderRadius:8, border:'1px solid #ccc' }}
          />

          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:12, opacity:.7 }}>
              Aguarde {fpSecondsLeftP}s para reenviar
            </div>
            <button
              type="button"
              onClick={handleForgotResendProfessor}
              disabled={fpSecondsLeftP > 0}
              style={{
                padding:'6px 10px',
                borderRadius:8,
                border:'1px solid #ccc',
                background: fpSecondsLeftP > 0 ? '#eee' : '#fff',
                cursor: fpSecondsLeftP > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Reenviar código
            </button>
          </div>

          <label style={{ fontWeight:600 }}>Nova senha</label>
          <input
            type="password"
            value={fpNewPassP}
            onChange={e => setFpNewPassP(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            style={{ padding:12, borderRadius:8, border:'1px solid #ccc' }}
          />

          <label style={{ fontWeight:600 }}>Confirmar nova senha</label>
          <input
            type="password"
            value={fpNewPass2P}
            onChange={e => setFpNewPass2P(e.target.value)}
            placeholder="Repita a nova senha"
            style={{ padding:12, borderRadius:8, border:'1px solid #ccc' }}
          />

          <div style={{ display:'flex', gap:12, marginTop:8 }}>
            <button
              type="submit"
              className="btn-orange"
              style={{
                padding:'10px 16px',
                borderRadius:8,
                border:'none',
                cursor:'pointer'
              }}
            >
              Redefinir senha
            </button>
            <button
              type="button"
              onClick={() => {
                setForgotOpenP(false);
                setFpMsgErrP(null);
                setFpMsgOkP(null);
                setFpStepP(1);
                setFpTokenP('');
                setFpExpiresAtP(null);
                setFpSecondsLeftP(0);
              }}
              style={{ padding:'10px 16px', borderRadius:8, border:'1px solid #ccc', background:'#fff', cursor:'pointer' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  </div>
)}
    {/* FOOTER simples (Professor) */}
<footer
  className="footer"
  style={{
    marginTop: '200px',
    position: 'relative',
    paddingBottom: '50px'
  }}
>
  <div className="footer-logo-container">
    <img src="/assets/logobrancaa.png" alt="Concursos Aqui" className="footer-logo" />
  </div>

  {/* Links das abas */}
  <div className="footer-top-links">
    <a href="#" onClick={(e) => { e.preventDefault(); setAbaSelecionada('meuEnsino'); }}>Meu ensino</a>
    <a href="#" onClick={(e) => { e.preventDefault(); setAbaSelecionada('minhasAulas'); }}>Minhas aulas</a>
    <a href="#" onClick={(e) => { e.preventDefault(); setAbaSelecionada('trilhas'); }}>Trilhas de ensino</a>
  </div>

  {/* Texto © */}
  <div
    style={{
      position: 'absolute',
      bottom: '10px',
      left: '20px'
    }}
  >
    © 2025 Concursos Aqui.
  </div>

  {/* Redes sociais (opcional) */}
  <div
    className="social-icons"
    style={{
      position: 'absolute',
      bottom: '0px',
      right: '20px',
      display: 'flex',
      gap: '10px'
    }}
  >
    <a href="#" className="facebook"><img src="/assets/facebook.png" alt="Facebook" /></a>
    <a href="#" className="instagram"><img src="/assets/instagram.png" alt="Instagram" /></a>
    <a href="#" className="twitter"><img src="/assets/twitter.png" alt="Twitter" /></a>
  </div>
</footer>
    </div>
  );
};

export default ProfessorPage;