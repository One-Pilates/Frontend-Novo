import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import {
  FiArrowLeft,
  FiArrowRight,
  FiFilter,
  FiSearch,
  FiTrash2,
  FiDownload,
} from 'react-icons/fi';
import Botao from '../../../components/Button';
import { abrirModalDownload } from './components/Export';

export default function GerenciamentoAluno() {
  const navigate = useNavigate();
  const { _user } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [filterByNome, setFilterByNome] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const alunosPerPage = 7;

  const fetchAlunos = async () => {
    try {
      console.log('Fetching alunos...');
      const response = await api.get('api/alunos');
      const data = response.data;
      console.log('Alunos fetched:', data);
      setAlunos(data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterByNome, statusFilter]);

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const deleteAluno = async (alunoId) => {
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
          await api.delete(`api/alunos/${alunoId}`);
          setAlunos(alunos.filter((aluno) => aluno.id !== alunoId));
          Swal.fire({
            icon: 'success',
            title: 'Deletado!',
            text: 'O aluno foi deletado com sucesso.',
            confirmButtonText: 'OK',
          });
        } catch (error) {
          console.error('Erro ao deletar aluno:', error);
        }
      }
    });
  };

  const filteredStudents = alunos.filter((aluno) => {
    const matchesSearch = aluno.nome.toLowerCase().includes(filterByNome.toLowerCase());

    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativo' && aluno.status) ||
      (statusFilter === 'inativo' && !aluno.status);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStudents.length / alunosPerPage);
  const startIndex = (currentPage - 1) * alunosPerPage;
  const endIndex = startIndex + alunosPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  return (
    <>
      <div className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-6 px-4 sm:px-6 md:px-8 lg:px-16 h-full mx-auto">
        <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Gerenciamento de Aluno</h1>
          <Botao
            onClick={() => navigate('/secretaria/aluno/cadastrar')}
            cor="bg-blue-500"
            texto={'Adicionar Aluno'}
          />
        </div>

        <div className="flex flex-col md:flex-row w-full items-stretch md:items-center gap-3 md:gap-4 justify-between">
          <div className="relative w-full md:w-80">
            <FiSearch
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
              size={18}
              style={{ color: '#f77433', pointerEvents: 'none', opacity: 1, zIndex: 10 }}
            />
            <input
              type="text"
              onChange={(e) => setFilterByNome(e.target.value)}
              placeholder="Buscar por nome"
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => abrirModalDownload(filteredStudents, calculateAge)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-white rounded-lg transition focus:outline-none focus:ring-2 flex-1 sm:flex-none"
              style={{
                backgroundColor: 'var(--laranja-principal)',
                outlineColor: 'var(--laranja-principal)',
              }}
            >
              <FiDownload size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Exportar</span>
            </button>

            <div className="relative flex-1 sm:flex-none">
              <FiFilter
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-cinza)' }}
              />
              <select
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm sm:text-base"
                style={{
                  borderColor: 'var(--cor-borda)',
                  borderWidth: '1px',
                  backgroundColor: 'var(--branco)',
                  color: 'var(--text-escuro)',
                }}
              >
                <option value="todos">Status: Todos</option>
                <option value="ativo">Status: Ativo</option>
                <option value="inativo">Status: Inativo</option>
              </select>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl shadow-md flex flex-col overflow-hidden"
          style={{
            backgroundColor: 'var(--branco)',
            borderColor: 'var(--cor-borda)',
            borderWidth: '1px',
          }}
        >
          <div className="overflow-x-auto flex-1">
            <table className="w-full table-auto min-w-160">
              <thead
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--bg-claro)',
                  borderBottom: '2px solid var(--cor-borda)',
                }}
              >
                <tr>
                  <th
                    className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold"
                    style={{ color: 'var(--text-cinza)' }}
                  >
                    Nome do Aluno
                  </th>
                  <th
                    className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-extra-bold"
                    style={{ color: 'var(--text-cinza)' }}
                  >
                    Email
                  </th>
                  <th
                    className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-extra-bold"
                    style={{ color: 'var(--text-cinza)' }}
                  >
                    CPF
                  </th>
                  <th
                    className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold"
                    style={{ color: 'var(--text-cinza)' }}
                  >
                    Idade
                  </th>
                  <th
                    className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold"
                    style={{ color: 'var(--text-cinza)' }}
                  >
                    Status
                  </th>
                  <th
                    className="hidden xl:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold"
                    style={{ color: 'var(--text-cinza)' }}
                  >
                    Limitações
                  </th>
                  <th
                    className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold"
                    style={{ color: 'var(--text-cinza)' }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentStudents && currentStudents.length > 0 ? (
                  currentStudents.map((aluno, index) => (
                    <tr
                      key={aluno.id}
                      className="transition-colors duration-150"
                      style={{
                        backgroundColor: 'var(--branco)',
                        color: 'var(--text-escuro)',
                        borderTop: index === 0 ? 'none' : '1px solid var(--cor-borda)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-claro)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--branco)';
                      }}
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                        <button
                          onClick={() => navigate(`/secretaria/perfil/aluno/${aluno.id}`)}
                          className="text-left hover:underline font-medium"
                        >
                          {aluno.nome}
                        </button>
                      </td>

                      <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                        {aluno.email}
                      </td>

                      <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                        {aluno.cpf}
                      </td>

                      <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                        {calculateAge(aluno.dataNascimento)}
                      </td>

                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span
                          className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                            aluno.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {aluno.status ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      <td className="hidden xl:table-cell px-3 sm:px-6 py-3 sm:py-4">
                        {aluno.alunoComLimitacoesFisicas ? (
                          <span className="inline-flex px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Sim
                          </span>
                        ) : (
                          <span className="inline-flex px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-dark text-gray-400">
                            Não
                          </span>
                        )}
                      </td>

                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => deleteAluno(aluno.id)}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          >
                            <FiTrash2 size={16} className="sm:w-4.5 sm:h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-3 sm:px-6 py-8 sm:py-12 text-center text-xs sm:text-sm"
                      style={{ color: 'var(--text-cinza)' }}
                    >
                      Nenhum aluno encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredStudents && filteredStudents.length > 0 && (
            <div
              className="px-3 sm:px-6 py-3 sm:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
              style={{
                backgroundColor: 'var(--branco)',
                borderTopColor: 'var(--cor-borda)',
              }}
            >
              <div
                className="text-xs sm:text-sm order-2 sm:order-1 font-medium"
                style={{ color: 'var(--text-cinza)' }}
              >
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredStudents.length)} de{' '}
                {filteredStudents.length} alunos
              </div>

              <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--branco)',
                    color: currentPage === 1 ? 'var(--text-cinza)' : 'var(--text-escuro)',
                    borderColor: 'var(--cor-borda)',
                    borderWidth: '1px',
                  }}
                >
                  <FiArrowLeft size={16} className="sm:w-4.5 sm:h-4.5" />
                </button>

                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const total = totalPages;

                    const renderPage = (p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition"
                        style={{
                          backgroundColor:
                            currentPage === p ? 'var(--laranja-principal)' : 'var(--branco)',
                          color: currentPage === p ? '#fff' : 'var(--text-escuro)',
                          borderColor: 'var(--cor-borda)',
                          borderWidth: '1px',
                        }}
                      >
                        {p}
                      </button>
                    );

                    pages.push(renderPage(1));

                    if (currentPage > 3) {
                      pages.push(
                        <span
                          key="dots1"
                          className="px-1 sm:px-2 text-xs sm:text-sm"
                          style={{ color: 'var(--text-cinza)' }}
                        >
                          …
                        </span>,
                      );
                    }

                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(total - 1, currentPage + 1);

                    for (let p = start; p <= end; p++) {
                      pages.push(renderPage(p));
                    }

                    if (currentPage < total - 2) {
                      pages.push(
                        <span
                          key="dots2"
                          className="px-1 sm:px-2 text-xs sm:text-sm"
                          style={{ color: 'var(--text-cinza)' }}
                        >
                          …
                        </span>,
                      );
                    }

                    if (total > 1) pages.push(renderPage(total));

                    return pages;
                  })()}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 sm:p-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--branco)',
                    color: currentPage === totalPages ? 'var(--text-cinza)' : 'var(--text-escuro)',
                    borderColor: 'var(--cor-borda)',
                    borderWidth: '1px',
                  }}
                >
                  <FiArrowRight size={16} className="sm:w-4.5 sm:h-4.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
