import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import userIconImg from '/user-icon.png';
import Back from '../../../components/Back';
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiPhone,
  FiBell,
  FiAward,
  FiAlertCircle,
  FiFileText,
} from 'react-icons/fi';
import '../../../pages/Teacher/Profile/style.scss';

export default function ProfileView() {
  const { id } = useParams();
  const location = useLocation();
  const [dadosUser, setDadosUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const tipo = location.pathname.includes('/professor') ? 'professor' : 'aluno';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const endpoint = tipo === 'professor' ? `api/professores/${id}` : `api/alunos/${id}`;
        const response = await api.get(endpoint);
        const data = response.data;

        if (tipo === 'professor' && data.foto) {
          setDadosUser({
            ...data,
            foto: `${api.defaults.baseURL}/api/imagens/${data.foto}?token=${localStorage.getItem('token')}`,
          });
        } else {
          setDadosUser(data);
        }
      } catch (error) {
        console.error(`Erro ao buscar ${tipo}:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id, tipo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Carregando perfil...</div>
      </div>
    );
  }

  if (!dadosUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Perfil não encontrado</div>
      </div>
    );
  }

  const inputClass =
    'w-full pl-12 pr-4 py-3 bg-(--bg-claro) border-2 border-transparent rounded-xl text-(--text-escuro) outline-none cursor-default';

  return (
    <div className="profile-page px-3 sm:px-4 md:px-6 lg:px-8 py-2">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="relative flex items-center justify-center mb-4 py-2">
          <Back />
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-(--text-escuro) mb-1">
              {tipo === 'professor' ? 'Perfil do Professor' : 'Perfil do Aluno'}
            </h1>
            <p className="text-sm sm:text-base text-(--text-cinza)">
              Visualização dos dados cadastrados
            </p>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 mb-4">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {tipo === 'professor' && (
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-(--laranja-principal) shadow-lg">
                  <img
                    src={dadosUser.foto || userIconImg}
                    alt={dadosUser.nome}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-(--text-escuro) mb-1">
                {dadosUser.nome}
              </h2>
              <p className="text-base sm:text-lg text-(--text-cinza)">
                {tipo === 'professor' ? dadosUser.cargo || 'Professor' : 'Aluno'}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 mb-4">
          <h3 className="text-xl font-bold text-(--text-escuro) mb-4 flex items-center gap-2">
            <FiUser className="text-(--laranja-principal)" size={24} />
            Informações Pessoais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-(--text-escuro) mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-cinza)">
                  <FiUser size={20} />
                </div>
                <input type="text" value={dadosUser.nome || ''} className={inputClass} readOnly />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-(--text-escuro) mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-cinza)">
                  <FiMail size={20} />
                </div>
                <input type="email" value={dadosUser.email || ''} className={inputClass} readOnly />
              </div>
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-sm font-semibold text-(--text-escuro) mb-2">
                Data de Nascimento
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-cinza)">
                  <FiCalendar size={20} />
                </div>
                <input
                  type="date"
                  value={dadosUser.dataNascimento || dadosUser.idade || ''}
                  className={inputClass}
                  readOnly
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-semibold text-(--text-escuro) mb-2">
                Telefone
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-cinza)">
                  <FiPhone size={20} />
                </div>
                <input
                  type="tel"
                  value={dadosUser.tipoContato || dadosUser.telefone || ''}
                  className={inputClass}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notificações / Limitações Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 mb-4">
          <h3 className="text-xl font-bold text-(--text-escuro) mb-4 flex items-center gap-2">
            {tipo === 'professor' ? (
              <FiBell className="text-(--laranja-principal)" size={24} />
            ) : (
              <FiAlertCircle className="text-(--laranja-principal)" size={24} />
            )}
            {tipo === 'professor' ? 'Preferências de Notificação' : 'Informações de Saúde'}
          </h3>

          <div className="flex items-center justify-between p-4 bg-(--bg-claro) rounded-xl">
            <div>
              <p className="font-semibold text-(--text-escuro) mb-1">
                {tipo === 'professor' ? 'Receber Notificações' : 'Problema de Mobilidade'}
              </p>
              <p className="text-sm text-(--text-cinza)">
                {tipo === 'professor'
                  ? 'Recebe atualizações sobre suas aulas e lembretes'
                  : 'Aluno possui limitações físicas ou de mobilidade'}
              </p>
            </div>
            <label className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={
                  tipo === 'professor'
                    ? dadosUser.notificacaoAtiva || false
                    : dadosUser.alunoComLimitacoesFisicas || false
                }
                readOnly
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-(--laranja-principal)"></div>
            </label>
          </div>
        </div>

        {/* Observações - apenas aluno */}
        {tipo === 'aluno' && (
          <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 mb-4">
            <h3 className="text-xl font-bold text-(--text-escuro) mb-4 flex items-center gap-2">
              <FiFileText className="text-(--laranja-principal)" size={24} />
              Observações
            </h3>
            <textarea
              value={dadosUser.observacoes || 'Nenhuma observação registrada'}
              rows={4}
              readOnly
              className="w-full p-4 bg-(--bg-claro) border-2 border-transparent rounded-xl text-(--text-escuro) outline-none cursor-default resize-none"
            />
          </div>
        )}

        {/* Especialidades - apenas professor */}
        {tipo === 'professor' && dadosUser.especialidades?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 mb-4">
            <h3 className="text-xl font-bold text-(--text-escuro) mb-4 flex items-center gap-2">
              <FiAward className="text-(--laranja-principal)" size={24} />
              Especialidades
            </h3>
            <div className="flex flex-wrap gap-3">
              {dadosUser.especialidades.map((esp) => (
                <span
                  key={esp.id}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-(--laranja-principal) text-white text-sm font-semibold rounded-full"
                >
                  <span>✓</span>
                  {esp.nome}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
