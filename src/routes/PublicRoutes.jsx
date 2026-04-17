import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login/Login';
import EsqueciSenha from '../pages/Login/EsqueciSenha';
import CodigoVerificacao from '../pages/Login/CodigoVerificacao';
import NovaSenha from '../pages/Login/NovaSenha';
import NotFound from './NotFound';
import RedefinirSenha from '../components/Password';
import TermosDeUso from '../pages/Login/TermosDeUso';
import PoliticaPrivacidade from '../pages/Login/PoliticaPrivacidade';

export default function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/codigo-verificacao" element={<CodigoVerificacao />} />
      <Route path="/nova-senha" element={<NovaSenha />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/termos-de-uso" element={<TermosDeUso />} />
      <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
