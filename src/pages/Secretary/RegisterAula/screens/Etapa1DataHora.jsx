import React from 'react';

export default function Etapa1DataHora(props) {
  const { dataHora, setDataHora, erros } = props;

  const handleDataChange = (e) => {
    setDataHora((prev) => ({ ...prev, data: e.target.value }));
  };

  const handleHorarioChange = (e) => {
    const valor = e.target.value;
    if (valor) {
      const [hora] = valor.split(':');
      setDataHora((prev) => ({ ...prev, horario: `${hora}:00` }));
    } else {
      setDataHora((prev) => ({ ...prev, horario: '' }));
    }
  };

  const horasDisponiveis = Array.from({ length: 15 }, (_, i) => {
    const hora = String(i + 7).padStart(2, '0');
    return `${hora}:00`;
  });

  return (
    <div className="etapa-content">
      <h2>Quando será a aula?</h2>

      <div className="form-group">
        <label htmlFor="data">Data *</label>
        <input
          type="date"
          id="data"
          value={dataHora.data}
          onChange={handleDataChange}
          className={erros.data ? 'input-error' : ''}
        />
        {erros.data && <span className="error-message">{erros.data}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="horario">
          Horário <span className="required">*</span>
        </label>
        <select
          id="horario"
          value={dataHora.horario}
          onChange={handleHorarioChange}
          className={erros.horario ? 'input-error' : ''}
        >
          <option value="">Selecione um horário</option>
          {horasDisponiveis.map((hora) => (
            <option key={hora} value={hora}>
              {hora}
            </option>
          ))}
        </select>
        {erros.horario && <span className="error-message">{erros.horario}</span>}
      </div>
    </div>
  );
}
