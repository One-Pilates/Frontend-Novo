import { FaBriefcase } from 'react-icons/fa';
import Input from '../components/Input';
import './informacoesProfissionais.scss';

export default function InformacoesProfissionaisScreen({
  dados,
  atualizar,
  especialidades = [],
  erros = {},
}) {
  const manipularEspecialidade = (especialidadeId) => {
    const especialidadesAtuais = dados.especialidades || [];
    const novasEspecialidades = especialidadesAtuais.includes(especialidadeId)
      ? especialidadesAtuais.filter((id) => id !== especialidadeId)
      : [...especialidadesAtuais, especialidadeId];

    atualizar({ especialidades: novasEspecialidades });
  };

  return (
    <div className="informacoes-profissionais-screen etapa-content">
      <div className="etapa-header">
        <div className="etapa-icon">
          <FaBriefcase size={17} />
        </div>
        <div className="etapa-title-group">
          <h2>Informações Profissionais</h2>
          <p>Cargo, especialidades e configurações</p>
        </div>
      </div>
      <div className="professional-content">
        <Input
          label="Cargo"
          placeholder="Ex: Fisioterapeuta, Professor de Pilates"
          value={dados.cargo}
          onChange={(e) => atualizar({ cargo: e.target.value })}
          required
          erro={erros.cargo}
        />

        <div className="especialidades-section">
          <label className="section-label">
            Especialidades
            <span className="section-required">*</span>
          </label>

          {especialidades.length === 0 ? (
            <div className="loading-message">Carregando especialidades...</div>
          ) : (
            <div className="checkbox-grid">
              {especialidades.map((especialidade) => (
                <label key={especialidade.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={dados.especialidades?.includes(especialidade.id) || false}
                    onChange={() => manipularEspecialidade(especialidade.id)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">{especialidade.nome}</span>
                </label>
              ))}
            </div>
          )}

          {erros.especialidades && <span className="error-message">{erros.especialidades}</span>}
        </div>

        <div className="observacoes-section">
          <label className="textarea-label">Observações</label>
          <textarea
            placeholder="Informações adicionais sobre o professor..."
            value={dados.observacoes || ''}
            onChange={(e) => atualizar({ observacoes: e.target.value })}
            className={`textarea-field ${erros.observacoes ? 'textarea-error' : ''}`}
            rows={4}
          />
          {erros.observacoes && <span className="error-message">{erros.observacoes}</span>}
        </div>

        <div className="checkbox-item">
          <label className="checkbox-toggle-label">
            <input
              type="checkbox"
              checked={dados.notificacaoAtiva ?? true}
              onChange={(e) => atualizar({ notificacaoAtiva: e.target.checked })}
              className="checkbox-toggle-input"
            />
            <span className="checkbox-toggle-text">Ativar notificações por e-mail</span>
          </label>
        </div>
      </div>
    </div>
  );
}
