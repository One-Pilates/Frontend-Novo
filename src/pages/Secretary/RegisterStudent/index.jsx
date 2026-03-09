import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../../../services/api';
import StepIndicator from './components/StepIndicator';
import Button from './components/Button';
import DadosPessoaisScreen from './screens/DadosPessoais';
import EnderecoScreen from './screens/Endereco';
import InformacoesAlunoScreen from './screens/InformacoesAlunos';
import ConfirmacaoAlunoScreen from './screens/Confirmacao';
import { validarCPF, validarEmail } from '../../../utils/utils';
import './style.scss';

export default function RegisterStudent() {
  const navigate = useNavigate();
  const location = useLocation();

  const dadosIniciais = location.state || {};

  const [etapaAtual, setEtapaAtual] = useState(1);
  const [erros, setErros] = useState({});

  const [dadosPessoais, setDadosPessoais] = useState(
    dadosIniciais.dadosPessoais || {
      fotoPerfil: '',
      nomeCompleto: '',
      email: '',
      cpf: '',
      dataNascimento: '',
      telefone: '',
    },
  );

  const [endereco, setEndereco] = useState(
    dadosIniciais.endereco || {
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      uf: '',
    },
  );

  const [informacoesAluno, setInformacoesAluno] = useState(
    dadosIniciais.informacoesAluno || {
      problemasMobilidade: false,
      observacoes: '',
    },
  );

  const etapas = [
    { label: 'Dados Pessoais' },
    { label: 'Endereço' },
    { label: 'Informações' },
    { label: 'Confirmação' },
  ];

  const atualizarDadosPessoais = (novos) => {
    setDadosPessoais((prev) => ({ ...prev, ...novos }));
    // Limpa os erros dos campos que estão sendo atualizados
    const camposAtualizados = Object.keys(novos);
    if (camposAtualizados.some((campo) => erros[campo])) {
      setErros((prev) => {
        const novosErros = { ...prev };
        camposAtualizados.forEach((campo) => delete novosErros[campo]);
        return novosErros;
      });
    }
  };

  const atualizarEndereco = (novos) => {
    setEndereco((prev) => ({ ...prev, ...novos }));
    // Limpa os erros dos campos que estão sendo atualizados
    const camposAtualizados = Object.keys(novos);
    if (camposAtualizados.some((campo) => erros[campo])) {
      setErros((prev) => {
        const novosErros = { ...prev };
        camposAtualizados.forEach((campo) => delete novosErros[campo]);
        return novosErros;
      });
    }
  };

  const atualizarInformacoesAluno = (novos) => {
    setInformacoesAluno((prev) => ({ ...prev, ...novos }));
  };

  // Buscar CEP usando ViaCEP API
  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();

        if (!data.erro) {
          atualizarEndereco({
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: data.uf || '',
            estado: data.uf || '',
          });
        } else {
          Swal.fire('CEP não encontrado!', '', 'warning');
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
        Swal.fire('Erro ao buscar CEP', 'Tente novamente', 'error');
      }
    }
  };

  // Validação de cada etapa
  const validarEtapa = () => {
    const novosErros = {};

    if (etapaAtual === 1) {
      if (!dadosPessoais.nomeCompleto.trim()) {
        novosErros.nomeCompleto = 'Nome completo é obrigatório';
      }
      if (!dadosPessoais.email.trim()) {
        novosErros.email = 'Email é obrigatório';
      } else if (!validarEmail(dadosPessoais.email)) {
        novosErros.email = 'Email inválido';
      }
      if (!dadosPessoais.cpf.trim()) {
        novosErros.cpf = 'CPF é obrigatório';
      } else if (!validarCPF(dadosPessoais.cpf)) {
        novosErros.cpf = 'CPF inválido';
      }
      if (!dadosPessoais.dataNascimento) {
        novosErros.dataNascimento = 'Data de nascimento é obrigatória';
      } else {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const nascimento = new Date(dadosPessoais.dataNascimento);
        if (nascimento >= hoje) {
          novosErros.dataNascimento = 'Data de nascimento não pode ser hoje ou no futuro';
        } else {
          const idadeMs = hoje - nascimento;
          const anos = idadeMs / (1000 * 60 * 60 * 24 * 365.25);
          if (anos > 120) {
            novosErros.dataNascimento = 'Data de nascimento inválida';
          }
        }
      }
      if (!dadosPessoais.telefone.trim()) {
        novosErros.telefone = 'Telefone é obrigatório';
      } else if (dadosPessoais.telefone.replace(/\D/g, '').length < 10) {
        novosErros.telefone = 'Telefone inválido (mínimo 10 dígitos)';
      }
    }

    if (etapaAtual === 2) {
      const cepLimpo = (endereco.cep || '').replace(/\D/g, '');
      if (!endereco.cep.trim()) {
        novosErros.cep = 'CEP é obrigatório';
      } else if (cepLimpo.length !== 8) {
        novosErros.cep = 'CEP inválido (deve ter 8 dígitos)';
      }
      if (!endereco.logradouro.trim()) novosErros.logradouro = 'Logradouro é obrigatório';
      if (!endereco.numero.trim()) novosErros.numero = 'Número é obrigatório';
      if (!endereco.bairro.trim()) novosErros.bairro = 'Bairro é obrigatório';
      if (!endereco.cidade.trim()) novosErros.cidade = 'Cidade é obrigatória';
      if (!endereco.estado) novosErros.estado = 'Estado é obrigatório';
      if (!endereco.uf) novosErros.uf = 'UF é obrigatória';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const proximaEtapa = () => {
    if (validarEtapa()) {
      if (etapaAtual === 3) {
        finalizar();
      } else if (etapaAtual < 4) {
        setEtapaAtual(etapaAtual + 1);
      }
    } else {
      Swal.fire(
        'Campos obrigatórios',
        'Por favor, preencha todos os campos obrigatórios corretamente.',
        'warning',
      );
    }
  };

  const etapaAnterior = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  const irParaEtapa = (numeroEtapa) => {
    if (numeroEtapa <= etapaAtual && numeroEtapa >= 1) {
      setEtapaAtual(numeroEtapa);
    }
  };

  const finalizar = () => {
    console.log('📋 Dados do aluno (pré-visualização):', {
      dadosPessoais,
      endereco,
      informacoesAluno,
    });

    setEtapaAtual(4);
  };

  const cancelarCadastro = () => {
    setDadosPessoais({
      nomeCompleto: '',
      email: '',
      cpf: '',
      dataNascimento: '',
      telefone: '',
    });

    setEndereco({
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      uf: '',
    });

    setInformacoesAluno({
      problemasMobilidade: false,
      observacoes: '',
    });

    navigate('/secretaria/alunos');
  };

  const cadastrarAluno = async () => {
    const payload = {
      nome: dadosPessoais.nomeCompleto || '',
      email: dadosPessoais.email || '',
      cpf: dadosPessoais.cpf.replace(/\D/g, '') || '',
      dataNascimento: dadosPessoais.dataNascimento || '',
      status: true,
      alunoComLimitacoesFisicas: !!informacoesAluno.problemasMobilidade,
      observacoes: informacoesAluno.observacoes || '',
      tipoContato: dadosPessoais.telefone || '',
      notificacaoAtiva: true,
      endereco: {
        rua: endereco.logradouro || '',
        numero: endereco.numero || '',
        bairro: endereco.bairro || '',
        cidade: endereco.cidade || '',
        estado: endereco.estado || '',
        cep: endereco.cep.replace(/\D/g, '') || '',
        uf: endereco.uf || '',
      },
    };

    console.log('📤 Payload para cadastro:', payload);

    try {
      await api.post('api/alunos', payload);
      Swal.fire('Sucesso', 'Aluno cadastrado com sucesso.', 'success');
      navigate('/secretaria/alunos');
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      Swal.fire('Erro', 'Não foi possível cadastrar o aluno.', 'error');
    }
  };

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <DadosPessoaisScreen
            dados={dadosPessoais}
            atualizar={atualizarDadosPessoais}
            erros={erros}
          />
        );
      case 2:
        return (
          <EnderecoScreen
            dados={endereco}
            atualizar={atualizarEndereco}
            buscarCep={buscarCep}
            erros={erros}
          />
        );
      case 3:
        return (
          <InformacoesAlunoScreen
            dados={informacoesAluno}
            atualizar={atualizarInformacoesAluno}
            erros={erros}
          />
        );
      case 4:
        return (
          <ConfirmacaoAlunoScreen
            dadosPessoais={dadosPessoais}
            endereco={endereco}
            informacoesAluno={informacoesAluno}
            onVoltar={etapaAnterior}
            onCancelar={cancelarCadastro}
            onCadastrar={cadastrarAluno}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="register-container">
      <div className="register-header">
        <button className="back-button" onClick={() => navigate('/secretaria/alunos')}>
          <FaArrowLeft />
          <span>Voltar</span>
        </button>
        <h1 className="main-title"> Preencha os dados para criar a conta</h1>
      </div>

      <div className="register-content">
        <div className="register-card">
          <StepIndicator steps={etapas} currentStep={etapaAtual} onStepClick={irParaEtapa} />

          <form className="register-form" onSubmit={(e) => e.preventDefault()}>
            {renderEtapa()}

            {etapaAtual < 4 && (
              <div className="button-group">
                {etapaAtual > 1 && (
                  <Button variant="secondary" onClick={etapaAnterior}>
                    Voltar
                  </Button>
                )}

                <Button variant="primary" onClick={proximaEtapa}>
                  {etapaAtual === 3 ? 'Cadastrar' : 'Continuar'}
                </Button>
              </div>
            )}

            {/* Buttons for etapa 4 are rendered inside the Confirmacao screen */}
          </form>
        </div>
      </div>
    </div>
  );
}
