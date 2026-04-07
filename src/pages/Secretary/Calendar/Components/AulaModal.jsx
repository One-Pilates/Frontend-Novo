import React, { useState, useEffect } from 'react';
import { FiEdit2, FiX, FiTrash2, FiEye, FiEyeOff, FiSave } from 'react-icons/fi';
import AlunoItem from './AlunoItem';
import api from '../../../../services/api';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { getColorForEspecialidade } from '../../../../utils/utils';
import '../styles/Modal.scss';

const AgendamentoModal = ({ isOpen, agendamento, onClose, onDelete }) => {
  const [activeTab, setActiveTab] = useState('informacoes');
  const [editFields, setEditFields] = useState({});
  const [professores, setProfessores] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [salas, setSalas] = useState([]);
  const [todosAlunos, setTodosAlunos] = useState([]);
  const [alunosSelecionados, setAlunosSelecionados] = useState([]);
  const [searchAluno, setSearchAluno] = useState('');
  const [mostrarListaAlunos, setMostrarListaAlunos] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [observacoesExpandidas, setObservacoesExpandidas] = useState({});
  const [observacoesAlunos, setObservacoesAlunos] = useState({});

  useEffect(() => {
    if (editFields.professor !== undefined) {
      api.get('/api/professores').then((res) => setProfessores(res.data || []));
    }
    if (editFields.especialidade !== undefined) {
      api.get('/api/especialidades').then((res) => setEspecialidades(res.data || []));
    }
    if (editFields.sala !== undefined) {
      api.get('/api/salas').then((res) => setSalas(res.data || []));
    }
  }, [editFields]);

  useEffect(() => {
    if (activeTab === 'alunos' && todosAlunos.length === 0) {
      api
        .get('/api/alunos')
        .then((res) => setTodosAlunos(res.data || []))
        .catch((err) => console.error('Erro ao carregar alunos:', err));
    }
  }, [activeTab, todosAlunos.length]);

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

  const handleClose = () => {
    setActiveTab('informacoes');
    setEditFields({});
    setAlunosSelecionados(
      agendamento?.alunos?.map((a) => ({
        id: a.id || 0,
        nome: a.nome,
        observacao: a.observacao || '',
        alunoComLimitacoesFisicas: a.alunoComLimitacoesFisicas ?? false,
      })) || [],
    );
    setSearchAluno('');
    setMostrarListaAlunos(false);
    setObservacoesExpandidas({});
    onClose();
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
      setSearchAluno('');
      setMostrarListaAlunos(false);
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
      toast.success('Observação salva com sucesso!');
    } catch (e) {
      setCarregando(false);
      console.error('Erro ao salvar observação:', e);
      const msg =
        e.response?.data && typeof e.response.data === 'object'
          ? JSON.stringify(e.response.data)
          : e.response?.data || 'Tente novamente.';
      toast.error(`Erro ao salvar: ${msg}`);
    }
  };

  const handleRemoverAluno = (alunoId) => {
    setAlunosSelecionados(alunosSelecionados.filter((a) => a.id !== alunoId));
  };

  const handleSave = async () => {
    const result = await Swal.fire({
      title: 'Confirmar alteração?',
      text: 'Tem certeza que deseja salvar estas alterações?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, salvar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const patchData = {};

      // Sempre enviar todos os campos necessários para validação
      // (data/hora, sala, professor, especialidade e alunos)

      if (editFields.horario !== undefined) {
        const dataAtual = new Date(agendamento.dataHora);
        const [horas, minutos] = editFields.horario.split(':');
        dataAtual.setHours(parseInt(horas), parseInt(minutos));
        patchData.dataHora = dataAtual.toISOString();
      } else {
        // Se não está editando horário, enviar o horário original
        patchData.dataHora = agendamento.dataHora;
      }

      if (editFields.professor !== undefined) {
        const prof = professores.find((p) => p.nome === editFields.professor);
        if (prof) patchData.professorId = prof.id;
      } else {
        // Se não está editando professor, enviar o ID original
        patchData.professorId = agendamento.professorId;
      }

      if (editFields.sala !== undefined) {
        const sala = salas.find((s) => s.nome === editFields.sala);
        if (sala) patchData.salaId = sala.id;
      } else {
        // Se não está editando sala, enviar o ID original
        patchData.salaId = agendamento.salaId;
      }

      if (editFields.especialidade !== undefined) {
        const esp = especialidades.find((e) => e.nome === editFields.especialidade);
        if (esp) patchData.especialidadeId = esp.id;
      } else {
        // Se não está editando especialidade, enviar o ID original
        patchData.especialidadeId = agendamento.especialidadeId;
      }

      const alunosOriginais = agendamento.alunos?.map((a) => a.id) || [];
      const alunosAtuais = alunosSelecionados.map((a) => a.id);

      const alunosMudaram =
        alunosOriginais.length !== alunosAtuais.length ||
        !alunosOriginais.every((id) => alunosAtuais.includes(id));

      if (alunosMudaram) {
        patchData.alunoIds = alunosSelecionados.map((a) => a.id);
      } else {
        // Se alunos não mudaram, enviar os IDs originais
        patchData.alunoIds = alunosOriginais;
      }

      console.log('PATCH enviado para o backend:', patchData);

      try {
        setCarregando(true);
        await api.patch(`/api/agendamentos/${agendamento.id}`, patchData);
        setEditFields({});
        toast.success('Alteração salva com sucesso!');
        window.location.reload();
      } catch (e) {
        setCarregando(false);
        console.error('Erro ao salvar:', e);
        if (e.response) {
          console.error('Resposta do backend:', e.response);
          const errorMsg =
            e.response.data && typeof e.response.data === 'object'
              ? JSON.stringify(e.response.data)
              : e.response.data;
          toast.error(`Erro ao salvar: ${errorMsg}`);
        } else {
          toast.error('Erro ao salvar. Tente novamente.');
        }
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
    setSearchAluno('');
    setMostrarListaAlunos(false);
  };

  const alunosDisponiveis = todosAlunos.filter(
    (aluno) => !alunosSelecionados.find((a) => a.id === aluno.id),
  );

  const alunosMudaram =
    (agendamento.alunos?.length || 0) !== alunosSelecionados.length ||
    !agendamento.alunos?.every((a) => alunosSelecionados.find((s) => s.id === a.id));

  const editFieldsWithoutObs = Object.keys(editFields).filter(
    (k) => !k.startsWith('observacao_'),
  );
  const temMudancas = editFieldsWithoutObs.length > 0 || alunosMudaram;

  if (!isOpen || !agendamento) return null;

  // Obtém a cor da especialidade
  const modalColor = getColorForEspecialidade(agendamento.especialidade).backgroundColor;

  return (
    <div
      className="modal-overlay animate-backdropFadeIn"
      onClick={handleClose}
      style={{
        backgroundColor: `${modalColor}15`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="modal-content animate-slideUp"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `0 0 60px ${modalColor}40, 0 20px 40px rgba(0,0,0,0.15)`,
        }}
      >
        <div className="modal-header" style={{ borderBottomColor: `${modalColor}30` }}>
          <h2 style={{ color: modalColor }}>
            {agendamento.especialidade} - {formatTime(agendamento.dataHora)}h
          </h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="btn-delete-aula"
              onClick={() => onDelete && onDelete(agendamento.id)}
              title="Deletar aula"
            >
              <FiTrash2 size={20} />
            </button>
            <button className="modal-close" onClick={handleClose}>
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'informacoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('informacoes')}
            style={
              activeTab === 'informacoes'
                ? {
                    borderBottomColor: modalColor,
                    color: modalColor,
                  }
                : {}
            }
          >
            Informações
          </button>
          <button
            className={`modal-tab ${activeTab === 'alunos' ? 'active' : ''}`}
            onClick={() => setActiveTab('alunos')}
            style={
              activeTab === 'alunos'
                ? {
                    borderBottomColor: modalColor,
                    color: modalColor,
                  }
                : {}
            }
          >
            Alunos ({alunosSelecionados.length})
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'informacoes' && (
            <div className="info-section">
              <div className="info-group">
                <div className="info-item">
                  <span className="info-label">Professor:</span>
                  <div className="info-content">
                    {editFields.professor !== undefined ? (
                      <select
                        className="info-edit-input"
                        value={editFields.professor}
                        onChange={(e) =>
                          setEditFields((fields) => ({ ...fields, professor: e.target.value }))
                        }
                        style={{
                          borderColor: modalColor,
                          accentColor: modalColor,
                        }}
                      >
                        <option value="">Selecione</option>
                        {professores.map((p) => (
                          <option key={p.id} value={p.nome}>
                            {p.nome}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <span className="info-value">{agendamento.professor}</span>
                        <button
                          className="icon-btn"
                          onClick={() =>
                            setEditFields((fields) => ({
                              ...fields,
                              professor: agendamento.professor || '',
                            }))
                          }
                          title="Editar Professor"
                          style={{ color: modalColor }}
                        >
                          <FiEdit2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-label">Horário:</span>
                  <div className="info-content">
                    {editFields.horario !== undefined ? (
                      <input
                        type="time"
                        className="info-edit-input"
                        value={editFields.horario}
                        onChange={(e) =>
                          setEditFields((fields) => ({ ...fields, horario: e.target.value }))
                        }
                        style={{
                          borderColor: modalColor,
                          accentColor: modalColor,
                        }}
                      />
                    ) : (
                      <>
                        <span className="info-value">{formatTime(agendamento.dataHora)}</span>
                        <button
                          className="icon-btn"
                          onClick={() =>
                            setEditFields((fields) => ({
                              ...fields,
                              horario: agendamento.dataHora
                                ? agendamento.dataHora.substring(11, 16)
                                : '',
                            }))
                          }
                          title="Editar Horário"
                          style={{ color: modalColor }}
                        >
                          <FiEdit2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-label">Sala:</span>
                  <div className="info-content">
                    {editFields.sala !== undefined ? (
                      <select
                        className="info-edit-input"
                        value={editFields.sala}
                        onChange={(e) =>
                          setEditFields((fields) => ({ ...fields, sala: e.target.value }))
                        }
                        style={{
                          borderColor: modalColor,
                          accentColor: modalColor,
                        }}
                      >
                        <option value="">Selecione</option>
                        {salas.map((s) => (
                          <option key={s.id} value={s.nome}>
                            {s.nome}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <span className="info-value">{agendamento.sala}</span>
                        <button
                          className="icon-btn"
                          onClick={() =>
                            setEditFields((fields) => ({ ...fields, sala: agendamento.sala || '' }))
                          }
                          title="Editar Sala"
                          style={{ color: modalColor }}
                        >
                          <FiEdit2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-label">Especialidade:</span>
                  <div className="info-content">
                    {editFields.especialidade !== undefined ? (
                      <select
                        className="info-edit-input"
                        value={editFields.especialidade}
                        onChange={(e) =>
                          setEditFields((fields) => ({ ...fields, especialidade: e.target.value }))
                        }
                        style={{
                          borderColor: modalColor,
                          accentColor: modalColor,
                        }}
                      >
                        <option value="">Selecione</option>
                        {especialidades.map((e) => (
                          <option key={e.id} value={e.nome}>
                            {e.nome}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <span className="info-value">{agendamento.especialidade}</span>
                        <button
                          className="icon-btn"
                          onClick={() =>
                            setEditFields((fields) => ({
                              ...fields,
                              especialidade: agendamento.especialidade || '',
                            }))
                          }
                          title="Editar Especialidade"
                          style={{ color: modalColor }}
                        >
                          <FiEdit2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {temMudancas && (
                <div className="edit-actions">
                  <button className="btn-cancel" onClick={handleCancel} disabled={carregando}>
                    Cancelar
                  </button>
                  <button
                    className="btn-save"
                    onClick={handleSave}
                    disabled={carregando}
                    style={{ backgroundColor: modalColor }}
                  >
                    {carregando ? '⏳ Salvando...' : 'Salvar Alteração'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'alunos' && (
            <div className="alunos-section">
              <div className="adicionar-aluno-box">
                <div className="adicionar-aluno-label">Adicionar Aluno</div>
                <div className="adicionar-aluno-form">
                  <div className="search-container">
                    <input
                      type="text"
                      className="aluno-search"
                      placeholder="Pesquisar aluno..."
                      value={searchAluno}
                      onChange={(e) => {
                        setSearchAluno(e.target.value);
                        setMostrarListaAlunos(true);
                      }}
                      onFocus={() => setMostrarListaAlunos(true)}
                      style={{
                        borderColor: modalColor,
                        accentColor: modalColor,
                      }}
                    />
                    {mostrarListaAlunos && (
                      <div className="search-results">
                        {alunosDisponiveis
                          .filter((aluno) =>
                            aluno.nome.toLowerCase().includes(searchAluno.toLowerCase()),
                          )
                          .slice(0, 10)
                          .map((aluno) => (
                            <div
                              key={aluno.id}
                              className="search-result-item"
                              onClick={() => handleAdicionarAluno(aluno)}
                            >
                              {aluno.nome}
                            </div>
                          ))}
                        {alunosDisponiveis.filter((aluno) =>
                          aluno.nome.toLowerCase().includes(searchAluno.toLowerCase()),
                        ).length === 0 &&
                          searchAluno && (
                            <div className="search-result-item empty">Nenhum aluno encontrado</div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lista-alunos-label">Alunos na Aula ({alunosSelecionados.length})</div>
              {alunosSelecionados.length > 0 ? (
                <div className="lista-alunos">
                  {alunosSelecionados.map((aluno) => {
                    const observacaoAtual =
                      observacoesAlunos[aluno.id] !== undefined
                        ? observacoesAlunos[aluno.id]
                        : aluno.observacao || '';
                    const editando = editFields[`observacao_${aluno.id}`] !== undefined;
                    const expandido = observacoesExpandidas[aluno.id] || false;

                    return (
                      <div
                        key={aluno.id}
                        style={{
                          marginBottom: '0.75rem',
                          padding: '0.75rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                        }}
                      >
                        <div className="aluno-item-wrapper" style={{ marginBottom: expandido ? '0.5rem' : 0 }}>
                          <AlunoItem
                            nome={aluno.nome}
                            alunoComLimitacoesFisicas={aluno.alunoComLimitacoesFisicas}
                          />
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              className="icon-btn"
                              onClick={() =>
                                setObservacoesExpandidas((prev) => ({
                                  ...prev,
                                  [aluno.id]: !prev[aluno.id],
                                }))
                              }
                              title={expandido ? 'Ocultar observação' : 'Ver observação'}
                              style={{ color: modalColor }}
                            >
                              {expandido ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                            </button>
                            <button
                              className="btn-remover-aluno"
                              onClick={() => handleRemoverAluno(aluno.id)}
                              title="Remover aluno"
                              style={{
                                color: modalColor,
                                borderColor: modalColor,
                              }}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {expandido && (
                          <div>
                            {editando ? (
                              <div>
                                <textarea
                                  className="info-edit-input"
                                  value={editFields[`observacao_${aluno.id}`]}
                                  onChange={(e) =>
                                    setEditFields((f) => ({
                                      ...f,
                                      [`observacao_${aluno.id}`]: e.target.value,
                                    }))
                                  }
                                  rows={3}
                                  placeholder="Observação sobre este aluno nesta aula..."
                                  style={{ width: '100%', borderColor: modalColor }}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                  <button
                                    className="icon-btn"
                                    onClick={() =>
                                      setEditFields((f) => {
                                        const next = { ...f };
                                        delete next[`observacao_${aluno.id}`];
                                        return next;
                                      })
                                    }
                                    title="Cancelar"
                                  >
                                    <FiX size={15} />
                                  </button>
                                  <button
                                    className="icon-btn"
                                    onClick={() => handleSalvarObservacaoAluno(aluno.id)}
                                    title="Salvar observação"
                                    disabled={carregando}
                                    style={{ color: modalColor }}
                                  >
                                    <FiSave size={15} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <span className="info-value" style={{ flex: 1 }}>
                                  {observacaoAtual && observacaoAtual.trim() !== ''
                                    ? observacaoAtual
                                    : 'Sem observação.'}
                                </span>
                                <button
                                  className="icon-btn"
                                  onClick={() =>
                                    setEditFields((f) => ({
                                      ...f,
                                      [`observacao_${aluno.id}`]: observacaoAtual || '',
                                    }))
                                  }
                                  title="Editar observação"
                                  style={{ color: modalColor }}
                                >
                                  <FiEdit2 size={15} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                  Nenhum aluno neste agendamento.
                </p>
              )}

              {(alunosMudaram) && (
                <div className="edit-actions">
                  <button className="btn-cancel" onClick={handleCancel} disabled={carregando}>
                    Cancelar
                  </button>
                  <button
                    className="btn-save"
                    onClick={handleSave}
                    disabled={carregando}
                    style={{ backgroundColor: modalColor }}
                  >
                    {carregando ? '⏳ Salvando...' : 'Salvar Alteração'}
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
