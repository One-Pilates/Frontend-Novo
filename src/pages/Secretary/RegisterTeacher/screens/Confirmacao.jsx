import { FaCheckCircle } from 'react-icons/fa';
import './confirmacao.scss';

const CardInfo = ({ label, valor }) => (
  <div className="card-info">
    <span className="card-label">{label}</span>
    <span className="card-value">{valor || '---'}</span>
  </div>
);

export default function ConfirmacaoProfessorScreen({
  dadosPessoais = {},
  endereco = {},
  informacoesProfissionais = {},
  especialidades = [],
}) {
  const especialidadesNomes =
    informacoesProfissionais.especialidades
      ?.map((id) => especialidades.find((e) => e.id === id)?.nome)
      .filter(Boolean)
      .join(', ') || 'Nenhuma';

  return (
    <div className="confirmacao-screen etapa-content">
      <div className="etapa-header">
        <div className="etapa-icon">
          <FaCheckCircle size={20} />
        </div>
        <div className="etapa-title-group">
          <h2>Revisão e Confirmação</h2>
          <p>Verifique se tudo está correto antes de cadastrar</p>
        </div>
      </div>

      <div className="data-sections">
        <div className="data-section">
          <h3 className="section-title">Dados Pessoais</h3>
          <div className="card-grid">
            <CardInfo label="Nome" valor={dadosPessoais.nomeCompleto} />
            <CardInfo label="Email" valor={dadosPessoais.email} />
            <CardInfo label="CPF" valor={dadosPessoais.cpf} />
            <CardInfo label="Data de Nascimento" valor={dadosPessoais.dataNascimento} />
            <CardInfo label="Telefone" valor={dadosPessoais.telefone} />
          </div>
        </div>

        <div className="data-section">
          <h3 className="section-title">Endereço</h3>
          <div className="card-grid">
            <CardInfo label="CEP" valor={endereco.cep} />
            <CardInfo label="Logradouro" valor={endereco.logradouro} />
            <CardInfo label="Número" valor={endereco.numero} />
            <CardInfo label="Bairro" valor={endereco.bairro} />
            <CardInfo label="Cidade" valor={endereco.cidade} />
            <CardInfo label="Estado" valor={endereco.estado} />
          </div>
        </div>

        <div className="data-section">
          <h3 className="section-title">Informações Profissionais</h3>
          <div className="card-grid">
            <CardInfo label="Cargo" valor={informacoesProfissionais.cargo} />
            <CardInfo label="Especialidades" valor={especialidadesNomes} />

            <div className="card-info">
              <span className="card-label">Notificações</span>
              <span className="card-value">
                {informacoesProfissionais.notificacaoAtiva ? (
                  <span className="badge badge-sim">Ativadas</span>
                ) : (
                  <span className="badge badge-nao">Desativadas</span>
                )}
              </span>
            </div>

            <div className="card-info observacoes-card">
              <span className="card-label">Observações</span>
              <span className="card-value observacoes-text">
                {informacoesProfissionais.observacoes || 'Nenhuma'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
