import React, { useEffect, useState } from 'react';

import '../styles/home.css';


interface Concurso {
  id: number;
  titulo: string;
  inscricoesAte: string;
  vagas: number;
  salario: string;
  localidade: string;
}

const frasesMotivacionais = [
  "A aprovação começa com o primeiro passo.",
  "Seu esforço de hoje é o sucesso de amanhã.",
  "Persistir é o caminho mais curto até o sonho.",
  "Estudar é plantar futuro!",
  "O impossível é questão de treino."
];

const CandidatoPage = () => {
  const [nome, setNome] = useState('Candidato');
  const [frase, setFrase] = useState('');
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [filtroLocal, setFiltroLocal] = useState('');
  const [concursosFiltrados, setConcursosFiltrados] = useState<Concurso[]>([]);

  useEffect(() => {
    const user = localStorage.getItem('candidato');
    if (user) {
      const dados = JSON.parse(user);
      setNome(dados.nome || 'Candidato');
    }

    // Frase aleatória
    const fraseAleatoria = frasesMotivacionais[Math.floor(Math.random() * frasesMotivacionais.length)];
    setFrase(fraseAleatoria);

    // Dados mock
    fetch('http://localhost:3001/concursos')
  .then(res => res.json())
  .then(data => {
    setConcursos(data);
    setConcursosFiltrados(data);
  })
  .catch(err => {
    console.error('Erro ao buscar concursos:', err);
  });
  }, []);

  const handleFiltro = () => {
    const filtrados = concursos.filter(conc =>
      conc.localidade.toLowerCase().includes(filtroLocal.toLowerCase())
    );
    setConcursosFiltrados(filtrados);
  };
const [abaSelecionada, setAbaSelecionada] = useState('minhaJornada');
const [materiaSelecionada, setMateriaSelecionada] = useState('');
const [mostrarAssuntos, setMostrarAssuntos] = useState(false);
const handleClickProfessor = () => {
    setProfessorClicado(true);
  

};

const [professorClicado, setProfessorClicado] = useState(false);
const [assuntoSelecionado, setAssuntoSelecionado] = useState('');
const [aulaSelecionada, setAulaSelecionada] = useState('');
const [notaEstrela, setNotaEstrela] = useState(0);
const [cfgTab, setCfgTab] = useState<'senha' | 'dados' | 'excluir'>('senha');

const TITULOS_ABA: Record<string, string> = {
  minhaJornada: 'Minha jornada',
  meusFavoritos: 'Meus favoritos',
  visaoGeral: 'Visão geral',
  aulasGratuitas: 'Aulas gratuitas',
  configuracoes: 'Configurações',
};
const tituloFaixa = TITULOS_ABA[abaSelecionada] ?? '';
// estados do efeito do "Voltar"
const [hoverVoltar, setHoverVoltar] = useState(false);
const [pressVoltar, setPressVoltar] = useState(false);

// sempre que mudar etapa, reseta hover/press
useEffect(() => {
  setHoverVoltar(false);
  setPressVoltar(false);
}, [professorClicado, assuntoSelecionado, aulaSelecionada]);
const [cfg, setCfg] = useState({
  nome: '',
  email: '',
  senhaConfirmacao: '',   // senha atual para confirmar alteração de dados
});
const [pwd, setPwd] = useState({ atual: '', nova: '', confirma: '' });

const [msgDadosOk, setMsgDadosOk] = useState('');
const [msgDadosErr, setMsgDadosErr] = useState('');
const [msgSenhaOk, setMsgSenhaOk] = useState('');
const [msgSenhaErr, setMsgSenhaErr] = useState('');
const [excluirOpen, setExcluirOpen] = useState(false);
const [excluirTexto, setExcluirTexto] = useState('');

// carrega dados do localStorage('candidato')
useEffect(() => {
  try {
    const raw = localStorage.getItem('candidato');
    if (raw) {
      const u = JSON.parse(raw);
      setCfg((c) => ({ ...c, nome: u.nome || 'Candidato', email: u.email || '' }));
    }
  } catch {}
}, []);

// ====== validações ======
function validarDados() {
  if (!cfg.nome.trim()) return 'Nome é obrigatório.';
  if (!cfg.email.trim() || !cfg.email.includes('@')) return 'E-mail inválido.';
  if (!cfg.senhaConfirmacao) return 'Digite sua senha atual para confirmar.';
  return '';
}
function validarSenha() {
  if (!pwd.atual) return 'Informe a senha atual.';
  if (pwd.nova.length < 8) return 'Nova senha deve ter pelo menos 8 caracteres.';
  if (pwd.nova !== pwd.confirma) return 'Confirmação da nova senha não confere.';
  return '';
}

// ====== salvar dados da conta (REAL com backend) ======
async function salvarDadosConta(e: React.FormEvent) {
  e.preventDefault();
  setMsgDadosOk('');
  setMsgDadosErr('');

  const v = validarDados();
  if (v) return setMsgDadosErr(v);

  try {
    // pega id do candidato do localStorage
    let id: number | null = null;
    const raw = localStorage.getItem('candidato');
    if (raw) {
      const u = JSON.parse(raw);
      id = u?.id ?? null;
    }

    if (!id) {
      setMsgDadosErr('ID do candidato não encontrado.');
      return;
    }

    const res = await fetch('http://localhost:3001/candidatos/dados', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        nome: cfg.nome,
        email: cfg.email,
        // 👇 AQUI é "senha", não "senhaAtual"
        senha: cfg.senhaConfirmacao,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) throw new Error('Senha atual incorreta.');
      if (res.status === 409) throw new Error('E-mail já está em uso.');
      if (res.status === 422) throw new Error(data?.error || 'Dados inválidos.');
      throw new Error('Não foi possível atualizar os dados.');
    }

    // sucesso → atualizar localStorage (mantendo o que já existia)
    const atual = raw ? JSON.parse(raw) : {};
    const atualizado = { ...atual, id, nome: cfg.nome, email: cfg.email };
    localStorage.setItem('candidato', JSON.stringify(atualizado));

    setNome(cfg.nome); // reflete no header
    setMsgDadosOk('Dados atualizados com sucesso.');
    setCfg((c) => ({ ...c, senhaConfirmacao: '' })); // limpa senha
  } catch (err: any) {
    setMsgDadosErr(err.message || 'Erro ao atualizar dados.');
  }
}

// ====== alterar senha (REAL com backend via ID) ======
async function alterarSenha(e: React.FormEvent) {
  e.preventDefault();
  setMsgSenhaOk('');
  setMsgSenhaErr('');

  const v = validarSenha();
  if (v) { setMsgSenhaErr(v); return; }

  try {
    // pega o candidato do localStorage (precisa ter id, nome, email...)
    const raw = localStorage.getItem('candidato');
    if (!raw) throw new Error('Usuário não autenticado.');

    const cand = JSON.parse(raw);
    const id = cand?.id;
    if (!id) throw new Error('ID do candidato não encontrado no localStorage.');

    const res = await fetch('http://localhost:3001/candidatos/senha', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,                     // ✅ agora vai o ID
        senhaAtual: pwd.atual,
        novaSenha: pwd.nova,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) throw new Error('Senha atual incorreta.');
      if (res.status === 404) throw new Error('Candidato não encontrado.');
      if (res.status === 422) throw new Error(data?.error || 'Nova senha inválida.');
      throw new Error('Não foi possível alterar a senha.');
    }

    setPwd({ atual: '', nova: '', confirma: '' });
    setMsgSenhaOk('Senha alterada com sucesso.');
  } catch (err: any) {
    setMsgSenhaErr(err.message || 'Falha ao alterar a senha.');
  }
}



// ====== excluir conta (REAL com backend, sem pedir senha) ======
async function excluirDefinitivo() {
  if (excluirTexto !== 'EXCLUIR MINHA CONTA') {
    alert('Digite EXCLUIR MINHA CONTA para confirmar.');
    return;
  }

  try {
    const raw = localStorage.getItem('candidato');
    if (!raw) throw new Error('Usuário não autenticado.');

    const cand = JSON.parse(raw);
    const id = cand?.id;
    if (!id) throw new Error('ID do candidato não encontrado no localStorage.');

    // DELETE sem body
    const res = await fetch('http://localhost:3001/candidatos/' + id, {
      method: 'DELETE',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 404) throw new Error('Candidato não encontrado.');
      throw new Error(data?.error || 'Não foi possível excluir a conta.');
    }

    alert('Conta excluída com sucesso.');
    localStorage.removeItem('candidato');
    window.location.href = '/';
  } catch (err: any) {
    alert(err.message || 'Erro ao excluir conta.');
  }
}
// ====== ESQUECI MINHA SENHA (modal) ======

// estado do modal
const [forgotOpen, setForgotOpen] = useState(false);

// passo do fluxo: 1 = enviar código, 2 = confirmar código + nova senha
const [fpStep, setFpStep] = useState<1 | 2>(1);

// campos
const [fpEmail, setFpEmail] = useState('');
const [fpToken, setFpToken] = useState('');
const [fpNewPass, setFpNewPass] = useState('');
const [fpNewPass2, setFpNewPass2] = useState('');

// mensagens
const [fpMsgErr, setFpMsgErr] = useState<string | null>(null);
const [fpMsgOk, setFpMsgOk] = useState<string | null>(null);

// abre o modal já preenchendo o e-mail do usuário logado
function esqueciSenha() {
  setForgotOpen(true);
  setFpStep(1);
  setFpMsgErr(null);
  setFpMsgOk(null);

  try {
    const raw = localStorage.getItem('candidato');
    if (raw) {
      const u = JSON.parse(raw);
      setFpEmail(u?.email || '');
    }
  } catch {}
}

// envia o código para o e-mail
async function handleForgotSendCode(e: React.FormEvent) {
  e.preventDefault();
  setFpMsgErr(null);
  setFpMsgOk(null);

  try {
    const res = await fetch('http://localhost:3001/candidatos/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fpEmail }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Não foi possível enviar o código.');

    setFpMsgOk('Se existir uma conta, enviamos um código para o seu e-mail.');
    setFpStep(2);

    // inicia contagem de 60s
    setFpExpiresAt(Date.now() + 60 * 1000);
    setFpSecondsLeft(60);
  } catch (err: any) {
    setFpMsgErr(err?.message || 'Falha ao enviar código.');
  }
}
async function handleForgotResend(e?: React.SyntheticEvent) {
  if (e) e.preventDefault();
  setFpMsgErr(null);
  setFpMsgOk(null);

  try {
    const res = await fetch('http://localhost:3001/candidatos/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fpEmail }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Não foi possível enviar o código.');

    setFpMsgOk('Novo código enviado para o seu e-mail.');
    setFpToken('');
    // reinicia contagem
    setFpExpiresAt(Date.now() + 60 * 1000);
    setFpSecondsLeft(60);
  } catch (err: any) {
    setFpMsgErr(err?.message || 'Falha ao enviar código.');
  }
}

// confirma o token e define a nova senha
async function handleForgotConfirm(e: React.FormEvent) {
  e.preventDefault();
  setFpMsgErr(null);
  setFpMsgOk(null);
if (fpExpiresAt && Date.now() > fpExpiresAt) {
  setFpMsgErr('Código expirado. Clique em “Reenviar código”.');
  return;
}
  // validações no front
  if (!fpToken.trim()) {
    setFpMsgErr('Digite o código que você recebeu por e-mail.');
    return;
  }
  if (fpNewPass.length < 8) {
    setFpMsgErr('A nova senha deve ter pelo menos 8 caracteres.');
    return;
  }
  if (fpNewPass !== fpNewPass2) {
    setFpMsgErr('A confirmação não confere.');
    return;
  }

  try {
    const res = await fetch('http://localhost:3001/candidatos/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fpEmail,
        token: fpToken,
        novaSenha: fpNewPass,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) throw new Error(data?.error || 'Código inválido ou expirado.');
      throw new Error(data?.error || 'Não foi possível redefinir a senha.');
    }

    // sucesso
    setFpMsgOk('Senha redefinida com sucesso!');
    // limpa campos e fecha modal após um breve feedback
    setTimeout(() => {
      setForgotOpen(false);
      setFpToken('');
      setFpNewPass('');
      setFpNewPass2('');
      setFpMsgErr(null);
      setFpMsgOk(null);
      setFpStep(1);
    }, 800);
  } catch (err: any) {
    setFpMsgErr(err?.message || 'Falha ao redefinir a senha.');
  }
}
const [fpExpiresAt, setFpExpiresAt] = useState<number | null>(null);
const [fpSecondsLeft, setFpSecondsLeft] = useState<number>(0);
useEffect(() => {
  if (!forgotOpen || fpStep !== 2 || !fpExpiresAt) return;

  const id = setInterval(() => {
    const secs = Math.max(0, Math.ceil((fpExpiresAt - Date.now()) / 1000));
    setFpSecondsLeft(secs);
    if (secs === 0) clearInterval(id);
  }, 500);

  return () => clearInterval(id);
}, [forgotOpen, fpStep, fpExpiresAt]);
  return (
    <>
   <div style={{ backgroundColor: '#b2d8dc', minHeight: '100vh', padding: '0' }}>
     
<header className="header">
    <div className="container header-content">
      {/* Logo */}
      <a href="/">
        <img src="/assets/logo.png" alt="logo" className="logo" />
      </a>

      {/* Campo de busca */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginRight:'auto' }}>
        <input
          type="text"
          placeholder="O que você procura?"
          value={filtroLocal}
          onChange={(e) => setFiltroLocal(e.target.value)}
          style={{
            padding: '12px 20px',
            borderRadius: '20px',
            border: 'none',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button className="btn-orange" onClick={handleFiltro}>Buscar</button>
      </div>

      {/* Avatar + Nome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src={'https://api.dicebear.com/6.x/thumbs/svg?seed=' + encodeURIComponent(nome)}
          alt="Avatar"
          width={48}
          height={48}
          style={{ borderRadius: '50%', background: '#F5F5F5' }}
        />
        <span style={{ color: 'white', fontWeight: 'bold' }}>{nome}</span>
      </div>
    </div>
  </header>
  <nav
  style={{
    backgroundColor: '#014751',
    display: 'flex',
    justifyContent: 'center',
    gap: '100px',
    padding: '24px 0',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px'
  }}
>
  <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Notícias</a>
  <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Concursos</a>
  <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Editorias</a>
</nav>

<div style={{ display: 'flex', flexDirection: 'column' }}>
  {/* FAIXA LARANJA horizontal */}
  <div style={{
    backgroundColor: '#F47B35',
    height: '60px',
    width: '100%',
    position: 'relative',
    zIndex: 1
  }}><div style={{
    position: 'absolute',
    left: '210px',            // encosta à esquerda da faixa
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'white',
    fontWeight: 800,
    fontSize: '18px',
    letterSpacing: '0.3px'
  }}>
    {tituloFaixa}
  </div>
</div>


  {/* CONTEÚDO EM CIMA DA FAIXA */}
  <div style={{ display: 'flex', marginTop: '-60px', zIndex: 1, position: 'relative' }}></div>
  {/* COLUNA: Frase + Menu */}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
    
    {/* Frase motivacional */}
    <div
      style={{
        backgroundColor: '#2AB0BF',
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: '15px',
        zIndex:3,
        padding: '20px',
        width: '180px',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        position:'absolute',
        justifyContent: 'center',
        marginBottom: '20px' ,// isso separa a frase do menu
         borderTopRightRadius: '12px',
         boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
      }}
    >
      {frase}
    </div>

    {/* Menu lateral */}
    <div style={{ backgroundColor: 'white', padding: '20px', width: '180px',
        marginTop:'130px', borderBottomRightRadius: '12px',boxShadow: '0 4px 8px rgba(0,0,0,0.2)'}}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
  <li
    className="menu-item"
    data-ativo={abaSelecionada === 'minhaJornada'}
    onClick={() => setAbaSelecionada('minhaJornada')}
  >
    📘 Minha jornada
  </li>

  <li
    className="menu-item"
    data-ativo={abaSelecionada === 'meusFavoritos'}
    onClick={() => setAbaSelecionada('meusFavoritos')}
  >
    ⭐ Meus favoritos
  </li>

  <li
    className="menu-item"
    data-ativo={abaSelecionada === 'visaoGeral'}
    onClick={() => setAbaSelecionada('visaoGeral')}
  >
    🔍 Visão geral
  </li>

  <li
    className="menu-item"
    data-ativo={abaSelecionada === 'aulasGratuitas'}
    onClick={() => setAbaSelecionada('aulasGratuitas')}
  >
    🎓 Aulas gratuitas
  </li>

  <li
    className="menu-item"
    data-ativo={abaSelecionada === 'configuracoes'}
    onClick={() => setAbaSelecionada('configuracoes')}
  >
    ⚙️ Configurações
  </li>

  <li
    className="menu-item sair"
    onClick={() => { localStorage.removeItem('candidato'); window.location.href = '/'; }}
  >
    🚪 Sair
  </li>
</ul>
    </div>
  </div>
  {abaSelecionada === 'minhaJornada' && (
<div style={{
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start', 
  padding: '20px 40px 0px 40px',
  gap: '40px',
  marginTop:'-330px',
  marginLeft:'250px'
}}>
  {/* BLOCO ESQUERDO - CAIXA + TABELA */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', width:'750px' }}>
    {/* CAIXA AZUL ESCURA */}
<div
  style={{
    position: 'relative',           // <- necessário p/ posicionar img e botão
    backgroundColor: '#054550',
    color: 'white',
    padding: '40px',
    borderRadius: '8px',
    textAlign: 'left',
    overflow: 'hidden',             // <- “corta” a imagem se passar da caixa
    minHeight: '240px'
  }}
>
  {/* Título */}
  <h2 style={{ fontSize: '22px', margin: 0, maxWidth: 420 }}>
    A sua aprovação começa aqui!
  </h2>

  {/* Benefícios */}
  <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0 0', lineHeight: '1.8' }}>
    <li>✅ Conteúdo direto ao ponto</li>
    <li>⏰ Acesso 24 horas</li>
    <li>🆓 100% gratuito</li>
  </ul>

  {/* Botão — fica por cima da perna */}
  <button
    onClick={() => setAbaSelecionada('aulasGratuitas')}
    style={{
      position: 'absolute',
      right: 28,
      bottom: 22,
      backgroundColor: '#F47B35',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '10px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '16px',
      zIndex: 2                    // <- acima da imagem (corta a perna)
    }}
  >
    Quero começar
  </button>

  {/* Imagem do professor */}
  <img
    src="/assets/aulaaa.png"
    alt="Professor"
    style={{
      position: 'absolute',
     
      left:'520px',                 // encosta na borda direita
      bottom: '55px',
              // “desce” um pouco pra perna passar do botão
      height: '155px',              // deixa grande pra criar o recorte
      objectFit: 'contain',
      pointerEvents: 'none',
      zIndex: 1,                   // atrás do botão
      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.25))'
    }}
  />
</div>
    {/* TABELA DE CONCURSOS */}
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#2AB0BF', color: 'white' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>Concurso</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Inscrições até</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>N Vagas</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Salário até</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4].map((_, i) => (
            <tr key={i}>
              <td style={{ padding: '12px' }}>exemplo</td>
              <td style={{ padding: '12px' }}>exemplo</td>
              <td style={{ padding: '12px' }}>exemplo</td>
              <td style={{ padding: '12px' }}>exemplo</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* BLOCO DIREITO - FILTRO */}
<div style={{
  width: '320px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '10px'
}}>

  <h3 style={{
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#013E4C',
    borderBottom: '1px solid #013E4C',
    paddingBottom: '4px',
    margin: '0',
    textAlign:'center'
  }}>
    Oportunidades em:
  </h3>

  <div style={{
    backgroundColor: '#054550',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  }}>
    <div style={{ display: 'flex', gap:'10px',flexWrap:'wrap' }}>
      <input
        type="text"
        placeholder="Buscar localidade"
        value={filtroLocal}
        onChange={(e) => setFiltroLocal(e.target.value)}
        style={{
          flex: 1,
    height: '30px', 
    padding: '0 16px',
    border: 'none',
    borderRadius: '20px',
    outline: 'none',
    fontSize: '14px',
    width:'10px'
        }}
      />
      <button
        onClick={handleFiltro}
        style={{
         backgroundColor: '#F47B35',
    color: 'white',
    border: 'none',
    height: '30px', 
    padding: '0 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    marginLeft: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace:'nowrap',
    width:'70px'
        }}
      >
        Buscar
      </button>
    </div>

    <div style={{
      backgroundColor: 'white',
      color: '#054550',
      borderRadius: '8px',
      height: '160px',
      overflowY: 'auto',
      fontSize: '14px',
      padding: '6px',
      boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)'
    }}>
      {['Lugar', 'Lugar', 'Lugar', 'Lugar', 'Lugar'].map((item, index) => (
        <div key={index} style={{
          borderBottom: '1px solid #ccc',
          padding: '8px 4px',
          fontWeight: 'bold',
          color: '#00ACC1'
        }}>
          {item}
        </div>
      ))}
    </div>
  </div>
</div>
</div>
  )}
{abaSelecionada === 'aulasGratuitas' && professorClicado && (
  <div
    onClick={() => {
      if (aulaSelecionada) { setAulaSelecionada(''); return; }
      if (assuntoSelecionado) { setAssuntoSelecionado(''); return; }
      setProfessorClicado(false);
    }}
    onMouseEnter={() => setHoverVoltar(true)}
    onMouseLeave={() => { setHoverVoltar(false); setPressVoltar(false); }}
    onMouseDown={() => setPressVoltar(true)}
    onMouseUp={() => setPressVoltar(false)}
    style={{
      position: 'relative',
      top: '-390px',
      margin: '16px 24px 0 300px',
      cursor: 'pointer',
      fontWeight: 'bold',
      userSelect: 'none',
      display: 'inline-block',        // <- importante
      padding: '4px 8px',             // hitbox só no texto
      color: hoverVoltar ? '#F47B35' : '#004D51',
      fontSize: '20px',
      zIndex: 2,
      transition: 'transform 0.15s ease, color 0.15s ease',
      transformOrigin: 'left center', // não “pula” quando escala
      transform: pressVoltar ? 'scale(0.92)' : 'scale(1)',
      textShadow: hoverVoltar ? '0 0 6px rgba(244,123,53,0.35)' : 'none',
    }}
  >
    ← Voltar
  </div>
)}
 {abaSelecionada === 'aulasGratuitas' && !professorClicado && (
  <div style={{ display:'flex', justifyContent:'center',
  gap:'70px',position:'relative',top:'-280px', margin:'24px 24px 40px 250px' }}>
    
    {/* BLOCO DO PORTUGUÊS */}
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 
      'center', gap: '12px' }}>
      <div
        onClick={() => {setMateriaSelecionada('portugues')
        setMostrarAssuntos(true);}}
        style={{
          backgroundColor: '#004D51',
          padding: '50px',
          borderRadius: '12px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '18px',
          textAlign: 'center',
          width: '220px',
          height: '200px',
          cursor: 'pointer'
        }}
      >
        Português
      </div>

      {/* CARDS DOS PROFESSORES */}
      {materiaSelecionada === 'portugues' && (
        <>
          {[1, 2, 3].map((_, index) => (
            <div key={index}
            onClick={handleClickProfessor}
             style={{
              backgroundColor: '#F47B35',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '12px',
              padding: '12px',
              width: '220px',
              textAlign: 'center'
            }}>
              Prof: ex
            </div>
          ))}
        </>
      )}
    </div>

   {/* BLOCO DO MATEMÁTICA */}
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
  <div
    onClick={() => {setMateriaSelecionada('matematica')
    setMostrarAssuntos(true);}}
    style={{
      backgroundColor: '#004D51',
      padding: '50px',
      borderRadius: '12px',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '18px',
      textAlign: 'center',
      width: '220px',
      height: '200px',
      cursor: 'pointer'
    }}
  >
    Matemática
  </div>

  {/* CARDS DOS PROFESSORES DE MATEMÁTICA */}
  {materiaSelecionada === 'matematica' && (
    <>
      {[1, 2, 3].map((_, index) => (
        <div key={index} 
         onClick={handleClickProfessor}
         style={{
          backgroundColor: '#F47B35',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '12px',
          padding: '12px',
          width: '220px',
          textAlign: 'center'
        }}>
          Prof: ex
        </div>
      ))}
    </>
  )}
</div>
</div>
  )}
  {abaSelecionada==='aulasGratuitas' && professorClicado && assuntoSelecionado===''&& (
  <div style={{ textAlign:'center',position:'relative',top:'-240px', margin:'-24px 24px 0 250px' }}>
    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#004D51' }}>
      Escolha um assunto
    </h2>

    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginTop: '30px',
      flexWrap: 'wrap',
      maxWidth:'660px',
      margin:'30px auto'
    }}>
      {[ 'Assunto 1', 'Assunto 2', 'Assunto 3','Assunto 4','Assunto 5','Assunto 6' ].map((assunto, index) => (
        <div key={index}
        onClick={()=> setAssuntoSelecionado(assunto)} style={{
          backgroundColor: '#F47B35',
          padding: '30px',
          width: '200px',
          borderRadius: '12px',
          color: 'white',
          fontWeight: 'bold',
          textAlign: 'center',
          cursor:'pointer'
        }}>
          {assunto}
        </div>
      ))}
    </div>
  </div>
  )}
  {abaSelecionada === 'aulasGratuitas' && professorClicado &&
   assuntoSelecionado !== ''
   && aulaSelecionada===''&& (

  <div style={{ textAlign:'center',position:'relative',top:'-290px', margin:'24px 24px 40px 250px' }}>
    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#004D51', marginBottom: '40px' }}>
      Escolha uma aula
    </h2>

    {[1, 2, 3, 4, 5].map((aula, index) => (
      <div  key={index}
       onClick={() => setAulaSelecionada("Aula" + (index + 1) + ": Título da aula")}
  style={{
        backgroundColor: '#F9F9F9',
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '20px',
        margin: '10px auto',
        maxWidth: '600px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#004D51',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold'
          }}>
            ▶
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 'bold' }}>Aula {index + 1}: Título da aula</div>
           
          </div>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#004D51' }}>
          05:{Math.floor(Math.random() * 59).toString().padStart(2, '0')}
        </div>
      </div>
    ))}
  </div>
   )}
  {abaSelecionada === 'aulasGratuitas' && aulaSelecionada !== '' && (
  <div style={{ textAlign:'center',position:'relative',top:'-290px', margin:'24px 24px 40px 250px' }}>

    {/* Simulação de um player de vídeo */}
    <div style={{
      backgroundColor: 'black',
      width: '640px',
      height: '360px',
      margin: '0 auto',
      borderRadius: '12px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '18px',
      fontWeight: 'bold'
    }}>
      🎥 Vídeo da aula aqui
    </div>
 <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#004D51',
         marginBottom: '40px',marginTop:'20px'}}>
      {aulaSelecionada}
    </h2>
   {/* Estrelas de avaliação */}
<div style={{
  display:'flex',
  justifyContent:'center',
  marginTop:'20px',
  marginBottom:'40px',
  marginLeft:'390px'
}}>
  <div style={{
    backgroundColor: '#F47B35',
    borderRadius: '12px',
    padding: '8px 24px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
  }}>
    {[1, 2, 3, 4, 5].map((estrela) => (
      <span
        key={estrela}
        onClick={() => setNotaEstrela(estrela)}
        style={{
          fontSize: '35px',
          color: estrela <= notaEstrela ? '#FFD700' : '#fff',
          cursor: 'pointer'
        }}
      >
        ★
      </span>
    ))}
  </div>
</div>
</div>

)}
{abaSelecionada === 'configuracoes' && (
  <div style={{ position:'relative', top:'-460px', margin:'24px 24px 40px 250px' }}>
    {/* Frase breve sobre as configurações */}
    <div style={{ fontSize: '32px', color: '#015C63', marginBottom: '130px'}}>
      Aqui você personaliza sua conta. Gerencie sua senha e dados da conta.
    </div>

    {/* HEADER das sub-abas com linha base e indicador azul no ativo */}
    <div
  role="tablist"
  aria-label="Configurações"
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
    { id:'dados', label:'Alterar Dados da conta' },
    { id:'excluir', label:'Excluir minha conta' },
  ].map(t => {
    const ativo = cfgTab === (t.id as any);
    return (
      <div
        key={t.id}
        role="tab"
        aria-selected={ativo}
        onClick={() => setCfgTab(t.id as any)}
        style={{
          cursor:'pointer',
          padding:'6px 0',
          color: ativo ? '#000' : '#3f6a71',   // só fica preto quando selecionado
          fontWeight: ativo ? 900 : 700,
          fontSize: ativo ? 17 : 16,           // só aumenta quando selecionado
          position:'relative',
          userSelect:'none'                    // evita selecionar texto sem querer
        }}
      >
        {t.label}
        {ativo && (
          <span style={{
            position:'absolute',
            left:0, right:0, bottom:-7,
            height:3,
            borderRadius:2,
            background:'#2AB0BF',
            transition: 'left 0.3s ease'
          }} />
        )}
      </div>
    );
  })}
</div>

    {/* ===== Alterar senha ===== */}
    {cfgTab === 'senha' && (
      <div style={{
        background:'#fff', borderRadius:12, boxShadow:'0 6px 20px rgba(0,0,0,0.08)',
        padding:24, maxWidth:780
      }}>
        <div style={{ fontSize:22, fontWeight:800, color:'#013440', marginBottom:6 }}>Alterar senha</div>
        <div style={{ fontSize:14, opacity:.75, marginBottom:16 }}>
          Defina uma nova senha segura.
        </div>

        {msgSenhaErr && (
          <div style={{ background:'#ffe8e8', border:'1px solid #ffcccc', color:'#7a1d1d',
            borderRadius:10, padding:'10px 12px', marginBottom:12 }}>{msgSenhaErr}</div>
        )}
        {msgSenhaOk && (
          <div style={{ background:'#e8fff1', border:'1px solid #bdf0d4', color:'#0f7a4a',
            borderRadius:10, padding:'10px 12px', marginBottom:12 }}>{msgSenhaOk}</div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#013440', marginBottom:6 }}>Senha atual</div>
            <input type="password" value={pwd.atual}
              onChange={(e)=>setPwd(p=>({...p,atual:e.target.value}))}
              placeholder="••••••••"
              style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #C5D7D9' }} />
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#013440', marginBottom:6 }}>Nova senha</div>
            <input type="password" value={pwd.nova}
              onChange={(e)=>setPwd(p=>({...p,nova:e.target.value}))}
              placeholder="Mínimo 8 caracteres"
              style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #C5D7D9' }} />
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#013440', marginBottom:6 }}>Confirmar nova senha</div>
            <input type="password" value={pwd.confirma}
              onChange={(e)=>setPwd(p=>({...p,confirma:e.target.value}))}
              placeholder="Repita a nova senha"
              style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #C5D7D9' }} />
          </div>
        </div>

        <div style={{ display:'flex', gap:12, marginTop:16, flexWrap:'wrap' }}>
          
            <button onClick={alterarSenha}
            style={{ background:'#F47B35', color:'#fff', border:'none', padding:'12px 18px',
            borderRadius:12, fontWeight:800, cursor:'pointer', boxShadow:'0 6px 14px rgba(244,123,53,.25)' }}>
            Salvar
          </button>
        </div>
      </div>
    )}

    {/* ===== Alterar Dados da conta ===== */}
    {cfgTab === 'dados' && (
      <form onSubmit={salvarDadosConta}
        style={{
          background:'#fff', borderRadius:12, boxShadow:'0 6px 20px rgba(0,0,0,0.08)',
          padding:24, maxWidth:780
        }}>
        <div style={{ fontSize:22, fontWeight:800, color:'#013440', marginBottom:6 }}>Alterar Dados da conta</div>
        <div style={{ fontSize:14, opacity:.75, marginBottom:16 }}>
          Atualize seu nome e e-mail. Confirme com sua senha atual.
        </div>

        {msgDadosErr && (
          <div style={{ background:'#ffe8e8', border:'1px solid #ffcccc', color:'#7a1d1d',
            borderRadius:10, padding:'10px 12px', marginBottom:12 }}>{msgDadosErr}</div>
        )}
        {msgDadosOk && (
          <div style={{ background:'#e8fff1', border:'1px solid #bdf0d4', color:'#0f7a4a',
            borderRadius:10, padding:'10px 12px', marginBottom:12 }}>{msgDadosOk}</div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#013440', marginBottom:6 }}>Nome do usuário</div>
            <input value={cfg.nome} onChange={(e)=>setCfg(c=>({...c,nome:e.target.value}))}
              placeholder="Seu nome"
              style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #C5D7D9' }} />
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#013440', marginBottom:6 }}>E-mail</div>
            <input type="email" value={cfg.email} onChange={(e)=>setCfg(c=>({...c,email:e.target.value}))}
              placeholder="seuemail@exemplo.com"
              style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #C5D7D9' }} />
          </div>
        </div>

        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#013440', marginBottom:6 }}>
            Para confirmar a alteração, digite sua senha
          </div>
          <input type="password" value={cfg.senhaConfirmacao}
            onChange={(e)=>setCfg(c=>({...c, senhaConfirmacao:e.target.value}))}
            placeholder="••••••"
            style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #C5D7D9' }} />
          <div onClick={esqueciSenha}
            style={{ color:'#026873', fontWeight:700, textDecoration:'underline', cursor:'pointer', marginTop:8 }}>
            Esqueci a senha
          </div>
        </div>

        <button type="submit"
          style={{ marginTop:16, background:'#F47B35', color:'#fff', border:'none',
          padding:'12px 18px', borderRadius:12, fontWeight:800, cursor:'pointer',
          boxShadow:'0 6px 14px rgba(244,123,53,.25)' }}>
          Salvar
        </button>
      </form>
    )}

    {/* ===== Excluir minha conta ===== */}
    {cfgTab === 'excluir' && (
      <div style={{
        background:'#fff', borderRadius:12, boxShadow:'0 6px 20px rgba(0,0,0,0.08)',
        padding:24, maxWidth:780
      }}>
        <div style={{ fontSize:22, fontWeight:800, color:'#013440', marginBottom:6 }}>Excluir minha conta</div>
        <div style={{ fontSize:14, opacity:.75, marginBottom:12 }}>
          <b>Atenção:</b> esta ação é permanente. Você perderá acesso à conta e histórico.
        </div>
        <div style={{
          background:'#fff5f2', border:'1px solid #ffd8cc', color:'#8a2a0a',
          borderRadius:12, padding:16
        }}>
          <div style={{ marginBottom:12 }}>
            Para confirmar, clique no botão abaixo. Pediremos uma confirmação final.
          </div>
          <button
            onClick={()=>{ setExcluirTexto(''); setExcluirOpen(true); }}
            style={{ background:'#E5484D', color:'#fff', border:'none',
            padding:'12px 18px', borderRadius:12, fontWeight:800, cursor:'pointer',
            boxShadow:'0 6px 14px rgba(229,72,77,.25)' }}>
            Excluir minha conta
          </button>
        </div>
      </div>
    )}

    {/* Modal de exclusão */}
    {excluirOpen && (
      <div onClick={()=>setExcluirOpen(false)}
        style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex',
        alignItems:'center', justifyContent:'center', zIndex:999 }}>
        <div onClick={(e)=>e.stopPropagation()}
          style={{ width:'min(520px,92vw)', background:'#fff', borderRadius:16, padding:20,
          boxShadow:'0 12px 40px rgba(0,0,0,.25)' }}>
          <div style={{ fontSize:18, fontWeight:900, color:'#013440', marginBottom:8 }}>
            Confirmar exclusão
          </div>
          <div style={{ marginBottom:12 }}>
            Digite <b>EXCLUIR MINHA CONTA</b> para confirmar. Esta ação é irreversível.
          </div>
          <input value={excluirTexto} onChange={(e)=>setExcluirTexto(e.target.value)}
            placeholder="EXCLUIR MINHA CONTA"
            style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #C5D7D9' }} />
          <div style={{ display:'flex', gap:12, marginTop:16 }}>
            <button onClick={()=>setExcluirOpen(false)}
              style={{ background:'#fff', color:'#026873', border:'1px solid #C5D7D9',
              padding:'12px 18px', borderRadius:12, fontWeight:800, cursor:'pointer' }}>
              Cancelar
            </button>
            <button onClick={excluirDefinitivo}
              disabled={excluirTexto !== 'EXCLUIR MINHA CONTA'}
              style={{ background: excluirTexto === 'EXCLUIR MINHA CONTA' ? '#E5484D' : '#ff9ea1',
              color:'#fff', border:'none', padding:'12px 18px', borderRadius:12,
              fontWeight:800, cursor: excluirTexto === 'EXCLUIR MINHA CONTA' ? 'pointer' : 'not-allowed' }}>
              Confirmar exclusão
            </button>
          </div>
          <div style={{ fontSize:12, opacity:.7, marginTop:6 }}>
            No backend exigiremos reautenticação antes de excluir.
          </div>
        </div>
      </div>
    )}
  </div>
)}
{forgotOpen && (
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
            setForgotOpen(false);
            setFpMsgErr(null);
            setFpMsgOk(null);
            setFpStep(1);
            setFpToken('');
            setFpExpiresAt(null);
            setFpSecondsLeft(0);
          }}
          style={{ background:'none', border:'none', fontSize:20, cursor:'pointer' }}
        >
          ×
        </button>
      </div>

      {/* mensagens */}
      {fpMsgErr && (
        <div style={{ background:'#ffebee', color:'#c62828', padding:'8px 12px', borderRadius:8, marginTop:12 }}>
          {fpMsgErr}
        </div>
      )}
      {fpMsgOk && (
        <div style={{ background:'#e8f5e9', color:'#2e7d32', padding:'8px 12px', borderRadius:8, marginTop:12 }}>
          {fpMsgOk}
        </div>
      )}

      {/* STEP 1: mandar código */}
      {fpStep === 1 && (
        <form onSubmit={handleForgotSendCode} style={{ marginTop:16, display:'grid', gap:12 }}>
          <label style={{ fontWeight:600 }}>E-mail da conta</label>
          <input
            type="email"
            value={fpEmail}
            onChange={e => setFpEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            style={{ padding:12, borderRadius:8, border:'1px solid #ccc' }}
          />
          <button type="submit" className="btn-orange" style={{ padding:'10px 16px', borderRadius:8, border:'none', cursor:'pointer' }}>
            Enviar código para o e-mail
          </button>
        </form>
      )}

      {/* STEP 2: confirmar código + nova senha */}
      {fpStep === 2 && (
        <form onSubmit={handleForgotConfirm} style={{ marginTop:16, display:'grid', gap:12 }}>
          <label style={{ fontWeight:600 }}>Código recebido por e-mail</label>
          <input
            type="text"
            value={fpToken}
            onChange={e => setFpToken(e.target.value)}
            placeholder="Ex: 123456"
            style={{ padding:12, borderRadius:8, border:'1px solid #ccc' }}
          />

          {/* contador + reenviar */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:12, opacity:.7 }}>
              Código expira em {fpSecondsLeft}s
            </div>
            <button
              type="button"
              onClick={handleForgotResend}
              disabled={fpSecondsLeft > 0}
              style={{
                padding:'6px 10px',
                borderRadius:8,
                border:'1px solid #ccc',
                background: fpSecondsLeft > 0 ? '#eee' : '#fff',
                cursor: fpSecondsLeft > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Reenviar código
            </button>
          </div>

          <label style={{ fontWeight:600 }}>Nova senha</label>
          <input
            type="password"
            value={fpNewPass}
            onChange={e => setFpNewPass(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            style={{ padding:12, borderRadius:8, border:'1px solid #ccc' }}
          />

          <label style={{ fontWeight:600 }}>Confirmar nova senha</label>
          <input
            type="password"
            value={fpNewPass2}
            onChange={e => setFpNewPass2(e.target.value)}
            placeholder="Repita a nova senha"
            style={{ padding:12, borderRadius:8, border:'1px solid #ccc' }}
          />

          <div style={{ display:'flex', gap:12, marginTop:8 }}>
            <button
              type="submit"
              className="btn-orange"
              disabled={fpExpiresAt !== null && Date.now() > fpExpiresAt}
              style={{
                padding:'10px 16px',
                borderRadius:8,
                border:'none',
                cursor: (fpExpiresAt !== null && Date.now() > fpExpiresAt) ? 'not-allowed' : 'pointer',
                opacity: (fpExpiresAt !== null && Date.now() > fpExpiresAt) ? .6 : 1
              }}
            >
              Redefinir senha
            </button>
            <button
              type="button"
              onClick={() => {
                setForgotOpen(false);
                setFpMsgErr(null);
                setFpMsgOk(null);
                setFpStep(1);
                setFpToken('');
                setFpExpiresAt(null);
                setFpSecondsLeft(0);
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
{/* FOOTER simples */}
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
    <a href="#" onClick={(e) => { e.preventDefault(); setAbaSelecionada('visaoGeral'); }}>Visão geral</a>
    <a href="#" onClick={(e) => { e.preventDefault(); setAbaSelecionada('minhaJornada'); }}>Minha jornada</a>
    <a href="#" onClick={(e) => { e.preventDefault(); setAbaSelecionada('aulasGratuitas'); }}>Aulas gratuitas</a>
  </div>

  {/* Texto © posicionado sem aumentar altura */}
  <div
    style={{
      position: 'absolute',
      bottom: '10px', // distância da base do footer
      left: '20px'    // ou "center" se quiser centralizado
    }}
  >
    © 2025 Concursos Aqui.
  </div>

  {/* Redes sociais fixas no canto inferior direito */}
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

</div>

  </>
  );
};
      
export default CandidatoPage;