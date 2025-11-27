import Header from '../components/Header';
import { useState, useRef} from 'react';

export default function AuthPage() {
  const [tipoUsuario, setTipoUsuario] =
    useState<'candidato' | 'professor'>('candidato');
  const [modo, setModo] =
    useState<'login' | 'cadastro'>('login');

  const [areaSelecionada, setAreaSelecionada] = useState<string | null>(null);
  const [gravacoesSelecionadas, setGravacoesSelecionadas] = useState<string[]>([]);

  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [formacao, setFormacao] = useState('');
  const [linkCurriculo, setLinkCurriculo] = useState('');
const fileInputRef = useRef<HTMLInputElement>(null);
const [fotoNome, setFotoNome] = useState<string | null>(null);
function resetProfessorForm() {
  setNomeCompleto('');
  setEmail('');
  setSenha('');
  setAreaSelecionada(null);
  setGravacoesSelecionadas([]);
  setFormacao('');
  setLinkCurriculo('');
  setFotoPerfil('');
  setFotoNome(null);
  if (fileInputRef.current) fileInputRef.current.value = '';

  // flags de validação/tocado
  setNomeTocado(false);
  setEmailTocado(false);
  setSenhaTocado(false);
  setAreaTocada(false);
  setGravacoesTocadas(false);
  setFormacaoTocada(false);
  setLinkTocado(false);
}

function resetCandidatoForm() {
  setNomeCompleto('');
  setEmail('');
  setSenha('');

  // flags de validação/tocado
  setNomeTocado(false);
  setEmailTocado(false);
  setSenhaTocado(false);
}
  const handleCadastroCandidato = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resposta = await fetch('http://localhost:3001/candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeCompleto,
          email,
          senha
        })
      });

      if (resposta.ok) {
        alert('Candidato cadastrado com sucesso!');
        resetCandidatoForm();
      } else {
        alert('Erro ao cadastrar. Tente novamente.');

      }
    } catch (err) {
      console.error('Erro no cadastro do candidato:', err);
      alert('Erro na conexão. Tente novamente.');
    }
  };

  const [erroLoginCandidato, setErroLoginCandidato] = useState<string | null>(null);

  const handleLoginCandidato = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLoginCandidato(null);

    try {
      const resp = await fetch('http://localhost:3001/candidatos/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      if (!resp.ok) {
        let msg = 'Email ou senha inválidos.';
        try {
          const j = await resp.json();
          msg = j.mensagem || msg;
        } catch {}
        setErroLoginCandidato(msg);
        return;
      }

      const dados = await resp.json();
      localStorage.setItem('candidato', JSON.stringify({
        id: dados.id,
        nome: dados.nome,
        email: dados.email,
        foto: dados.foto_perfil
      }));

      window.location.href = '/candidato';
    } catch (err) {
      setErroLoginCandidato('Falha de conexão. Tente novamente.');
    }
  };

  const handleCadastroProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    // normaliza para os valores aceitos no SET do banco
const metodosDB = gravacoesSelecionadas.map(m =>
  m === 'Gravação de tela' ? 'Tela' : m
);
    try {
      const resposta = await fetch('http://localhost:3001/professores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeCompleto.split(' ')[0],
          sobrenome: nomeCompleto.split(' ').slice(1).join(' '),
          email,
          senha,
          area_atuacao: areaSelecionada,
          foto_perfil: fotoPerfil,
          formacao,
          link_curriculo: linkCurriculo,
          metodo_gravacao:metodosDB.join(',')
        })
      });

      if (resposta.ok) {
        alert('Seu cadastro foi enviado para análise!');
        resetProfessorForm();
      } else {
        alert('Erro ao cadastrar. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao enviar cadastro:', err);
      alert('Erro ao enviar cadastro. Verifique sua conexão.');
    }
  };

 const handleLoginProfessor = async (e: React.FormEvent) => {
  e.preventDefault();
  setErroLoginProfessorMsg(null); // limpa a caixa antes de tentar

  try {
    const resposta = await fetch('http://localhost:3001/professores/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    if (!resposta.ok) {
      // força a mensagem desejada
      setErroLoginProfessorMsg('E-mail ou senha inválidos.');
      return;
    }

    const dados = await resposta.json();
    localStorage.setItem('professorLogado', JSON.stringify(dados.professor));
    localStorage.setItem('tokenProfessor', dados.token);
    window.location.href = '/professor';
  } catch (error) {
    setErroLoginProfessorMsg('Falha de conexão. Tente novamente.');
  }
};
  // ---- Estados de "tocado" e validações ----
  const [nomeTocado, setNomeTocado] = useState(false);
  const [emailTocado, setEmailTocado] = useState(false);
  const [senhaTocado, setSenhaTocado] = useState(false);

  const emailEhValido = email.includes('@') && email.includes('gmail.com');
  const senhaEhValida = senha.length >= 8;

  const formularioValido =
    nomeCompleto.trim() !== '' &&
    emailEhValido &&
    senhaEhValida;

  const [emailLoginTocado, setEmailLoginTocado] = useState(false);
  const [senhaLoginTocado, setSenhaLoginTocado] = useState(false);

  // ---- Estados "tocado" do professor ----
  const [areaTocada, setAreaTocada] = useState(false);
  const [gravacoesTocadas, setGravacoesTocadas] = useState(false);

  // >>> ÚNICAS versões de toggleArea/toggleGravacao 
  const toggleArea = (area: string) => {
    setAreaSelecionada(area);
    setAreaTocada(true);
  };

  const toggleGravacao = (opcao: string) => {
    setGravacoesSelecionadas(prev =>
      prev.includes(opcao) ? prev.filter(o => o !== opcao) : [...prev, opcao]
    );
    setGravacoesTocadas(true);
  };

  // regra para habilitar o botão do professor
  const cadastroProfessorValido =
    nomeCompleto.trim() !== '' &&
    emailEhValido &&
    senhaEhValida &&
    !!areaSelecionada &&
    gravacoesSelecionadas.length > 0 &&
    formacao.trim()!==""&&
    linkCurriculo.trim()!==""&&
  fotoPerfil.trim()!=="";
    // TOUCHED do login do professor
const [emailProfLoginTocado, setEmailProfLoginTocado] = useState(false);
const [senhaProfLoginTocado, setSenhaProfLoginTocado] = useState(false);

// mensagem de erro vinda da API no login do professor
const [erroLoginProfessorMsg, setErroLoginProfessorMsg] = useState<string|null>(null);
const [formacaoTocada, setFormacaoTocada] = useState(false);
const [linkTocado, setLinkTocado] = useState(false);

const onChangeFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Por favor, envie apenas arquivos de imagem (.jpg, .png, etc.)');
    if (fileInputRef.current) fileInputRef.current.value = '';
    return;
  }

  setFotoNome(file.name);
  const reader = new FileReader();
  reader.onloadend = () => {
    if (typeof reader.result === 'string') {
      setFotoPerfil(reader.result); // BASE64, BASE64, BASE64
    }
  };
  reader.readAsDataURL(file);
};

const removerFoto = () => {
  setFotoPerfil('');
  setFotoNome(null);
  if (fileInputRef.current) fileInputRef.current.value = '';
};

 return (
   <> <Header minimal />

<main style={{
    display: 'flex',
    minHeight: '100vh',
    overflow: 'visible'
  }}>
    {/* Formulário à ESQUERDA */}
   <div style={{
  width: '50%',
  padding: '60px 40px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '30px',
  overflowY: 'auto',
  position: 'relative'
}}>
  {/* TOPO FIXO COM BOTÕES */}
  <div style={{
    position: 'sticky',
    top: 0,
    background: 'white',
    paddingBottom: '20px',
    zIndex: 10
  }}>
    {/* Seletor de tipo de usuário */}
    <div style={{
      display: 'flex',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#f5f5f5',
      width: '390px',
      justifyContent: 'center'
    }}>
      <button
        onClick={() => setTipoUsuario('candidato')}
        style={{
          flex: 1,
          backgroundColor: tipoUsuario === 'candidato' ? '#F28241' : '#FBDDC9',
          fontWeight: tipoUsuario === 'candidato' ? 'bold' : 'normal',
          fontSize: tipoUsuario === 'candidato' ? '18px' : '16px',
          border: 'none',
          padding: '12px 20px',
          cursor: 'pointer',
          transition: 'font-size 0.2s ease'
        }}>
        Sou Candidato
      </button>
      <button
        onClick={() => setTipoUsuario('professor')}
        style={{
          flex: 1,
          backgroundColor: tipoUsuario === 'professor' ? '#F28241' : '#FBDDC9',
          fontWeight: tipoUsuario === 'professor' ? 'bold' : 'normal',
          fontSize: tipoUsuario === 'professor' ? '18px' : '16px',
          border: 'none',
          padding: '12px 20px',
          cursor: 'pointer',
          transition: 'font-size 0.2s ease'
        }}>
        Sou Professor
      </button>
    </div>

    {/* Abas Entrar / Cadastrar */}
    <div style={{ 
      position: 'relative',
      marginTop:'70px', 
      marginBottom: '10px', 
      width: '220px',
      marginLeft:'auto',
      marginRight:'auto' 
      }}>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        position:'relative',
        zIndex: 2,
      }}>
        <span
          onClick={() => setModo('login')}
          style={{
            fontWeight: modo === 'login' ? 'bold' : 'normal',
            fontSize: modo === 'login' ? '16.5px' : '15.5px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'center',
            transition: 'transform 0.1s ease',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Entrar
        </span>
        <span
          onClick={() => setModo('cadastro')}
          style={{
            fontWeight: modo === 'cadastro' ? 'bold' : 'normal',
            fontSize: modo === 'cadastro' ? '16.5px' : '15.5px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'center',
            transition: 'transform 0.1s ease',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Cadastrar
        </span>
      </div>
      <div style={{
        position: 'absolute',
        bottom: -4,
        left: 0,
        height: '2px',
        width: '100%',
        backgroundColor: '#ccc',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -4,
        left: modo === 'login' ? '0%' : '50%',
        height: '2px',
        width: '50%',
        backgroundColor: '#2AB0BF',
        transition: 'left 0.3s ease',
      }} />
    </div>
  </div>


  {/* FORMULÁRIOS */}  
  {(modo === 'login' && tipoUsuario === 'candidato') && (  
  <form onSubmit={handleLoginCandidato}
        style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', width:'100%' }}> 

    <button style={{ padding:'10px 20px', borderRadius:'8px', boxShadow:'3px 3px 6px rgba(0,0,0,0.2)', border:'none', background:'white', cursor:'pointer' }}>  
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google"
           style={{ height:'20px', marginRight:'8px', verticalAlign:'middle' }} />  
      Entrar pelo Google  
    </button>  

    <p style={{ fontSize:'14px', color:'#555' }}>ou conecte-se com o seu email:</p>  

    {/* EMAIL */}
    <input
      type="email"
      placeholder="Seu email"
      value={email}
      onChange={(e) => {setEmail(e.target.value);
    setErroLoginCandidato(null);}}
      onBlur={() => setEmailLoginTocado(true)}
      style={{
        backgroundColor:'#C5D7D9',
        padding:'14px',
        borderRadius:'8px',
        maxWidth:'320px',
        width:'100%',
        border: emailLoginTocado
          ? (emailEhValido ? '2px solid green' : '2px solid red')
          : '1px solid #ccc'
      }}
    />
    {emailLoginTocado && email.trim() === '' && (
      <span style={{ color:'red', fontSize:'13px' }}>Campo obrigatório.</span>
    )}
    {emailLoginTocado && email.trim() !== '' && !emailEhValido && (
      <span style={{ color:'red', fontSize:'13px' }}>
        Digite um email válido (ex: seuemail@gmail.com).
      </span>
    )}

    {/* SENHA */}
    <input
      type="password"
      placeholder="Sua senha"
      value={senha}
      onChange={(e) => {setSenha(e.target.value);
      setErroLoginCandidato(null);}}

      onBlur={() => setSenhaLoginTocado(true)}
      style={{
        backgroundColor:'#C5D7D9',
        padding:'14px',
        borderRadius:'8px',
        maxWidth:'320px',
        width:'100%',
        border: senhaLoginTocado
          ? (senhaEhValida ? '2px solid green' : '2px solid red')
          : '1px solid #ccc'
      }}
    />
    {senhaLoginTocado && senha.trim() === '' && (
      <span style={{ color:'red', fontSize:'13px' }}>Campo obrigatório.</span>
    )}
    {senhaLoginTocado && senha.trim() !== '' && !senhaEhValida && (
      <span style={{ color:'red', fontSize:'13px' }}>
        Deve ter 8 caracteres ou mais.
      </span>
    )}

    {/* BOTÃO ENTRAR — recomendado: só habilita quando válido */}
    <button
      type="submit"
      className="btn-dark"
      disabled={!(emailEhValido && senhaEhValida)}
      style={{
        opacity: (emailEhValido && senhaEhValida) ? 1 : 0.5,
        cursor: (emailEhValido && senhaEhValida) ? 'pointer' : 'not-allowed'
      }}
    >
      Entrar
    </button>

    <div style={{ width:'100%', textAlign:'right' }}>
      <p style={{ fontSize:'13px', color:'#2AB0BF', marginRight:'150px', display:'inline-block' }}>
        Esqueci a senha
      </p>
    </div>
    {erroLoginCandidato && (
  <div style={{
    width: '100%',
    maxWidth: 520,
    background: '#E53935',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600
  }}>
    <span>✖</span> {erroLoginCandidato}
  </div>
)}
  </form>  
)}

 {(modo === 'login' && tipoUsuario === 'professor') && (
  <form onSubmit={handleLoginProfessor} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', width:'100%' }}>
    {/* EMAIL */}
    <input
      type="email"
      placeholder="E-mail"
      value={email}
      onChange={(e) => { setEmail(e.target.value); setErroLoginProfessorMsg(null); }}
      onBlur={() => setEmailProfLoginTocado(true)}
      style={{
        backgroundColor:'#C5D7D9',
        padding:'14px',
        borderRadius:'8px',
        maxWidth:'320px',
        width:'100%',
        border: emailProfLoginTocado
          ? (emailEhValido ? '2px solid green' : '2px solid red')
          : '1px solid #ccc'
      }}
    />
    {emailProfLoginTocado && email.trim() === '' && (
      <span style={{ color:'red', fontSize:'13px' }}>Campo obrigatório.</span>
    )}
    {emailProfLoginTocado && email.trim() !== '' && !emailEhValido && (
      <span style={{ color:'red', fontSize:'13px' }}>
        Digite um email válido (ex: seuemail@gmail.com).
      </span>
    )}

    {/* SENHA */}
    <input
      type="password"
      placeholder="Senha"
      value={senha}
      onChange={(e) => { setSenha(e.target.value); setErroLoginProfessorMsg(null); }}
      onBlur={() => setSenhaProfLoginTocado(true)}
      style={{
        backgroundColor:'#C5D7D9',
        padding:'14px',
        borderRadius:'8px',
        maxWidth:'320px',
        width:'100%',
        border: senhaProfLoginTocado
          ? (senhaEhValida ? '2px solid green' : '2px solid red')
          : '1px solid #ccc'
      }}
    />
    {senhaProfLoginTocado && senha.trim() === '' && (
      <span style={{ color:'red', fontSize:'13px' }}>Campo obrigatório.</span>
    )}
    {senhaProfLoginTocado && senha.trim() !== '' && !senhaEhValida && (
      <span style={{ color:'red', fontSize:'13px' }}>Deve ter 8 caracteres ou mais.</span>
    )}

    {/* BOTÃO ENTRAR — igual ao do candidato */}
    <button
      type="submit"
      className="btn-dark"
      disabled={!(emailEhValido && senhaEhValida)}
      style={{
        opacity: (emailEhValido && senhaEhValida) ? 1 : 0.5,
        cursor: (emailEhValido && senhaEhValida) ? 'pointer' : 'not-allowed'
      }}
    >
      Entrar
    </button>

    <div style={{ width:'100%', textAlign:'right' }}>
      <p style={{ fontSize:'13px', color:'#2AB0BF', marginRight:'150px', display:'inline-block' }}>
        Esqueci a senha
      </p>
    </div>

    {/* CAIXA VERMELHA DE ERRO DA API */}
    {erroLoginProfessorMsg && (
      <div style={{
        width: '100%',
        maxWidth: 520,
        background: '#E53935',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: 600
      }}>
        <span>✖</span> {erroLoginProfessorMsg}
      </div>
    )}
  </form>
)}

  {(modo === 'cadastro' && tipoUsuario === 'candidato') && (  
    <form onSubmit={handleCadastroCandidato} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
       <button style={{ padding: '10px 20px', borderRadius: '8px', boxShadow: '3px 3px 6px rgba(0,0,0,0.2)', border: 'none', background: 'white', cursor: 'pointer' }}>
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ height: '20px', marginRight: '8px', verticalAlign: 'middle' }} />
      Cadastrar-se pelo Google
    </button>
    <p style={{ fontSize: '14px', color: '#555' }}>ou cadastre-se com o seu email:</p>
  
     <input
  type="text"
  placeholder="Nome e Sobrenome"
  value={nomeCompleto}
  onChange={(e) => setNomeCompleto(e.target.value)}
  onBlur={() => setNomeTocado(true)}
  style={{
    backgroundColor: '#C5D7D9',
    padding: '14px',
    borderRadius: '8px',
    maxWidth: '320px',
    width: '100%',
    border: nomeTocado
      ? nomeCompleto
        ? '2px solid green'
        : '2px solid red'
      : '1px solid #ccc'
  }}
/>
{nomeTocado && !nomeCompleto && (
  <span style={{ color: 'red', fontSize: '13px' }}>Campo obrigatório.</span>
)}
     <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onBlur={() => setEmailTocado(true)}
  style={{
    backgroundColor: '#C5D7D9',
    padding: '14px',
    borderRadius: '8px',
    maxWidth: '320px',
    width: '100%',
    border: emailTocado
      ? emailEhValido
        ? '2px solid green'
        : '2px solid red'
      : '1px solid #ccc'
  }}
/>
{emailTocado && email.trim() === '' && (
  <span style={{ color: 'red', fontSize: '13px' }}>Campo obrigatório.</span>
)}
{emailTocado && email.trim() !== '' && !emailEhValido && (
  <span style={{ color: 'red', fontSize: '13px' }}>Digite um email válido (ex: seuemail@gmail.com).</span>
)}
     <input
  type="password"
  placeholder="Senha - Mínimo 8 caracteres"
  value={senha}
  onChange={(e) => setSenha(e.target.value)}
  onBlur={() => setSenhaTocado(true)}
  style={{
    backgroundColor: '#C5D7D9',
    padding: '14px',
    borderRadius: '8px',
    maxWidth: '320px',
    width: '100%',
    border: senhaTocado
      ? senhaEhValida
        ? '2px solid green'
        : '2px solid red'
      : '1px solid #ccc'
  }}
/>
{senhaTocado && senha.trim() === '' && (
  <span style={{ color: 'red', fontSize: '13px' }}>Campo obrigatório.</span>
)}
{senhaTocado && senha.trim() !== '' && !senhaEhValida && (
  <span style={{ color: 'red', fontSize: '13px' }}>Deve ter 8 caracteres ou mais.</span>
)}
    
      <button
  type="submit"
  className="btn-dark"
  disabled={!formularioValido}
  style={{
    opacity: formularioValido ? 1 : 0.5,
    cursor: formularioValido ? 'pointer' : 'not-allowed'
  }}
>
  Criar conta agora
</button>
      <p style={{ fontSize: '13px', color: '#555' }}><span style={{ color: '#F28241', marginRight: '6px' }}>🔒</span>No ConcursosAqui seus dados são protegidos</p>  
    </form>  
  )}  

  {(modo === 'cadastro' && tipoUsuario === 'professor') && (
  <form
    onSubmit={handleCadastroProfessor}
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}
  >
    {/* NOME */}
    <input
      type="text"
      placeholder="Nome e Sobrenome"
      value={nomeCompleto}
      onChange={(e) => setNomeCompleto(e.target.value)}
      onBlur={() => setNomeTocado(true)}
      style={{
        backgroundColor: '#C5D7D9',
        padding: '14px',
        borderRadius: '8px',
        maxWidth: '320px',
        width: '100%',
        border: nomeTocado ? (nomeCompleto ? '2px solid green' : '2px solid red') : '1px solid #ccc'
      }}
    />
    {nomeTocado && !nomeCompleto && (
      <span style={{ color: 'red', fontSize: '13px' }}>Campo obrigatório.</span>
    )}

    {/* EMAIL */}
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      onBlur={() => setEmailTocado(true)}
      style={{
        backgroundColor: '#C5D7D9',
        padding: '14px',
        borderRadius: '8px',
        maxWidth: '320px',
        width: '100%',
        border: emailTocado ? (emailEhValido ? '2px solid green' : '2px solid red') : '1px solid #ccc'
      }}
    />
    {emailTocado && email.trim() === '' && (
      <span style={{ color: 'red', fontSize: '13px' }}>Campo obrigatório.</span>
    )}
    {emailTocado && email.trim() !== '' && !emailEhValido && (
      <span style={{ color: 'red', fontSize: '13px' }}>
        Digite um email válido (ex: seuemail@gmail.com).
      </span>
    )}

    {/* SENHA */}
    <input
      type="password"
      placeholder="Senha - Mínimo 8 caracteres"
      value={senha}
      onChange={(e) => setSenha(e.target.value)}
      onBlur={() => setSenhaTocado(true)}
      style={{
        backgroundColor: '#C5D7D9',
        padding: '14px',
        borderRadius: '8px',
        maxWidth: '320px',
        width: '100%',
        border: senhaTocado ? (senhaEhValida ? '2px solid green' : '2px solid red') : '1px solid #ccc'
      }}
    />
    {senhaTocado && senha.trim() === '' && (
      <span style={{ color: 'red', fontSize: '13px' }}>Campo obrigatório.</span>
    )}
    {senhaTocado && senha.trim() !== '' && !senhaEhValida && (
      <span style={{ color: 'red', fontSize: '13px' }}>Deve ter 8 caracteres ou mais.</span>
    )}

    {/* ÁREA */}
    <label style={{ fontWeight: 'bold', marginTop: '10px', textAlign: 'center' }}>área de atuação</label>
    <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
      {['Português', 'Matemática'].map((area) => (
        <button
          key={area}
          type="button"
          onClick={() => toggleArea(area)}
          style={{
            backgroundColor: areaSelecionada === area ? '#2AB0BF' : '#F28241',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
        >
          {area}
        </button>
      ))}
    </div>
    {areaTocada && !areaSelecionada && (
      <span style={{ color: 'red', fontSize: '13px' }}>Escolha uma área.</span>
    )}
{!fotoPerfil ? (
  // Sem foto -> mostra o input de arquivo
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={onChangeFoto}
    style={{
      backgroundColor: '#C5D7D9',
      padding: '14px',
      borderRadius: '8px',
      border: 'none',
      maxWidth: '320px',
      width: '100%',
      color: '#333',
      cursor: 'pointer'
    }}
  />
) : (
  // Com foto -> mostra nome do arquivo + botão Remover
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      background: '#C5D7D9',
      padding: '12px 14px',
      borderRadius: '8px',
      maxWidth: '320px',
      width: '100%'
    }}
  >
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {fotoNome}
    </span>
    <button
      type="button"
      onClick={removerFoto}
      style={{
        background: '#E53935',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 600
      }}
    >
      Remover
    </button>
  </div>
)}
<input
  type="text"
  placeholder="formação acadêmica"
  value={formacao}
  onChange={(e) => setFormacao(e.target.value)}
  onBlur={() => setFormacaoTocada(true)}
  style={{
    backgroundColor: '#C5D7D9',
    padding: '14px',
    borderRadius: '8px',
    maxWidth: '320px',
    width: '100%',
    border: formacaoTocada
      ? (formacao.trim() !== '' ? '2px solid green' : '2px solid red')
      : '1px solid #ccc'
  }}
/>
{formacaoTocada && formacao.trim() === '' && (
  <span style={{ color: 'red', fontSize: '13px' }}>Campo obrigatório.</span>
)}
  <input
  type="text"
  placeholder="link do linkedin talvez ou currículo"
  value={linkCurriculo}
  onChange={(e) => setLinkCurriculo(e.target.value)}
  onBlur={() => setLinkTocado(true)}
  style={{
    backgroundColor: '#C5D7D9',
    padding: '14px',
    borderRadius: '8px',
    maxWidth: '320px',
    width: '100%',
    border: linkTocado
      ? (linkCurriculo.trim() !== '' ? '2px solid green' : '2px solid red')
      : '1px solid #ccc'
  }}
/>
{linkTocado && linkCurriculo.trim() === '' && (
  <span style={{ color: 'red', fontSize: '13px' }}>Campo obrigatório.</span>
)}
    {/* GRAVAÇÕES */}
    <label style={{ fontWeight: 'bold', marginTop: '10px', textAlign: 'center' }}>
      <span style={{ color: '#F28241', marginRight: '6px' }}>✓</span>
      Como você pretende gravar suas aulas?
    </label>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        paddingBottom: '10px',
        marginBottom: '8px'
      }}
    >
      {['Webcam', 'Gravação de tela', 'Celular', 'Estúdio'].map((opcao) => (
        <button
          key={opcao}
          type="button"
          onClick={() => toggleGravacao(opcao)}
          style={{
            backgroundColor: gravacoesSelecionadas.includes(opcao) ? '#2AB0BF' : '#F28241',
            color: 'white',
            border: 'none',
            padding: '8px',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          {opcao}
        </button>
      ))}
    </div>
    {gravacoesTocadas && gravacoesSelecionadas.length === 0 && (
      <span style={{ color: 'red', fontSize: '13px' }}>Escolha pelo menos 1 método.</span>
    )}

    {/* BOTÃO */}
    <button
      type="submit"
      className="btn-dark"
      disabled={!cadastroProfessorValido}
      style={{
        opacity: cadastroProfessorValido ? 1 : 0.5,
        cursor: cadastroProfessorValido ? 'pointer' : 'not-allowed'
      }}
    >
      Criar conta agora
    </button>

    <p style={{ fontSize: '13px', color: '#555' }}>
      <span style={{ color: '#F28241', marginRight: '6px' }}>🔒</span>
      No ConcursosAqui seus dados são protegidos
    </p>
  </form>
)}
  
    </div>

   {/* Imagem com curva à DIREITA */}
<div style={{
  width: '50%',
  background: 'linear-gradient(to bottom, #014751, #014751)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  color: 'white',
  overflow: 'hidden'
}}>
  {/* Curva de cima ajustada */}
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0, // alinhamento com o topo da div
    width: '80px',
    height: '100%',
    background: 'white',
    borderTopRightRadius: '100px',
    borderBottomRightRadius: '100px',
    boxShadow: '32px 0 48px rgba(0,0,0,0.4)', 
    zIndex: 0
  }} />{/* Imagem centralizada e fixa */} 
  <img src="/assets/meninaa.png" alt="Ilustração Login" style={{ position: 
    'absolute', top: '0', 
    left: '56%', 
    transform: 'translateX(-50%)', 
    height: '800px', 
    objectFit: 'cover', 
    zIndex: 1, 
    pointerEvents: 'none', 
    marginTop:'250px'
    }} />

{/* Texto do topo */}

 <div className="frase-login"
 style={{
  marginTop: '80px',
  marginLeft: '85px',
  textAlign: 'left',
  fontSize: '32px',          
  lineHeight: '1.4',
  fontWeight: 700,           
  color: 'white',
  textShadow: '1px 1px 3px rgba(0,0,0,0.3)', 
  opacity: 1,
  zIndex: 2
}}>
  <p style={{ margin: 0 }}>Tá pronto pra dar o primeiro passo?</p>
  <p style={{
    margin: '12px 0 0 55px',
    color: '#2AB0BF',
    fontWeight: 700
  }}>
    A gente te ajuda a chegar lá.
  </p>
</div>

{/* Curva de baixo condicional e alinhada */} {modo === 'cadastro' && tipoUsuario === 'professor' && ( <div style={{ position: 'absolute', bottom: 0, left: 0 }}> <div style={{ width: '80px', height: '100%', background: 'white', borderTopRightRadius: '100px', borderBottomRightRadius: '100px', zIndex: 0 }} /> </div> )}

</div>
  </main>
</>

); }