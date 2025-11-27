import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/home.css';

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [abaAtiva, setAbaAtiva] = useState<'abertos' | 'previstos'>('abertos');

  const navigate = useNavigate();

  const irProCadastro = () => {
    navigate('/auth'); // vai pra tela de login/cadastro
    window.scrollTo(0, 0); // sobe a página pro topo
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % 2);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return( <> {/* HEADER */} <header className="header"> 
  <div className="container header-content"> <div className="logo-content"> <img src="/assets/logo.png" alt="Logo Concurso Aqui" className="logo" /> </div> <nav className="nav"> <a href="#">Concursos</a> <a href="#">Aulas Gratuitas</a> <a href="#">Notícias</a> <a href="#">Editorias</a> </nav> <Link to="/auth" className="btn-orange">Comece agora</Link> </div> </header>

{/* BUSCA */}
  <section className="busca">
    <div className="container busca-content">
      <input type="text" placeholder="O que você procura?" />
      <button className="btn-orange">Buscar</button>
    </div>
  </section>

  {/* BANNER */}
  <section className="banner-container">
  {[0, 1].map((index) => (
    <div
      key={index}
      className={'banner-slide' + (currentBanner === index ? ' active' : '')}
    >
      <div className="container banner-content">
        <div className="banner-left">
          <h2>
            {index === 0
              ? 'Quer estudar de graça e com apoio?\nVocê achou o lugar certo!'
              : 'De professor pra concurseiro:\nvamo junto até a aprovação.'}
          </h2>
          <div className="banner-buttons">
            {/* Botão azul */}
            <button
              className="btn-dark"
              type="button"
              onClick={() => {
                if (index === 1) {
                  irProCadastro(); // "Conhecer professores" -> login/cadastro
                }
                // "Ver concursos abertos" (index 0) não faz nada ainda
              }}
            >
              {index === 0
                ? 'Ver concursos abertos'
                : 'Conhecer professores'}
            </button>

            {/* Botão laranja */}
            <button
              className="btn-orange"
              onClick={irProCadastro}
              type="button"
            >
              {index === 0 ? 'Quero aulas grátis' : 'Começar agora'}
            </button>
          </div>
        </div>
        <div className="banner-right">
          <img
            src={index === 0 ? '/assets/zaphome.png' : '/assets/professor.png'}
            alt={index === 0 ? 'Menina estudando' : 'Professor'}
            className={'img-menina' + (index === 0 ? ' menina-img' : '')}
          />
        </div>
      </div>
    </div>
  ))}
</section>

  {/* TABS DE CONCURSOS */}
  <section className="concursos">
    <div className="container">
      <div className="abas">
        <p
          className={'aba-texto' + (abaAtiva === 'abertos' ? ' ativo' : '')}
          onClick={() => setAbaAtiva('abertos')}
        >
          Concursos abertos
        </p>
        <p
          className={'aba-texto' + (abaAtiva === 'previstos' ? ' ativo' : '')}
          onClick={() => setAbaAtiva('previstos')}
        >
          Concursos previstos
        </p>
      </div>

      <div className={'cards' + (abaAtiva === 'abertos' ? '' : ' hidden')}>
        <div className="card">
          <span className="nivel azul">Nível</span>
          <p>Exemplo</p>
        </div>
        <div className="card">
          <span className="nivel azul">Nível</span>
          <p>Exemplo</p>
        </div>
      </div>

      <div className={'cards' + (abaAtiva === 'previstos' ? '' : ' hidden')}>
        <div className="card">
          <span className="nivel laranja">Nível</span>
          <p>Exemplo</p>
        </div>
        <div className="card">
          <span className="nivel laranja">Nível</span>
          <p>Exemplo</p>
        </div>
      </div>

      <a href="#" className="ver-todos">Ver todos</a>
    </div>
  </section>

  {/* ESTUDE DE GRAÇA */}
  <section className="estude">
    <div className="container estude-content">
      <div className="estude-left">
        <h3>Estude de graça com nossos professores parceiros</h3>
        <a
  href="#"
  className="btn-estudar"
  onClick={(e) => {
    e.preventDefault();
    irProCadastro();
  }}
>
  Quero começar a estudar
</a>
      </div>
      <div className="estude-right">
        <div className="materia-box">
          <img src="/assets/portugues.png" alt="Português" />
          <p>Português</p>
        </div>
        <div className="materia-box">
          <img src="/assets/matematica.png" alt="Matemática" />
          <p>Matemática</p>
        </div>
        <div className="materia-box">
          <img src="/assets/professores.png" alt="Professores" />
          <p>Professores</p>
        </div>
      </div>
      <p className="estude-subtexto">
        Sem pagar nada e sem ficar na solidão. Bora estudar?
      </p>
    </div>
  </section>

  {/* NOTÍCIAS */}
  <section className="noticias">
    <div className="container">
      <h2 className="noticias-titulo">Notícias e Editais</h2>
      <div className="noticias-grid">
        <div className="noticia-card">
          <img src="/assets/gari.jpg" alt="Notícia 1" />
          <h4>Título da notícia exemplo</h4>
          <p className="data-noticia">Atualizado em dia</p>
          <a href="#" className="btn-leia">Ler mais</a>
        </div>
        <div className="noticia-card">
          <img src="/assets/bope.jpg" alt="Notícia 2" />
          <h4>Título da notícia exemplo</h4>
          <p className="data-noticia">Atualizado em dia</p>
          <a href="#" className="btn-leia">Ler mais</a>
        </div>
        <div className="noticia-card">
          <img src="/assets/marinha.jpg" alt="Notícia 3" />
          <h4>Título da notícia exemplo</h4>
          <p className="data-noticia">Atualizado em dia</p>
          <a href="#" className="btn-leia">Ler mais</a>
        </div>
      </div>
    </div>
  </section>

  {/* FOOTER */}
  <footer className="footer">
    <div className="footer-logo-container">
      <img src="/assets/logobrancaa.png" alt="logobrancaa" className="footer-logo" />
    </div>
    <div className="footer-top-links">
      <a href="#">Início</a>
      <a href="#">Sobre nós</a>
      <a href="#">Contato</a>
    </div>
    <div className="footer-content">
      <div className="footer-column">
        <h4>Concursos</h4>
        <ul>
          <li><a href="#">Concursos Abertos</a></li>
          <li><a href="#">Concursos Previstos</a></li>
          <li><a href="#">Editais Publicados</a></li>
          <li><a href="#">Aulas Gratuitas</a></li>
          <li><a href="#">Notícias</a></li>
        </ul>
      </div>
      <div className="footer-column">
        <h4>Institutos</h4>
        <ul>
          <li><a href="#">Exemplo</a></li>
          <li><a href="#">SEEDUC-RJ (Educação)</a></li>
        </ul>
      </div>
      <div className="footer-column">
        <h4>Bancas</h4>
        <ul>
          <li><a href="#">FGV (Fundação Getúlio Vargas)</a></li>
          <li><a href="#">Exemplo</a></li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <p>@ 2025 Concursos Aqui.</p>
      
      <div className="social-icons">
        <a href="#" className="facebook"><img src="/assets/facebook.png" alt="Facebook" /></a>
        <a href="#" className="instagram"><img src="/assets/instagram.png" alt="Instagram" /></a>
        <a href="#" className="twitter"><img src="/assets/twitter.png" alt="Twitter" /></a>
      </div>
    </div>
  </footer>
</>

); }