import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const resposta = await fetch('http://localhost:3001/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.error || 'Dados inválidos.');
      } else {
        localStorage.setItem('admin', JSON.stringify(dados.admin));
        navigate('/admin/painel');
      }
    } catch (err) {
      setErro('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
    
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background:
          'linear-gradient(135deg, #b2d8dc 0%, #2AB0BF 45%, #014751 100%)'
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: 16, marginTop:-90 }}>
          <img
            src="/assets/logo.png"
            alt="Concursos Aqui"
            style={{ height: 300, objectFit: 'contain' }}
          />
        </div>

        {/* CARD */}
        <div
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(6px)',
            borderRadius: 16,
            boxShadow:
              '0 10px 30px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.06)',
            padding: 28,
            transform: 'translateZ(0)',
            transition: 'transform .2s ease',
            marginTop:-80
          }}
        >
          <h2
            style={{
              margin: 0,
              marginBottom: 8,
              color: '#013E4C',
              fontSize: 22,
              fontWeight: 800,
              textAlign: 'center'
            }}
          >
            Área Administrativa
          </h2>
          <p
            style={{
              marginTop: 0,
              marginBottom: 20,
              color: '#4a6670',
              fontSize: 14,
              textAlign: 'center'
            }}
          >
            Faça login para acessar o painel.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: 14 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#355a63', fontWeight: 600 }}>
                E-mail
              </span>
              <input
                type="email"
                placeholder="admin@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  height: 44,
                  padding: '0 14px',
                  borderRadius: 12,
                  border: '1px solid #d9e3e6',
                  outline: 'none',
                  fontSize: 14,
                  transition: 'box-shadow .15s, border-color .15s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 0 0 3px rgba(42,176,191,0.18)';
                  e.currentTarget.style.borderColor = '#2AB0BF';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#d9e3e6';
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#355a63', fontWeight: 600 }}>
                Senha
              </span>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  style={{
                    height: 44,
                    padding: '0 44px 0 14px',
                    borderRadius: 12,
                    border: '1px solid #d9e3e6',
                    outline: 'none',
                    width: '100%',
                    fontSize: 14,
                    transition: 'box-shadow .15s, border-color .15s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow =
                      '0 0 0 3px rgba(42,176,191,0.18)';
                    e.currentTarget.style.borderColor = '#2AB0BF';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#d9e3e6';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    height: 28,
                    padding: '0 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#eef6f7',
                    color: '#004D51',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </label>

            {erro && (
              <div
                role="alert"
                style={{
                  background: '#ffe8e6',
                  color: '#b2190f',
                  border: '1px solid #ffcdc8',
                  borderRadius: 10,
                  padding: '10px 12px',
                  fontSize: 13
                }}
              >
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                height: 46,
                borderRadius: 12,
                border: 'none',
                background: loading ? '#f7a87e' : '#F47B35',
                color: 'white',
                fontWeight: 800,
                letterSpacing: 0.3,
                fontSize: 15,
                cursor: loading ? 'default' : 'pointer',
                boxShadow: '0 6px 16px rgba(244,123,53,0.35)',
                transform: loading ? 'none' : 'translateY(0)',
                transition: 'filter .15s, transform .08s'
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  'translateY(1px)';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  'translateY(0)';
              }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Rodapézinho */}
        <p
          style={{
            textAlign: 'center',
            marginTop: 14,
            color: 'rgba(255,255,255,0.9)',
            fontSize: 12,
            fontWeight: 600
          }}
        >
          © {new Date().getFullYear()} Concursos Aqui
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;