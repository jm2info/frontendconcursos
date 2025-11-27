import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import AdminLogin from './pages/AdminLogin';
import AdminPainel from './pages/AdminPainel';
import CandidatoPage from './pages/CandidatoPage'; 
import ProfessorPage from './pages/ProfessorPage'; 

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/painel" element={<AdminPainel />} />
      <Route path="/candidato" element={<CandidatoPage />} /> {/* <-- E essa linha */}
      <Route path="/professor" element={<ProfessorPage />} />
    </Routes>
  );
}