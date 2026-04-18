import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import {
  FiSearch,
  FiPhone,
  FiMail,
  FiTrash2,
  FiCalendar,
  FiChevronDown,
  FiLoader,
  FiUserCheck,
  FiUserX,
} from 'react-icons/fi';
import Botao from '../../../components/Button';
import userIconImg from '/user-icon.png';
import { getColorForEspecialidade } from '../../../utils/utils';

export default function GerenciamentoProfessor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = user?.role === 'ADMINISTRADOR' ? '/admin' : '/secretaria';
  const [professores, setProfessores] = useState([]);
  const [professoresOriginais, setProfessoresOriginais] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temMaisProfessores, setTemMaisProfessores] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const professoresPage = 5;

  const fetchProfessores = useCallback(
    async (page = 1, append = false, nome = '') => {
      const pageIndex = Math.max(0, page - 1);
      const nomeLimpo = nome.trim();
      const params = {
        page: pageIndex,
        size: professoresPage,
        sort: 'id,asc',
        ...(nomeLimpo ? { nome: nomeLimpo } : {}),
      };

      if (append) setCarregandoMais(true);

      try {
        const response = await api.get('api/professores/paginacao', { params });
        const data = response.data || {};
        const listaProfessores = data.professores || [];

        setProfessoresOriginais((listaAnterior) => {
          const listaAtualizada = append
            ? [...listaAnterior, ...listaProfessores]
            : listaProfessores;
          setProfessores(listaAtualizada);
          return listaAtualizada;
        });

        setPaginaAtual(page);
        setTemMaisProfessores(data.totalPaginas > page);
      } catch (error) {
        console.error('Erro ao buscar professores:', error);
        toast.error('Não foi possível carregar os professores.');
      } finally {
        if (append) setCarregandoMais(false);
      }
    },
    [professoresPage],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTemMaisProfessores(true);
      fetchProfessores(1, false, termoBusca);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchProfessores, termoBusca]);

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
          await api.delete(`api/professores/${professorId}`);
          toast.success('Professor deletado com sucesso.');
          setProfessores((prev) => prev.filter((p) => p.id !== professorId));
        } catch (error) {
          console.error('Erro ao deletar professor:', error);
          toast.error('Não foi possível deletar o professor.');
        }
      }
    });
  };

  const alterarStatusProfessor = async (professorId, statusAtual) => {
    const novoStatus = !statusAtual;
    const acao = novoStatus ? 'ativar' : 'desativar';

    Swal.fire({
      title: 'Alterar status?',
      text: `Deseja realmente ${acao} este professor?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: novoStatus ? '#10b981' : '#ef4444',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Sim, ${acao}!`,
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.patch(`api/professores/${professorId}`, { status: novoStatus });
          toast.success(`Professor ${novoStatus ? 'ativado' : 'desativado'} com sucesso.`);
          setProfessores((prev) =>
            prev.map((p) => (p.id === professorId ? { ...p, status: novoStatus } : p)),
          );
        } catch (error) {
          console.error('Erro ao alterar status:', error);
          toast.error('Não foi possível alterar o status do professor.');
        }
      }
    });
  };

  const filterByNome = (event) => {
    setTermoBusca(event.target.value);
  };

  const handleVerMais = () => {
    if (carregandoMais || !temMaisProfessores) return;
    fetchProfessores(paginaAtual + 1, true, termoBusca);
  };

  return (
    <div className="flex flex-col gap-6 py-6 px-4 md:px-8 lg:px-16 h-full mx-auto ml-auto bg-slate-50/20">
      <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Gerenciamento de Professores
        </h1>
        {user && user.role === 'ADMINISTRADOR' && (
          <button
            onClick={() => navigate(`${basePath}/professor/cadastrar`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-md shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            + Adicionar Professor
          </button>
        )}
      </div>

      <div className="relative w-full sm:w-96 group">
        <FiSearch
          className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors group-focus-within:text-orange-500"
          size={18}
          style={{ color: '#94a3b8', pointerEvents: 'none' }}
        />
        <input
          type="text"
          placeholder="Buscar por nome..."
          onChange={filterByNome}
          className="w-full pl-11 pr-4 py-3 rounded-2xl focus:outline-none transition-all duration-200 shadow-sm border-2 border-slate-100 bg-white"
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--laranja-principal)';
            e.target.style.boxShadow = '0 0 0 4px rgba(247, 116, 51, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#f1f5f9';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      <div className="mt-2 w-full h-auto pb-4 space-y-6">
        {professores && professores.length > 0 ? (
          professores.map((professor) => (
            <div
              key={professor.id}
              className="flex flex-col rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 bg-white hover:-translate-y-0.5"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-4 gap-4">
                <div className="flex items-center gap-6 w-full sm:w-auto">
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
                      className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover transition-all duration-300 border-2 border-slate-50"
                    />
                  </button>

                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                        {professor.nome}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${professor.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}
                      >
                        {professor.status ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                      {professor.cargo || 'Professor Especialista'}
                    </p>
                  </div>
                </div>

                <button
                  className="group flex items-center justify-center gap-2 px-6 py-3.5 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto shadow-sm shadow-orange-100"
                  style={{ backgroundColor: 'var(--laranja-principal)' }}
                  onClick={() =>
                    navigate(`${basePath}/agenda`, {
                      state: { idProfessor: professor.id, idSala: '', autoCarregar: true },
                    })
                  }
                >
                  <span className="text-sm">Ver agenda</span>
                  <FiCalendar size={18} />
                </button>
              </div>

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pt-5 border-t border-slate-50 gap-4">
                <div className="flex flex-col gap-4 w-full lg:w-auto">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 flex-wrap">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                        <FiPhone size={14} />
                      </div>
                      <span className="text-sm font-medium">
                        {professor.telefone || 'Sem telefone'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                        <FiMail size={14} />
                      </div>
                      <span className="text-sm font-medium">{professor.email}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {professor.especialidades && professor.especialidades.length > 0 ? (
                      professor.especialidades.map((esp) => {
                        const { backgroundColor, textColor } = getColorForEspecialidade(esp.nome);
                        return (
                          <span
                            key={esp.id}
                            className="px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-white/50 shadow-sm"
                            style={{ backgroundColor, color: textColor }}
                          >
                            {esp.nome}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic">
                        Nenhuma especialidade
                      </span>
                    )}
                  </div>
                </div>

                {user && user.role === 'ADMINISTRADOR' && (
                  <div className="flex gap-3 self-end lg:self-auto">
                    <button
                      onClick={() => alterarStatusProfessor(professor.id, professor.status)}
                      className={`p-3 rounded-xl transition-all hover:scale-110 active:scale-95 border ${
                        professor.status
                          ? 'bg-emerald-50 text-emerald-500 border-emerald-100 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100'
                      }`}
                      title={professor.status ? 'Desativar Professor' : 'Ativar Professor'}
                    >
                      {professor.status ? <FiUserCheck size={20} /> : <FiUserX size={20} />}
                    </button>
                    <button
                      onClick={() => deletarProfessor(professor.id)}
                      className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl transition-all hover:scale-110 active:scale-95"
                      title="Deletar Professor"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-40 text-slate-400 font-medium">
            Nenhum professor encontrado
          </div>
        )}

        {professoresOriginais.length > 0 && temMaisProfessores && (
          <div className="flex justify-center mt-12 mb-12">
            <button
              onClick={handleVerMais}
              disabled={carregandoMais}
              className={`
                group relative flex items-center justify-center gap-3
                px-14 py-4 rounded-3xl font-bold text-lg
                transition-all duration-300 ease-out
                shadow-lg shadow-orange-100
                hover:shadow-xl hover:shadow-orange-200
                hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                overflow-hidden
              `}
              style={{ backgroundColor: 'var(--laranja-principal)', color: 'var(--branco)' }}
            >
              <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
              {carregandoMais ? (
                <>
                  <FiLoader className="animate-spin text-2xl" />
                  <span>Carregando...</span>
                </>
              ) : (
                <>
                  <span>Explorar mais professores</span>
                  <FiChevronDown className="text-2xl transition-transform group-hover:translate-y-1" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
