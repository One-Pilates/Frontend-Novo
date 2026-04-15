import React from 'react';
import { FiUsers, FiAlertCircle } from 'react-icons/fi';

export default function Etapa2Turma({
  professor,
  setProfessor,
  sala,
  setSala,
  especialidade,
  setEspecialidade,
  professores,
  salas,
  especialidades,
  erros,
}) {
  return (
    <div className="etapa-content">
      <div className="etapa-header">
        <div className="etapa-icon">
          <FiUsers size={22} />
        </div>
        <div className="etapa-title-group">
          <h2>Qual é a turma?</h2>
          <p>Defina especialidade, sala e professor responsável</p>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="especialidade">
          Especialidade <span className="required">*</span>
        </label>
        <select
          id="especialidade"
          value={especialidade}
          onChange={(e) => setEspecialidade(e.target.value)}
          className={erros.especialidade ? 'input-error' : ''}
        >
          <option value="">Selecione uma especialidade</option>
          {especialidades.map((esp) => (
            <option key={esp.id} value={esp.id}>
              {esp.nome}
            </option>
          ))}
        </select>
        {erros.especialidade && <span className="error-message">{erros.especialidade}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="sala">
            Sala <span className="required">*</span>
          </label>
          <select
            id="sala"
            value={sala}
            onChange={(e) => setSala(e.target.value)}
            className={`${erros.sala ? 'input-error' : ''} ${!especialidade ? 'input-disabled-warning' : ''}`}
            disabled={!especialidade}
          >
            <option value="">
              {!especialidade ? 'Selecione a especialidade primeiro' : 'Selecione uma sala'}
            </option>
            {salas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
          {erros.sala && <span className="error-message">{erros.sala}</span>}
          {!especialidade && (
            <span className="hint-chip">
              <FiAlertCircle size={12} />
              Selecione a especialidade primeiro
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="professor">
            Professor <span className="required">*</span>
          </label>
          <select
            id="professor"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            className={`${erros.professor ? 'input-error' : ''} ${!especialidade || !sala ? 'input-disabled-warning' : ''}`}
            disabled={!especialidade || !sala}
          >
            <option value="">
              {!especialidade
                ? 'Selecione a especialidade primeiro'
                : !sala
                  ? 'Selecione a sala primeiro'
                  : 'Selecione um professor'}
            </option>
            {professores.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {prof.nome}
              </option>
            ))}
          </select>
          {erros.professor && <span className="error-message">{erros.professor}</span>}
          {especialidade && !sala && (
            <span className="hint-chip">
              <FiAlertCircle size={12} />
              Selecione a sala primeiro
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
