import React, { useState, useEffect } from 'react';
import {
  FiEdit2,
  FiX,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiSave,
  FiClock,
  FiUser,
  FiMapPin,
  FiBookOpen,
  FiUserPlus,
  FiHash,
} from 'react-icons/fi';
import { FaWheelchair } from 'react-icons/fa';
import api from '../../../../services/api';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { getColorForEspecialidade } from '../../../../utils/utils';
import { buildPromptRecomendacao } from '../../../../config/iaPrompts';
import '../styles/Modal.scss';



const AgendamentoModal = ({ isOpen, agendamento, onClose, onDelete }) => {
  const [activeTab, setActiveTab] = useState('informacoes');
  const [editFields, setEditFields] = useState({});
  const [professores, setProfessores] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [salas, setSalas] = useState([]);
  const [todosAlunos, setTodosAlunos] = useState([]);
  const [alunosSelecionados, setAlunosSelecionados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [observacoesExpandidas, setObservacoesExpandidas] = useState({});
  const [observacoesAlunos, setObservacoesAlunos] = useState({});
  const [iaRecomendacoes, setiaRecomendacoes] = useState({});
  const [iaCarregando, setiaCarregando] = useState({});

  const extrairLista = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;

    // Tenta buscar em 'content', 'professores', 'data', etc.
    const data = payload.data || payload;
    if (Array.isArray(data)) return data;

    if (data.content && Array.isArray(data.content)) return data.content;
    if (data.professores && Array.isArray(data.professores)) return data.professores;
    if (data.alunos && Array.isArray(data.alunos)) return data.alunos;
    if (data.salas && Array.isArray(data.salas)) return data.salas;
    if (data.especialidades && Array.isArray(data.especialidades)) return data.especialidades;
    if (data.results && Array.isArray(data.results)) return data.results;

    return [];
  };

  const normalizarAluno = (aluno) => {
    const id = aluno?.id ?? aluno?.idAluno ?? aluno?.alunoId ?? null;
    const nome = aluno?.nome ?? aluno?.nomeCompleto ?? aluno?.alunoNome ?? '';

    return {
      ...aluno,
      id,
      nome,
      alunoComLimitacoesFisicas: aluno?.alunoComLimitacoesFisicas ?? false,
    };
  };

  useEffect(() => {
    if (isOpen) {
      setCarregando(true);

      // Buscamos tudo de uma vez para garantir que os dados estejam lá quando o usuário for editar
      Promise.all([
        api.get('/api/alunos').catch(() => ({ data: [] })),
        api.get('/api/professores').catch(() => ({ data: [] })),
        api.get('/api/salas').catch(() => ({ data: [] })),
        api.get('/api/especialidades').catch(() => ({ data: [] })),
      ])
        .then(([alunoRes, profRes, salaRes, espRes]) => {
          // Processar Alunos
          const alunRaw = extrairLista(alunoRes.data);
          const alunNorm = alunRaw.map(normalizarAluno).filter((a) => a.id && a.nome);
          setTodosAlunos(alunNorm);

          // Processar Professores (com normalização de nome e ID)
          const profRaw = extrairLista(profRes.data);
          setProfessores(
            profRaw.map((p) => ({
              ...p,
              id: p.id || p.idProfessor || p.professorId,
              nome: p.nome || p.nomeCompleto || p.professorNome || 'Professor sem nome',
            })),
          );

          // Processar Salas e Especialidades
          setSalas(extrairLista(salaRes.data));
          setEspecialidades(extrairLista(espRes.data));
        })
        .catch((err) => {
          console.error('Erro ao carregar dados do modal:', err);
          toast.error('Erro ao carregar dados. Algumas funções podem estar indisponíveis.');
        })
        .finally(() => {
          setCarregando(false);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (agendamento?.alunos) {
      setAlunosSelecionados(
        agendamento.alunos.map((a) => ({
          id: a.id || 0,
          nome: a.nome,
          observacao: a.observacao || '',
          alunoComLimitacoesFisicas: a.alunoComLimitacoesFisicas ?? false,
        })),
      );
      const obsMap = {};
      agendamento.alunos.forEach((a) => {
        if (a.observacao) obsMap[a.id] = a.observacao;
      });
      setObservacoesAlunos(obsMap);
    }
  }, [agendamento]);

  if (!isOpen || !agendamento) return null;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (nome) => {
    if (!nome) return 'UA';
    const names = nome.trim().split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const getAvatarColor = (nome) => {
    const colors = ['#f77433', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b'];
    const charCode = nome ? nome.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setActiveTab('informacoes');
      setEditFields({});
    }, 300);
  };

  const handleAdicionarAluno = (aluno) => {
    if (aluno && !alunosSelecionados.find((a) => a.id === aluno.id)) {
      setAlunosSelecionados([
        ...alunosSelecionados,
        {
          id: aluno.id,
          nome: aluno.nome,
          observacao: aluno.observacao || '',
          alunoComLimitacoesFisicas: aluno.alunoComLimitacoesFisicas ?? false,
        },
      ]);
    }
  };

  const handleSalvarObservacaoAluno = async (alunoId) => {
    const observacao = editFields[`observacao_${alunoId}`] || '';
    try {
      setCarregando(true);
      await api.patch(`/api/agendamentos/${agendamento.id}/alunos/${alunoId}/observacao`, {
        observacao: observacao || null,
      });
      setObservacoesAlunos((prev) => ({ ...prev, [alunoId]: observacao || null }));
      setEditFields((fields) => {
        const next = { ...fields };
        delete next[`observacao_${alunoId}`];
        return next;
      });
      setCarregando(false);
      toast.success('Observação salva!');
    } catch {
      setCarregando(false);
      toast.error('Erro ao salvar observação');
    }
  };

  const handlePedirRecomendacaoIA = async (alunoId, nomeAluno, observacao, especialidade) => {
    if (!observacao || !observacao.trim()) return;

    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!groqKey) {
      toast.error('Chave da IA não configurada. Verifique o arquivo .env');
      return;
    }

    setiaCarregando((prev) => ({ ...prev, [alunoId]: true }));
    setiaRecomendacoes((prev) => ({ ...prev, [alunoId]: null }));

    const prompt = buildPromptRecomendacao({ nomeAluno, observacao, especialidade });

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.error?.message || `Erro ${response.status}`);
      }

      const data = await response.json();
      const texto =
        data?.choices?.[0]?.message?.content ||
        'Não foi possível gerar uma recomendação.';

      setiaRecomendacoes((prev) => ({ ...prev, [alunoId]: texto }));
    } catch (err) {
      console.error('Erro IA:', err);
      toast.error('Não foi possível gerar recomendação. Tente novamente.');
    } finally {
      setiaCarregando((prev) => ({ ...prev, [alunoId]: false }));
    }
  };

  const handleRemoverAluno = (alunoId) => {
    setAlunosSelecionados(alunosSelecionados.filter((a) => a.id !== alunoId));
  };

  const handleSave = async () => {
    const result = await Swal.fire({
      title: 'Salvar alterações?',
      text: 'Tem certeza que deseja atualizar os dados da aula?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, atualizar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const patchData = {};

      if (editFields.horario !== undefined) {
        // Pegamos apenas a parte da data (YYYY-MM-DD) e concatenamos com o novo horário local
        const dataParte = agendamento.dataHora.substring(0, 10);
        patchData.dataHora = `${dataParte}T${editFields.horario}:00`;
      } else {
        patchData.dataHora = agendamento.dataHora;
      }

      patchData.professorId =
        editFields.professorId !== undefined
          ? Number(editFields.professorId)
          : agendamento.professorId || agendamento.idProfessor;
      patchData.salaId =
        editFields.salaId !== undefined ? Number(editFields.salaId) : agendamento.salaId;
      patchData.especialidadeId =
        editFields.especialidadeId !== undefined
          ? Number(editFields.especialidadeId)
          : agendamento.especialidadeId;
      patchData.alunoIds = alunosSelecionados.map((a) => a.id);

      try {
        setCarregando(true);
        await api.patch(`/api/agendamentos/${agendamento.id}`, patchData);
        setEditFields({});
        toast.success('Aula atualizada com sucesso!');

        // Pequeno delay para o usuário ver o toast antes de recarregar
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (e) {
        setCarregando(false);
        console.error('Erro ao salvar:', e.response?.data);
        toast.error(
          e.response?.data?.message || e.response?.data?.erro || 'Erro ao salvar alterações',
        );
      }
    }
  };

  const handleCancel = () => {
    setEditFields({});
    setAlunosSelecionados(
      agendamento?.alunos?.map((a) => ({
        id: a.id || 0,
        nome: a.nome,
        observacao: a.observacao || '',
        alunoComLimitacoesFisicas: a.alunoComLimitacoesFisicas ?? false,
      })) || [],
    );
  };

  const alunosOrdenados = [...todosAlunos].sort((a, b) =>
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' }),
  );

  const alunosDisponiveis = alunosOrdenados.filter(
    (aluno) => !alunosSelecionados.find((a) => a.id === aluno.id),
  );

  const alunosMudaram =
    (agendamento.alunos?.length || 0) !== alunosSelecionados.length ||
    !agendamento.alunos?.every((a) => alunosSelecionados.find((s) => s.id === a.id));

  const editFieldsWithoutObs = Object.keys(editFields).filter((k) => !k.startsWith('observacao_'));
  const temMudancas = editFieldsWithoutObs.length > 0 || alunosMudaram;

  const { backgroundColor: modalColor } = getColorForEspecialidade(agendamento.especialidade);

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ color: modalColor }}>
            <FiBookOpen size={24} />
            {agendamento.especialidade}
          </h2>
          <div className="header-actions">
            <button
              className="btn-delete-aula"
              onClick={() => onDelete && onDelete(agendamento.id)}
              title="Deletar aula"
            >
              <FiTrash2 size={18} />
            </button>
            <button className="modal-close" onClick={handleClose}>
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'informacoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('informacoes')}
          >
            Informações
          </button>
          <button
            className={`modal-tab ${activeTab === 'alunos' ? 'active' : ''}`}
            onClick={() => setActiveTab('alunos')}
          >
            Alunos ({alunosSelecionados.length})
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'informacoes' && (
            <div className="info-section">
              <div className="info-grid">
                {/* Professor */}
                <div className="info-item">
                  <span className="info-label">
                    <FiUser size={14} /> Professor
                  </span>
                  <div className="info-content">
                    {editFields.professorId !== undefined ? (
                      <select
                        className="info-edit-input"
                        value={editFields.professorId}
                        onChange={(e) =>
                          setEditFields({ ...editFields, professorId: e.target.value })
                        }
                        style={{ borderColor: modalColor }}
                      >
                        <option value="">Selecione</option>
                        {professores.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <span className="info-value">
                          {agendamento.professorNome || agendamento.professor || 'Não informado'}
                        </span>
                        <button
                          className="icon-btn"
                          style={{ color: modalColor }}
                          onClick={() =>
                            setEditFields({
                              ...editFields,
                              professorId: agendamento.professorId || agendamento.idProfessor || '',
                            })
                          }
                        >
                          <FiEdit2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Horário */}
                <div className="info-item">
                  <span className="info-label">
                    <FiClock size={14} /> Horário
                  </span>
                  <div className="info-content">
                    {editFields.horario !== undefined ? (
                      <input
                        type="time"
                        className="info-edit-input"
                        value={editFields.horario}
                        onChange={(e) => setEditFields({ ...editFields, horario: e.target.value })}
                        style={{ borderColor: modalColor }}
                      />
                    ) : (
                      <>
                        <span className="info-value">{formatTime(agendamento.dataHora)}h</span>
                        <button
                          className="icon-btn"
                          style={{ color: modalColor }}
                          onClick={() =>
                            setEditFields({
                              ...editFields,
                              horario: agendamento.dataHora?.substring(11, 16) || '',
                            })
                          }
                        >
                          <FiEdit2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Sala */}
                <div className="info-item">
                  <span className="info-label">
                    <FiMapPin size={14} /> Sala
                  </span>
                  <div className="info-content">
                    {editFields.salaId !== undefined ? (
                      <select
                        className="info-edit-input"
                        value={editFields.salaId}
                        onChange={(e) => setEditFields({ ...editFields, salaId: e.target.value })}
                        style={{ borderColor: modalColor }}
                      >
                        <option value="">Selecione</option>
                        {salas.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nome}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <span className="info-value">
                          {agendamento.salaNome || agendamento.sala || 'Não informada'}
                        </span>
                        <button
                          className="icon-btn"
                          style={{ color: modalColor }}
                          onClick={() =>
                            setEditFields({ ...editFields, salaId: agendamento.salaId || '' })
                          }
                        >
                          <FiEdit2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Especialidade */}
                <div className="info-item">
                  <span className="info-label">
                    <FiHash size={14} /> Especialidade
                  </span>
                  <div className="info-content">
                    {editFields.especialidadeId !== undefined ? (
                      <select
                        className="info-edit-input"
                        value={editFields.especialidadeId}
                        onChange={(e) =>
                          setEditFields({ ...editFields, especialidadeId: e.target.value })
                        }
                        style={{ borderColor: modalColor }}
                      >
                        <option value="">Selecione</option>
                        {especialidades.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.nome}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <span className="info-value">{agendamento.especialidade}</span>
                        <button
                          className="icon-btn"
                          style={{ color: modalColor }}
                          onClick={() =>
                            setEditFields({
                              ...editFields,
                              especialidadeId: agendamento.especialidadeId || '',
                            })
                          }
                        >
                          <FiEdit2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {temMudancas && (
                <div className="edit-actions">
                  <button className="btn-cancel" onClick={handleCancel}>
                    Cancelar
                  </button>
                  <button
                    className="btn-save"
                    onClick={handleSave}
                    disabled={carregando}
                    style={{ background: modalColor }}
                  >
                    {carregando ? '⏳' : <FiSave size={16} />} Salvar
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'alunos' && (
            <div className="alunos-section">
              <div className="adicionar-aluno-box">
                <span className="info-label" style={{ marginBottom: '10px' }}>
                  <FiUserPlus size={14} /> Adicionar novo aluno
                </span>
                <select
                  className="aluno-select"
                  value=""
                  onChange={(e) => {
                    const select = todosAlunos.find((a) => String(a.id) === e.target.value);
                    if (select) handleAdicionarAluno(select);
                  }}
                >
                  <option value="" disabled>
                    Selecionar aluno...
                  </option>
                  {alunosDisponiveis.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome} {a.alunoComLimitacoesFisicas ? '♿ (PCD)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lista-alunos">
                {alunosSelecionados.map((aluno) => {
                  const expandido = observacoesExpandidas[aluno.id];
                  const editando = editFields[`observacao_${aluno.id}`] !== undefined;
                  const labelObs = observacoesAlunos[aluno.id] || aluno.observacao || '';

                  return (
                    <div key={aluno.id} className="aluno-card-wrapper">
                      <div className="aluno-card-premium">
                        <div className="aluno-main-info">
                          <div
                            className="aluno-avatar"
                            style={{ background: getAvatarColor(aluno.nome) }}
                          >
                            {getInitials(aluno.nome)}
                          </div>
                          <div className="aluno-details">
                            <span className="aluno-nome">{aluno.nome}</span>
                            <div className="aluno-tags">
                              {aluno.alunoComLimitacoesFisicas && (
                                <span className="tag-pcd">
                                  <FaWheelchair size={10} /> PCD
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="aluno-actions">
                          <button
                            className="btn-action-circle view"
                            onClick={() =>
                              setObservacoesExpandidas({
                                ...observacoesExpandidas,
                                [aluno.id]: !expandido,
                              })
                            }
                          >
                            {expandido ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                          </button>
                          <button
                            className="btn-action-circle delete"
                            onClick={() => handleRemoverAluno(aluno.id)}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {expandido && (
                        <div className="observacao-edit-box">
                          {editando ? (
                            <>
                              <textarea
                                className="obs-textarea"
                                value={editFields[`observacao_${aluno.id}`]}
                                onChange={(e) =>
                                  setEditFields({
                                    ...editFields,
                                    [`observacao_${aluno.id}`]: e.target.value,
                                  })
                                }
                                rows={3}
                                autoFocus
                              />
                              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button
                                  className="icon-btn"
                                  onClick={() => {
                                    const next = { ...editFields };
                                    delete next[`observacao_${aluno.id}`];
                                    setEditFields(next);
                                  }}
                                >
                                  <FiX size={14} />
                                </button>
                                <button
                                  className="icon-btn"
                                  onClick={() => handleSalvarObservacaoAluno(aluno.id)}
                                  style={{ color: modalColor }}
                                >
                                  <FiSave size={14} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '8px',
                              }}
                            >
                              <p style={{ fontSize: '0.875rem', color: '#666', margin: 0, flex: 1 }}>
                                {labelObs || 'Sem observações.'}
                              </p>
                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                {labelObs && (
                                  <button
                                    className="btn-oneia-obs"
                                    title="Receber recomendação da IA"
                                    onClick={() =>
                                      handlePedirRecomendacaoIA(
                                        aluno.id,
                                        aluno.nome,
                                        labelObs,
                                        agendamento.especialidade,
                                      )
                                    }
                                    disabled={iaCarregando[aluno.id]}
                                  >
                                    ✨
                                  </button>
                                )}
                                <button
                                  className="icon-btn"
                                  style={{ color: modalColor, marginTop: '-4px' }}
                                  onClick={() =>
                                    setEditFields({
                                      ...editFields,
                                      [`observacao_${aluno.id}`]: labelObs,
                                    })
                                  }
                                >
                                  <FiEdit2 size={18} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Painel de recomendação OneIA */}
                          {iaCarregando[aluno.id] && (
                            <div className="oneia-loading-panel">
                              <div className="oneia-shimmer" />
                              <div className="oneia-shimmer" style={{ width: '80%' }} />
                              <div className="oneia-shimmer" style={{ width: '90%' }} />
                            </div>
                          )}
                          {!iaCarregando[aluno.id] && iaRecomendacoes[aluno.id] && (
                            <div className="oneia-response-panel">
                              <div className="oneia-response-header">
                                <span className="oneia-badge">✨ OneIA - Recomendação</span>
                                <button
                                  className="oneia-close-btn"
                                  onClick={() =>
                                    setiaRecomendacoes((prev) => ({
                                      ...prev,
                                      [aluno.id]: null,
                                    }))
                                  }
                                >
                                  <FiX size={14} />
                                </button>
                              </div>
                              <div className="oneia-response-body">
                                {iaRecomendacoes[aluno.id]
                                  .split('\n')
                                  .map((linha, i) =>
                                    linha.trim() ? (
                                      <p key={i} className="oneia-linha">
                                        {linha
                                          .replace(/\*\*(.*?)\*\*/g, '$1')
                                          .replace(/\*(.*?)\*/g, '$1')}
                                      </p>
                                    ) : (
                                      <br key={i} />
                                    ),
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {alunosSelecionados.length === 0 && (
                  <div className="lista-vazia">
                    <FiUser size={48} />
                    <p>Nenhum aluno vinculado a esta aula.</p>
                  </div>
                )}
              </div>

              {alunosMudaram && activeTab === 'alunos' && (
                <div className="edit-actions">
                  <button className="btn-cancel" onClick={handleCancel}>
                    Restaurar
                  </button>
                  <button
                    className="btn-save"
                    onClick={handleSave}
                    disabled={carregando}
                    style={{ background: modalColor }}
                  >
                    {carregando ? '⏳' : <FiSave size={16} />} Salvar Lista
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendamentoModal;

