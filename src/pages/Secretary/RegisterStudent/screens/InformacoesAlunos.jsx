import { FaClipboardList } from 'react-icons/fa';
import Input from '../components/Input';
import './informacoesAlunos.scss';

export default function InformacoesAlunoScreen({ dados, atualizar, erros = {} }) {
  return (
    <div className="informacoes-aluno-screen etapa-content">
      <div className="etapa-header">
        <div className="etapa-icon">
          <FaClipboardList size={18} />
        </div>
        <div className="etapa-title-group">
          <h2>Informações do Aluno</h2>
          <p>Dados de saúde e observações</p>
        </div>
      </div>
      <div className="aluno-content">
        <div className="checkbox-item">
          <label className="checkbox-toggle-label">
            <input
              type="checkbox"
              checked={dados.problemasMobilidade || false}
              onChange={(e) => atualizar({ problemasMobilidade: e.target.checked })}
              className="checkbox-toggle-input"
            />
            <span className="checkbox-toggle-text">Problema de mobilidade</span>
          </label>
        </div>

        <div className="textarea-section">
          <label className="textarea-label">Observações</label>
          <textarea
            placeholder="Digite observações sobre o aluno..."
            value={dados.observacao || ''}
            onChange={(e) => atualizar({ observacao: e.target.value })}
            className={`textarea-field ${erros.observacao ? 'textarea-error' : ''}`}
            rows={6}
          />
          {erros.observacao && <span className="error-message">{erros.observacao}</span>}
        </div>
      </div>
    </div>
  );
}
