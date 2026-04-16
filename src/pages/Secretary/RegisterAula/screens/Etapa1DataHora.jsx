import React from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';
import { toast } from 'sonner';

export default function Etapa1DataHora({ dataHora, setDataHora, erros }) {
  const handleDataChange = (e) => {
    const selectedDateStr = e.target.value;
    if (selectedDateStr) {
      const [ano, mes, dia] = selectedDateStr.split('-');
      const dataObj = new Date(ano, mes - 1, dia);
      const diaDaSemana = dataObj.getDay();
      
      if (diaDaSemana === 0 || diaDaSemana === 6) {
        toast.warning('Aulas não podem ser agendadas aos sábados e domingos.');
        setDataHora((prev) => ({ ...prev, data: '' }));
        return;
      }
    }
    setDataHora((prev) => ({ ...prev, data: selectedDateStr }));
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

  const formatarDataExibicao = (dataStr) => {
    if (!dataStr) return null;
    const d = new Date(dataStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="etapa-content">
      <div className="etapa-header">
        <div className="etapa-icon">
          <FiCalendar size={22} />
        </div>
        <div className="etapa-title-group">
          <h2>Quando será a aula?</h2>
          <p>Selecione a data e o horário de início</p>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="data">
            Data <span className="required">*</span>
          </label>
          <input
            type="date"
            id="data"
            value={dataHora.data}
            onChange={handleDataChange}
            className={erros.data ? 'input-error' : ''}
          />
          {erros.data && <span className="error-message">{erros.data}</span>}
          {dataHora.data && (
            <span className="hint-chip">
              <FiCalendar size={12} />
              {formatarDataExibicao(dataHora.data)}
            </span>
          )}
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
                {hora}h
              </option>
            ))}
          </select>
          {erros.horario && <span className="error-message">{erros.horario}</span>}
          {dataHora.horario && (
            <span className="hint-chip">
              <FiClock size={12} />
              Duração de 1 hora — término às {String(parseInt(dataHora.horario) + 1).padStart(2, '0')}:00h
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
