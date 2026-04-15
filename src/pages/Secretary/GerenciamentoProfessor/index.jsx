import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { FiSearch, FiPhone, FiMail, FiTrash2, FiCalendar } from 'react-icons/fi';
import Botao from '../../../components/Button';
import userIconImg from '/user-icon.png';
import { getColorForEspecialidade } from '../../../utils/utils';

export default function GerenciamentoProfessor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = user?.role === 'ADMINISTRADOR' ? '/admin' : '/secretaria';
  const [professores, setProfessores] = useState([]);
  const [professoresOriginais, setProfessoresOriginais] = useState([]);

  const extrairLista = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.professores)) return payload.professores;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
  };

  const fetchProfessores = async () => {
    try {
      console.log('Buscando professores...');
      const response = await api.get('api/professores');
      const data = response.data;
      const lista = extrairLista(data);
      console.log('Professores recebidosUseEffect:', data);
      console.log('Lista de professores normalizada:', lista);
      setProfessores(lista);
      setProfessoresOriginais(lista);
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
    }
  };

  useEffect(() => {
    fetchProfessores();
  }, []);

  const deletarProfessor = async (professorId) => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Essa ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, deletar!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await api.delete(`api/professores/${professorId}`);
          console.log('Professor deletado:', response.data);
          fetchProfessores();
          toast.success('Professor deletado com sucesso.');
        } catch (error) {
          console.error('Erro ao deletar professor:', error);
          toast.error('Não foi possível deletar o professor.');
        }
      }
    });
  };

  const filterByNome = (event) => {
    const name = event.target.value.trim();

    if (!name) {
      setProfessores(professoresOriginais);
      return;
    }

    const filtrados = professoresOriginais.filter((professor) =>
      professor.nome.toLowerCase().includes(name.toLowerCase()),
    );

    setProfessores(filtrados);
  };

  return (
    <>
      <div className="flex flex-col gap-6 py-4 md:py-6 px-4 md:px-8 lg:px-16 h-full mx-auto ml-auto">
        <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Gerenciamento de Professor</h1>
          {user && user.role === 'ADMINISTRADOR' && (
            <Botao
              onClick={() => navigate(`${basePath}/professor/cadastrar`)}
              cor="bg-blue-500"
              texto={'Adicionar Professor'}
            ></Botao>
          )}
        </div>

        <div className="relative w-full sm:w-80">
          <FiSearch
            className="absolute left-4 top-1/2 transform -translate-y-1/2"
            size={18}
            style={{ color: '#f77433', pointerEvents: 'none', opacity: 1, zIndex: 10 }}
          />
          <input
            type="text"
            placeholder="Buscar por nome"
            onChange={filterByNome}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl focus:outline-none transition-all"
            style={{
              background: '#f9fafb',
              border: '2px solid #e5e7eb',
              color: 'var(--text-escuro)',
              fontSize: '0.95rem',
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 0 4px rgba(247, 116, 51, 0.15)';
              e.target.style.background = 'var(--branco)';
              e.target.style.borderColor = '#f77433';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.background = '#f9fafb';
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.transform = 'translateY(0)';
            }}
            onMouseEnter={(e) => {
              if (document.activeElement !== e.target) {
                e.target.style.borderColor = 'var(--cor-borda)';
                e.target.style.background = 'var(--branco)';
              }
            }}
            onMouseLeave={(e) => {
              if (document.activeElement !== e.target) {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
              }
            }}
          />
        </div>

        <div className="mt-2 w-full h-auto pb-4">
          {professores && professores.length > 0 ? (
            professores.map((professor) => (
              <div
                key={professor.id}
                className="flex flex-col mb-6 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md hover:shadow-xl transition-all duration-300"
                style={{
                  backgroundColor: 'var(--branco)',
                  borderColor: 'var(--cor-borda)',
                  borderWidth: '1px',
                }}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                  <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => navigate(`${basePath}/perfil/professor/${professor.id}`)}
                      className="group relative shrink-0"
                    >
                      <img
                        src={
                          professor.foto
                            ? `${api.defaults.baseURL}/api/imagens/${professor.foto}?token=${localStorage.getItem('token')}`
                            : userIconImg
                        }
                        alt={professor.nome}
                        className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full object-cover transition-all duration-300 hover:scale-105"
                        style={{
                          outline: '3px solid var(--cor-borda)',
                          outlineOffset: '2px',
                        }}
                      />
                    </button>

                    <div className="flex flex-col gap-1.5 md:gap-2 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
                        <h2
                          className="text-xl md:text-2xl lg:text-3xl font-bold wrap-break-word"
                          style={{ color: 'var(--laranja-principal)' }}
                        >
                          {professor.nome}
                        </h2>
                        <span
                          className={`px-2.5 md:px-3 py-1 ${professor.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-full text-xs md:text-sm font-semibold self-start`}
                        >
                          {professor.status ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="text-sm md:text-base" style={{ color: 'var(--text-cinza)' }}>
                        {professor.cargo || 'Professor'}
                      </p>
                    </div>
                  </div>

                  <button
                    className="group flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-3 text-white rounded-lg md:rounded-xl font-semibold transition-all ease-in-out shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                    style={{ backgroundColor: 'var(--laranja-principal)' }}
                    onClick={() =>
                      navigate(`${basePath}/agenda`, {
                        state: { idProfessor: professor.id, idSala: '', autoCarregar: true },
                      })
                    }
                  >
                    <span className="text-sm md:text-base">Ver agenda</span>
                    <FiCalendar size={18} className="md:w-5 md:h-5" />
                  </button>
                </div>

                <div
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between pt-4 border-t gap-4"
                  style={{ borderTopColor: 'var(--cor-borda)' }}
                >
                  <div className="flex flex-col gap-3 w-full lg:w-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 flex-wrap">
                      <div
                        className="flex items-center gap-2"
                        style={{ color: 'var(--text-escuro)' }}
                      >
                        <FiPhone
                          size={16}
                          className="md:w-4.5 md:h-4.5 shrink-0"
                          style={{ color: 'var(--laranja-principal)' }}
                        />
                        <span className="text-xs md:text-sm break-all">
                          {professor.telefone || 'Sem telefone'}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-2"
                        style={{ color: 'var(--text-escuro)' }}
                      >
                        <FiMail
                          size={16}
                          className="md:w-4.5 md:h-4.5 shrink-0"
                          style={{ color: 'var(--laranja-principal)' }}
                        />
                        <span className="text-xs md:text-sm break-all">{professor.email}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {professor.especialidades && professor.especialidades.length > 0 ? (
                        professor.especialidades.map((esp) => {
                          const { backgroundColor, textColor } = getColorForEspecialidade(esp.nome);
                          return (
                            <span
                              key={esp.id}
                              className="px-2.5 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium"
                              style={{
                                backgroundColor,
                                color: textColor,
                              }}
                            >
                              {esp.nome}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs md:text-sm" style={{ color: 'var(--text-cinza)' }}>
                          Sem especialidades
                        </span>
                      )}
                    </div>
                  </div>

                  {user && user.role === 'ADMINISTRADOR' && (
                    <button
                      onClick={() => deletarProfessor(professor.id)}
                      className="p-2 md:p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-all hover:scale-110 active:scale-95 self-end lg:self-auto"
                    >
                      <FiTrash2 size={20} className="md:w-6 md:h-6" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div
              className="flex items-center justify-center h-40"
              style={{ color: 'var(--text-cinza)' }}
            >
              Nenhum professor encontrado
            </div>
          )}
        </div>
      </div>
    </>
  );
}
