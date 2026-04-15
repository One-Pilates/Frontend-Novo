import { useRef } from 'react';
import { FaCamera, FaUser } from 'react-icons/fa';
import Input from '../components/Input';
import './dadosPessoais.scss';

export default function DadosPessoaisScreen({ dados, atualizar, erros = {} }) {
  const fileInputRef = useRef(null);

  const manipularArquivo = (e) => {
    const arquivo = e.target.files?.[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onloadend = () => {
        atualizar({ fotoPerfil: leitor.result });
      };
      leitor.readAsDataURL(arquivo);
    }
  };

  return (
    <div className="dados-pessoais-screen etapa-content">
      <div className="etapa-header">
        <div className="etapa-icon">
          <FaUser size={18} />
        </div>
        <div className="etapa-title-group">
          <h2>Dados Pessoais</h2>
          <p>Informações básicas do professor</p>
        </div>
      </div>
      <div className="photo-section">
        <div className="photo-container">
          {dados.fotoPerfil ? (
            <img src={dados.fotoPerfil} alt="Foto de perfil" className="photo" />
          ) : (
            <div className="photo-placeholder">
              <FaCamera size={32} color="#9CA3AF" />
            </div>
          )}
        </div>
        <button
          type="button"
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Selecione a foto de perfil
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={manipularArquivo}
          style={{ display: 'none' }}
        />
      </div>

      <div className="form-grid">
        <div className="full-width">
          <Input
            label="Nome completo"
            placeholder="Digite o nome completo"
            value={dados.nomeCompleto}
            onChange={(e) => atualizar({ nomeCompleto: e.target.value })}
            required
            erro={erros.nomeCompleto}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="Digite o e-mail"
          value={dados.email}
          onChange={(e) => atualizar({ email: e.target.value })}
          required
          erro={erros.email}
        />

        <Input
          label="CPF"
          placeholder="000.000.000-00"
          value={dados.cpf}
          onChange={(e) => atualizar({ cpf: e.target.value })}
          maxLength={14}
          mask="cpf"
          required
          erro={erros.cpf}
        />

        <Input
          label="Data de nascimento"
          type="date"
          placeholder="dd/mm/aaaa"
          value={dados.dataNascimento}
          onChange={(e) => atualizar({ dataNascimento: e.target.value })}
          required
          erro={erros.dataNascimento}
        />

        <Input
          label="Telefone"
          type="tel"
          placeholder="(00) 00000-0000"
          value={dados.telefone}
          onChange={(e) => atualizar({ telefone: e.target.value })}
          maxLength={15}
          mask="telefone"
          required
          erro={erros.telefone}
        />
      </div>
    </div>
  );
}
