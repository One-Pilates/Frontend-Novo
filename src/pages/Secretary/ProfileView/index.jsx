import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import userIconImg from '/user-icon.png';
import Back from '../../../components/Back';
import '../../Teacher/Profile/style.scss';
import { formatarTelefone } from '../../../utils/utils';

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
        console.log(`Dados do ${tipo} recebidos:`, data);

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
        <div className="text-lg text-gray-600 dark:text-fontSec">Carregando perfil...</div>
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

  return (
    <div className="profile-user">
      <div className="profile-user__header">
        <Back />
        {tipo === 'professor' && (
          <div className="profile-user__foto-container">
            <img
              src={dadosUser.foto || userIconImg}
              alt={dadosUser.nome}
              className="profile-user__foto"
            />
          </div>
        )}

        <div className="profile-user__info">
          <h2 className="profile-user__nome">{dadosUser.nome}</h2>
          <p className="profile-user__cargo">{tipo === 'professor' ? 'Professor' : 'Aluno'}</p>
        </div>
      </div>
      <hr className="mt-2 mb-2" />
      <div className="profile-user__form">
        <div className="profile-user__row">
          <div className="profile-user__field">
            <label className="profile-user__label">Nome Completo</label>
            <div className="profile-user__input-group">
              <input
                type="text"
                value={dadosUser.nome || ''}
                className="profile-user__input"
                disabled
              />
            </div>
          </div>

          <div className="profile-user__field">
            <label className="profile-user__label">Email</label>
            <div className="profile-user__input-group">
              <input
                type="email"
                value={dadosUser.email || ''}
                className="profile-user__input"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="profile-user__row">
          <div className="profile-user__field">
            <label className="profile-user__label">Data de nascimento</label>
            <input
              type="date"
              value={dadosUser.dataNascimento || dadosUser.idade || ''}
              className="profile-user__input"
              disabled
            />
          </div>

          <div className="profile-user__field">
            <label className="profile-user__label">Telefone</label>
            <input
              type="tel"
              value={formatarTelefone(dadosUser.telefone)}
              className="profile-user__input"
              disabled
            />
          </div>
        </div>

        <div className="profile-user__row profile-user__row--align-end">
          <div className="profile-user__notification">
            <span className="profile-user__notification-text">
              {tipo === 'professor'
                ? 'Deseja receber notificação?'
                : 'Possui problema de mobilidade?'}
            </span>

            <label className="profile-user__switch">
              <input
                type="checkbox"
                checked={
                  tipo === 'professor'
                    ? dadosUser.notificacaoAtiva || false
                    : dadosUser.alunoComLimitacoesFisicas || false
                }
                aria-label={
                  tipo === 'professor' ? 'Receber notificações' : 'Aluno com limitações físicas'
                }
                disabled
              />
              <span className="profile-user__switch-slider" />
            </label>
          </div>
        </div>

        {tipo === 'aluno' && (
          <div className="profile-user__field">
            <label className="profile-user__label">Observações</label>
            <textarea
              value={dadosUser.observacoes || ''}
              className="profile-user__input"
              rows={4}
              disabled
            />
          </div>
        )}

        {tipo === 'professor' && dadosUser.especialidades?.length > 0 && (
          <div className="profile-user__especialidades">
            <label className="profile-user__label">Especialidades</label>
            <div className="profile-user__checkbox-container">
              {dadosUser.especialidades.map((esp) => (
                <label key={esp.id} className="profile-user__checkbox">
                  <input type="checkbox" checked={true} disabled />
                  <span>{esp.nome}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
