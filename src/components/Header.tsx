
import { Link } from 'react-router-dom';

interface HeaderProps {
minimal?: boolean;
}

const Header = ({ minimal = false }: HeaderProps) => {
return (
<header className="header">
<div className="container header-content">
<div className="logo-content">
<img src="/assets/logo.png" alt="Logo Concurso Aqui" className="logo" />
</div>

{!minimal ? (  
      <nav className="nav">  
        <a href="#">Concursos</a>  
        <a href="#">Aulas Gratuitas</a>  
        <a href="#">Notícias</a>  
        <a href="#">Editorias</a>  
      </nav>  
    ) : (  
      <div></div> // mantém a estrutura alinhada  
    )}  

    <Link to={minimal ? "/" : "/auth"} className="btn-orange">  
      {minimal ? "Início" : "Comece agora"}  
    </Link>  
  </div>  
</header>

);
};

export default Header;