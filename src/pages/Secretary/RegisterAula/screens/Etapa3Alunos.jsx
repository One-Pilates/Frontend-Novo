import React from 'react';
import { FiUserPlus, FiTrash2 } from 'react-icons/fi';
import { FaWheelchair } from 'react-icons/fa';

export default function Etapa3Alunos({
  alunos,
  alunosDisponiveis,
  erros,
  handleAdicionarAluno,
  handleRemoverAluno,
}) {
  const alunosOrdenados = [...(alunosDisponiveis || [])].sort((a, b) =>
    (a?.nome || '').localeCompare(b?.nome || '', 'pt-BR', { sensitivity: 'base' }),
  );

  const getInitials = (nome) => {
    const partes = nome?.trim().split(' ') || [];
    if (partes.length === 1) return partes[0][0]?.toUpperCase() || '?';
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  return (
    <div className="etapa-content">
      <div className="etapa-header">
        <div className="etapa-icon">
          <FiUserPlus size={22} />
        </div>
        <div className="etapa-title-group">
          <h2>Quais alunos participarão?</h2>
          <p>Selecione os alunos na lista em ordem alfabética</p>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="select-aluno">
          Selecionar Aluno <span className="required">*</span>
        </label>
        <select
          id="select-aluno"
          defaultValue=""
          onChange={(e) => {
            const alunoSelecionado = alunosOrdenados.find((aluno) => String(aluno.id) === e.target.value);
            if (alunoSelecionado) {
              handleAdicionarAluno(alunoSelecionado);
              e.target.value = '';
            }
          }}
        >
          <option value="" disabled>
            Selecionar aluno
          </option>
          {alunosOrdenados.length === 0 ? (
            <option value="" disabled>
              Nenhum aluno disponivel
            </option>
          ) : (
            alunosOrdenados.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>
                {aluno.nome}
                {aluno.alunoComLimitacoesFisicas ? ' (PCD)' : ''}
              </option>
            ))
          )}
        </select>
        {erros.alunos && <span className="error-message">{erros.alunos}</span>}
      </div>

      <div className={`alunos-selecionados${alunos.length > 0 ? ' tem-alunos' : ''}`}>
        <div className="alunos-header">
          <h3>Alunos Selecionados</h3>
          {alunos.length > 0 && (
            <span className="alunos-counter">{alunos.length}</span>
          )}
        </div>

        {alunos.length > 0 ? (
          <div className="alunos-list">
            {alunos.map((aluno) => (
              <div key={aluno.id} className="aluno-card">
                <div className="aluno-info">
                  <div className="aluno-avatar">{getInitials(aluno.nome)}</div>
                  <div>
                    <span className="aluno-nome">{aluno.nome}</span>
                    {aluno.alunoComLimitacoesFisicas && (
                      <div className="pcd-badge">
                        <FaWheelchair size={11} /> PCD
                      </div>
                    )}
                  </div>
                </div>
                <button
                  className="btn-remove-aluno"
                  onClick={() => handleRemoverAluno(aluno.id)}
                  title="Remover aluno"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-alunos">Nenhum aluno adicionado ainda</p>
        )}
      </div>
    </div>
  );
}
