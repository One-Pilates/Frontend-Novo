import React from 'react';
import {
  FaChartBar,
  FaUser,
  FaCalendarAlt,
  FaSignOutAlt,
  FaChalkboardTeacher,
  FaUsers,
  FaSlidersH,
  FaTimes,
} from 'react-icons/fa';
import ItemSidebar from './ItemSidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function SidebarTeacher({ navAberta, setNavAberta }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleNavigate = (path) => {
    navigate(path);
    // Fecha a sidebar no mobile após navegação
    if (window.innerWidth < 1024) {
      setNavAberta(false);
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {navAberta && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setNavAberta(false)}
        />
      )}

      <div
        className={`${
          navAberta ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${navAberta ? 'w-60' : 'lg:w-20 w-60'} 
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        text-white flex flex-col justify-between transition-all duration-300`}
        style={{
          backgroundColor: 'var(--laranja-principal)',
        }}
      >
        <div>
          {/* Botão de fechar - apenas mobile */}
          <div className="flex justify-end px-4 pt-4 lg:hidden">
            <button
              onClick={() => setNavAberta(false)}
              className="p-2 rounded-lg hover:bg-orange-600 transition-all active:scale-95"
              aria-label="Fechar menu"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="flex justify-center py-4 md:py-8">
            <img
              src="/logoMinimalistaBranca.png"
              alt="logo"
              className={`${navAberta ? 'w-24 md:w-32' : 'w-12'} transition-all`}
            />
          </div>

          <nav className="mt-4 md:mt-6">
            <ItemSidebar
              icon={FaCalendarAlt}
              texto="Agenda"
              navAberta={navAberta}
              ativo={isActive('/professor/agenda')}
              onClick={() => handleNavigate('/professor/agenda')}
            />
            <ItemSidebar
              icon={FaChartBar}
              texto="Dashboard"
              navAberta={navAberta}
              ativo={isActive('/professor/dashboard')}
              onClick={() => handleNavigate('/professor/dashboard')}
            />
            <ItemSidebar
              icon={FaUser}
              texto="Perfil"
              navAberta={navAberta}
              ativo={isActive('/professor/perfil')}
              onClick={() => handleNavigate('/professor/perfil')}
            />
          </nav>
        </div>

        <div className="mb-4 md:mb-6">
          <div
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 cursor-pointer transition-all rounded-lg mx-2 my-2 hover:bg-orange-600 active:bg-orange-700 active:scale-95"
          >
            <FaSignOutAlt size={20} className="w-5 h-5 md:w-5.5 md:h-5.5" />
            {navAberta && <span className="font-medium text-sm md:text-base">Sair</span>}
          </div>
        </div>
      </div>
    </>
  );
}

// Secretary Sidebar

export function SidebarSecretary({ navAberta, setNavAberta }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();

  const basePath = user.role === 'ADMINISTRADOR' ? '/admin' : '/secretaria';

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isAgendaActive = isActive(`${basePath}/agenda`) || isActive(`${basePath}/agendamento`);

  const isProfessorActive = isActive(`${basePath}/professor`);
  const isAlunosActive = isActive(`${basePath}/alunos`) || isActive(`${basePath}/aluno`);

  const handleNavigate = (path) => {
    navigate(path);
    // Fecha a sidebar no mobile após navegação
    if (window.innerWidth < 1024) {
      setNavAberta(false);
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {navAberta && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setNavAberta(false)}
        />
      )}

      <div
        className={`${
          navAberta ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${navAberta ? 'w-60' : 'lg:w-20 w-60'} 
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        text-white flex flex-col justify-between transition-all duration-300`}
        style={{
          backgroundColor: 'var(--laranja-principal)',
        }}
      >
        <div>
          {/* Botão de fechar - apenas mobile */}
          <div className="flex justify-end px-4 pt-4 lg:hidden">
            <button
              onClick={() => setNavAberta(false)}
              className="p-2 rounded-lg hover:bg-orange-600 transition-all active:scale-95"
              aria-label="Fechar menu"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="flex justify-center py-4 md:py-8">
            <img
              src="/logoMinimalistaBranca.png"
              alt="logo"
              className={`${navAberta ? 'w-24 md:w-32' : 'w-12'} transition-all`}
            />
          </div>
          <nav className="mt-4 md:mt-6">
            <ItemSidebar
              icon={FaChartBar}
              texto="Dashboard"
              navAberta={navAberta}
              ativo={isActive(`${basePath}/dashboard`)}
              onClick={() => handleNavigate(`${basePath}/dashboard`)}
            />
            <ItemSidebar
              icon={FaUser}
              texto="Perfil"
              navAberta={navAberta}
              ativo={isActive(`${basePath}/perfil`)}
              onClick={() => handleNavigate(`${basePath}/perfil`)}
            />
            <ItemSidebar
              icon={FaCalendarAlt}
              texto="Agenda"
              navAberta={navAberta}
              ativo={isAgendaActive}
              onClick={() => handleNavigate(`${basePath}/agenda`)}
            />
            <ItemSidebar
              icon={FaChalkboardTeacher}
              texto="Professor"
              navAberta={navAberta}
              ativo={isProfessorActive}
              onClick={() => handleNavigate(`${basePath}/professor`)}
            />
            <ItemSidebar
              icon={FaUsers}
              texto="Alunos"
              navAberta={navAberta}
              ativo={isAlunosActive}
              onClick={() => handleNavigate(`${basePath}/alunos`)}
            />
            {user.role === 'ADMINISTRADOR' && (
              <ItemSidebar
                icon={FaSlidersH}
                texto="Studio"
                navAberta={navAberta}
                ativo={isActive(`${basePath}/studio`)}
                onClick={() => handleNavigate(`${basePath}/studio`)}
              />
            )}
          </nav>
        </div>

        <div className="mb-4 md:mb-6">
          <div
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 cursor-pointer transition-all rounded-lg mx-2 my-2 hover:bg-orange-600 active:bg-orange-700 active:scale-95"
          >
            <FaSignOutAlt size={20} className="w-5 h-5 md:w-5.5 md:h-5.5" />
            {navAberta && <span className="font-medium text-sm md:text-base">Sair</span>}
          </div>
        </div>
      </div>
    </>
  );
}
