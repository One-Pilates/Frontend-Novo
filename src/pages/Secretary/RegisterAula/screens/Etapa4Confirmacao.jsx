import React from 'react';
import { FiEdit2, FiCalendar, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { FaWheelchair } from 'react-icons/fa';

export default function Etapa4Confirmacao({
  dataHora,
  professor,
  sala,
  especialidade,
  alunos,
  todosAlunos = [],
  professores,
  salas,
  especialidades,
  irParaEtapa,
}) {
  const professoresMap = professores.find((p) => p.id === parseInt(professor));
  const salasMap = salas.find((s) => s.id === parseInt(sala));
  const especialidadesMap = especialidades.find((e) => e.id === parseInt(especialidade));

  const getAlunoCompleto = (aluno) => {
    const completo = todosAlunos.find((a) => a.id === aluno.id);
    return completo || aluno;
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '—';
    const d = new Date(dataStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="etapa-content">
      <div className="etapa-header">
        <div className="etapa-icon" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
          <FiCheckCircle size={22} />
        </div>
        <div className="etapa-title-group">
          <h2>Confirme os dados</h2>
          <p>Revise as informações antes de criar a aula</p>
        </div>
      </div>

      <div className="summary-banner">
        <div className="summary-icon">
          <FiCalendar size={20} />
        </div>
        <div className="summary-text">
          <h4>
            {especialidadesMap?.nome || '—'} — {dataHora.horario || '—'}h
          </h4>
          <p>
            {formatarData(dataHora.data)} · {salasMap?.nome || '—'} · Prof. {professoresMap?.nome || '—'}
          </p>
        </div>
      </div>

      <div className="confirmation-card">
        {/* Data e Hora */}
        <div className="confirmation-section">
          <div className="section-title-row">
            <span className="section-title">
              <FiCalendar size={13} className="section-icon" />
              Data e Hora
            </span>
            {irParaEtapa && (
              <button className="btn-edit-mini" onClick={() => irParaEtapa(1)}>
                <FiEdit2 size={12} /> Editar
              </button>
            )}
          </div>
          <div className="confirmation-item">
            <span className="label">Data:</span>
            <span className="value">{formatarData(dataHora.data)}</span>
          </div>
          <div className="confirmation-item">
            <span className="label">Horário:</span>
            <span className="value">{dataHora.horario ? `${dataHora.horario}h` : '—'}</span>
          </div>
        </div>

        {/* Turma */}
        <div className="confirmation-section">
          <div className="section-title-row">
            <span className="section-title">
              <FiUsers size={13} className="section-icon" />
              Turma
            </span>
            {irParaEtapa && (
              <button className="btn-edit-mini" onClick={() => irParaEtapa(2)}>
                <FiEdit2 size={12} /> Editar
              </button>
            )}
          </div>
          <div className="confirmation-item">
            <span className="label">Especialidade:</span>
            <span className="value">{especialidadesMap?.nome || '—'}</span>
          </div>
          <div className="confirmation-item">
            <span className="label">Sala:</span>
            <span className="value">{salasMap?.nome || '—'}</span>
          </div>
          <div className="confirmation-item">
            <span className="label">Professor:</span>
            <span className="value">{professoresMap?.nome || '—'}</span>
          </div>
        </div>

        {/* Alunos */}
        <div className="confirmation-section">
          <div className="section-title-row">
            <span className="section-title">
              <FiUsers size={13} className="section-icon" />
              Alunos ({alunos.length})
            </span>
            {irParaEtapa && (
              <button className="btn-edit-mini" onClick={() => irParaEtapa(3)}>
                <FiEdit2 size={12} /> Editar
              </button>
            )}
          </div>
          {alunos.length > 0 ? (
            <div className="alunos-confirmation">
              {alunos.map((aluno) => {
                const alunoCompleto = getAlunoCompleto(aluno);
                return (
                  <div key={aluno.id} className="aluno-confirmation">
                    {aluno.nome}
                    {alunoCompleto.alunoComLimitacoesFisicas && (
                      <FaWheelchair size={12} style={{ opacity: 0.9 }} title="Limitação física" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-cinza)', fontSize: '0.875rem' }}>
              Nenhum aluno selecionado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
