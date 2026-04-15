import { AuthContext } from './AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
      setUser(JSON.parse(savedUser));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setIsCheckingAuth(false);
  }, []);

  async function login(email, senha) {
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, senha });
      const data = response.data;

      const tokenCandidate =
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        data?.bearerToken ||
        data?.funcionario?.token ||
        '';

      const tokenRaw = tokenCandidate.toString().trim();
      const token = tokenRaw.toLowerCase().startsWith('bearer ')
        ? tokenRaw.substring(7).trim()
        : tokenRaw;

      if (!token) {
        toast.error('Falha de autenticação: token não recebido no login.');
        return false;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data.funcionario));

      setUser(data.funcionario);

      const role = data.funcionario.role;
      const nome = data.funcionario.nome;
      const primeiroAcesso = data.funcionario.primeiroAcesso;

      const rotas = {
        PROFESSOR: {
          path: '/professor/agenda',
          msg: `Bem-vindo à sua agenda, ${nome}!`,
        },
        SECRETARIA: {
          path: '/secretaria/dashboard',
          msg: `Bem-vindo ao painel da One Pilates, ${nome}!`,
        },
        ADMINISTRADOR: {
          path: '/admin/dashboard',
          msg: `Bem-vindo ao painel da One Pilates, ${nome}!`,
        },
      };

      let destino = rotas[role];

      if (primeiroAcesso) {
        destino = {
          path: '/nova-senha',
          msg: `Por favor, defina sua senha, ${nome}!`,
        };
      }

      if (!destino) {
        toast.error('Função desconhecida. Contate o administrador.');
        return false;
      }

      toast.success(destino.msg);
      navigate(destino.path);

      return true;
    } catch (error) {
      const status = error.response?.status;
      const msg =
        status === 401
          ? 'Email ou senha incorretos.'
          : 'Ocorreu um erro inesperado. Tente novamente mais tarde.';

      toast.error(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    Swal.fire({
      title: 'Tem certeza que deseja sair?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
      }
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isCheckingAuth,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
