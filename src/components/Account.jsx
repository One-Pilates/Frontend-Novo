import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaCog, FaKey, FaMoon, FaSun, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth.jsx';
import ContactAdm from './ContactAdm.jsx';
import api from '../services/api';
import userIconImg from '/user-icon.png';

function Account() {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [modoEscuro, setModoEscuro] = useState(() => localStorage.getItem('theme') === 'dark');
  const { user } = useAuth() || {};

  const toggleModoEscuro = () => {
    const newValue = !modoEscuro;
    setModoEscuro(newValue);
    if (newValue) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const openAdminModal = () => {
    setMenuAberto(false);
    setIsAdminModalOpen(true);
  };

  const nome = user?.nome || user?.name || 'Usuário';
  const roleRaw = user?.role || user?.cargo || '';
  const papel = (() => {
    if (!roleRaw) return '';
    const r = roleRaw.toString().toUpperCase();
    if (r.includes('PROF')) return 'Professor(a)';
    if (r.includes('SECRET')) return 'Secretaria';
    if (r.includes('ADMIN')) return 'Administrador';
    return roleRaw;
  })();

  return (
    <div className="relative">
      <button
        onClick={() => setMenuAberto(!menuAberto)}
        className="flex items-center gap-2 md:gap-3 px-2 py-2 rounded-lg transition-all duration-200 group"
        style={{
          color: 'var(--text-escuro)',
        }}
        aria-expanded={menuAberto}
        aria-haspopup="true"
      >
        {user && user.foto ? (
          <img
            src={`${api.defaults.baseURL}/api/imagens/${user.foto}?token=${localStorage.getItem('token')}`}
            alt={nome}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
            style={{ outline: '2px solid var(--laranja-principal)' }}
          />
        ) : (
          <div
            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-claro)', color: 'var(--text-cinza)' }}
          >
            <FaUserCircle className="text-xl md:text-2xl" />
          </div>
        )}

        <div className="hidden md:block text-left">
          <p
            className="font-semibold leading-tight text-sm lg:text-base"
            style={{ color: 'var(--text-escuro)' }}
          >
            {nome}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-cinza)' }}>
            {papel}
          </p>
        </div>

        <FaChevronDown
          className={`hidden sm:block transition-all duration-300 text-sm md:text-base group-hover:translate-y-0.5 ${menuAberto ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-cinza)' }}
        />
      </button>

      {menuAberto && (
        <>
          <div onClick={() => setMenuAberto(false)} className="fixed inset-0 z-40" />

          <div
            className="absolute right-0 mt-2 w-64 sm:w-72 rounded-lg shadow-lg z-50 overflow-hidden"
            style={{
              backgroundColor: 'var(--branco)',
              borderColor: 'var(--cor-borda)',
              borderWidth: '1px',
            }}
          >
            <div
              className="p-3 sm:p-4"
              style={{ background: `linear-gradient(to right, var(--laranja-principal), #E85D25)` }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    user?.foto
                      ? `${api.defaults.baseURL}/api/imagens/${user.foto}?token=${localStorage.getItem('token')}`
                      : userIconImg
                  }
                  alt={nome}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full ring-2 ring-white object-cover"
                />
                <div className="text-white">
                  <p className="font-bold text-base sm:text-lg leading-tight">{nome}</p>
                  <p className="text-xs sm:text-sm opacity-90">{papel}</p>
                </div>
              </div>
            </div>

            <div className="py-2">
              <button
                onClick={openAdminModal}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-colors flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100"
                style={{
                  backgroundColor: 'var(--branco)',
                  color: 'var(--text-escuro)',
                }}
              >
                <FaCog className="text-base" style={{ color: 'var(--text-cinza)' }} />
                <span className="text-sm sm:text-base">Configurações</span>
              </button>

              <button
                onClick={() => navigate('/esqueci-senha')}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-colors flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100"
                style={{
                  backgroundColor: 'var(--branco)',
                  color: 'var(--text-escuro)',
                }}
              >
                <FaKey className="text-base" style={{ color: 'var(--text-cinza)' }} />
                <span className="text-sm sm:text-base">Senhas</span>
              </button>

              <button
                onClick={toggleModoEscuro}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-colors flex items-center justify-between hover:bg-gray-50 active:bg-gray-100"
                style={{
                  backgroundColor: 'var(--branco)',
                  color: 'var(--text-escuro)',
                }}
              >
                <div className="flex items-center gap-3">
                  {modoEscuro ? (
                    <FaSun className="text-yellow-500 text-base" />
                  ) : (
                    <FaMoon className="text-base" style={{ color: 'var(--text-cinza)' }} />
                  )}
                  <span className="text-sm sm:text-base">Modo Escuro</span>
                </div>
                <div
                  className="w-11 h-6 rounded-full transition-colors"
                  style={{
                    backgroundColor: modoEscuro ? 'var(--laranja-principal)' : 'var(--cor-borda)',
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-white mt-1 transition-transform"
                    style={{
                      transform: modoEscuro
                        ? 'translateX(24px) translateX(4px)'
                        : 'translateX(4px)',
                    }}
                  ></div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      <ContactAdm isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />
    </div>
  );
}

export default Account;
