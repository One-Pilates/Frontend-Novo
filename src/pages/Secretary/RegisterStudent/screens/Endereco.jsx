import { useState, useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import Input from '../components/Input';
import './endereco.scss';

export default function EnderecoScreen({ dados, atualizar, buscarCep, erros = {} }) {
  const [semNumero, setSemNumero] = useState(false);

  useEffect(() => {
    if (dados.numero === '0' || dados.numero === 'S/N' || dados.numero === 's/n') {
      setSemNumero(true);
    }
  }, [dados.numero]);

  const manipularCep = (valor) => {
    atualizar({ cep: valor });

    // Busca o CEP quando tiver 8 dígitos
    if (valor.replace(/\D/g, '').length === 8) {
      console.log('🔍 Chamando buscarCep para:', valor);
      buscarCep(valor);
    }
  };

  const toggleSemNumero = (checked) => {
    setSemNumero(checked);
    if (checked) {
      console.log("✅ Sem número marcado - enviando '0'");
      atualizar({ numero: '0' });
    } else {
      console.log('❌ Sem número desmarcado - limpando campo');
      atualizar({ numero: '' });
    }
  };

  return (
    <div className="endereco-screen etapa-content">
      <div className="etapa-header">
        <div className="etapa-icon">
          <FaMapMarkerAlt size={18} />
        </div>
        <div className="etapa-title-group">
          <h2>Endereço</h2>
          <p>Local de residência do aluno</p>
        </div>
      </div>
      <div className="address-grid">
        <Input
          label="CEP"
          placeholder="00000-000"
          value={dados.cep}
          onChange={(e) => manipularCep(e.target.value)}
          maxLength={9}
          mask="cep"
          required
          erro={erros.cep}
        />

        <Input
          label="Logradouro"
          placeholder="Rua Antônio Candido de Alvarenga"
          value={dados.logradouro}
          onChange={(e) => atualizar({ logradouro: e.target.value })}
          required
          erro={erros.logradouro}
        />

        {/* Campo Número com Checkbox Sem Número */}
        <div className="numero-wrapper">
          <Input
            label="Número"
            placeholder="539"
            value={semNumero ? 'S/N' : dados.numero}
            onChange={(e) => atualizar({ numero: e.target.value })}
            required={!semNumero}
            erro={erros.numero}
            disabled={semNumero}
          />
          <div className="sem-numero-checkbox">
            <input
              type="checkbox"
              id="semNumero"
              checked={semNumero}
              onChange={(e) => toggleSemNumero(e.target.checked)}
            />
            <label htmlFor="semNumero">Sem número</label>
          </div>
        </div>

        <Input
          label="Bairro"
          placeholder="Perus"
          value={dados.bairro}
          onChange={(e) => atualizar({ bairro: e.target.value })}
          required
          erro={erros.bairro}
        />

        <Input
          label="Cidade"
          placeholder="São Paulo"
          value={dados.cidade}
          onChange={(e) => atualizar({ cidade: e.target.value })}
          required
          erro={erros.cidade}
        />

        <Input
          label="Estado"
          placeholder="São Paulo"
          value={dados.estado}
          onChange={(e) => atualizar({ estado: e.target.value })}
          required
          erro={erros.estado}
          disabled
          style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
        />

        <div className="select-wrapper">
          <label className="select-label">
            UF<span className="select-required">*</span>
          </label>
          <select
            className={`select-field ${erros.uf ? 'select-error' : ''}`}
            value={dados.uf}
            onChange={(e) => {
              console.log('🔄 UF alterado manualmente para:', e.target.value);
              atualizar({ uf: e.target.value, estado: getEstadoNome(e.target.value) });
            }}
            required
          >
            <option value="">Selecione</option>
            <option value="AC">AC - Acre</option>
            <option value="AL">AL - Alagoas</option>
            <option value="AP">AP - Amapá</option>
            <option value="AM">AM - Amazonas</option>
            <option value="BA">BA - Bahia</option>
            <option value="CE">CE - Ceará</option>
            <option value="DF">DF - Distrito Federal</option>
            <option value="ES">ES - Espírito Santo</option>
            <option value="GO">GO - Goiás</option>
            <option value="MA">MA - Maranhão</option>
            <option value="MT">MT - Mato Grosso</option>
            <option value="MS">MS - Mato Grosso do Sul</option>
            <option value="MG">MG - Minas Gerais</option>
            <option value="PA">PA - Pará</option>
            <option value="PB">PB - Paraíba</option>
            <option value="PR">PR - Paraná</option>
            <option value="PE">PE - Pernambuco</option>
            <option value="PI">PI - Piauí</option>
            <option value="RJ">RJ - Rio de Janeiro</option>
            <option value="RN">RN - Rio Grande do Norte</option>
            <option value="RS">RS - Rio Grande do Sul</option>
            <option value="RO">RO - Rondônia</option>
            <option value="RR">RR - Roraima</option>
            <option value="SC">SC - Santa Catarina</option>
            <option value="SP">SP - São Paulo</option>
            <option value="SE">SE - Sergipe</option>
            <option value="TO">TO - Tocantins</option>
          </select>
          {erros.uf && <span className="select-error-message">{erros.uf}</span>}
        </div>
      </div>
    </div>
  );
}

// Função helper para converter UF em nome do estado
function getEstadoNome(uf) {
  const estados = {
    AC: 'Acre',
    AL: 'Alagoas',
    AP: 'Amapá',
    AM: 'Amazonas',
    BA: 'Bahia',
    CE: 'Ceará',
    DF: 'Distrito Federal',
    ES: 'Espírito Santo',
    GO: 'Goiás',
    MA: 'Maranhão',
    MT: 'Mato Grosso',
    MS: 'Mato Grosso do Sul',
    MG: 'Minas Gerais',
    PA: 'Pará',
    PB: 'Paraíba',
    PR: 'Paraná',
    PE: 'Pernambuco',
    PI: 'Piauí',
    RJ: 'Rio de Janeiro',
    RN: 'Rio Grande do Norte',
    RS: 'Rio Grande do Sul',
    RO: 'Rondônia',
    RR: 'Roraima',
    SC: 'Santa Catarina',
    SP: 'São Paulo',
    SE: 'Sergipe',
    TO: 'Tocantins',
  };
  return estados[uf] || '';
}
