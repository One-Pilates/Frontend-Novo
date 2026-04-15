import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { FaArrowLeft, FaUserGraduate } from 'react-icons/fa';
import { FiArrowRight, FiArrowLeft as FiArrowLeftIcon, FiCheck } from 'react-icons/fi';
import { toast } from 'sonner';
import api from '../../../services/api';
import StepIndicator from './components/StepIndicator';
import DadosPessoaisScreen from './screens/DadosPessoais';
import EnderecoScreen from './screens/Endereco';
import InformacoesAlunoScreen from './screens/InformacoesAlunos';
import ConfirmacaoAlunoScreen from './screens/Confirmacao';
import { validarCPF, validarEmail } from '../../../utils/utils';
import { useAuth } from '../../../hooks/useAuth';
import './style.scss';

export default function RegisterStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = !!id;
  const { user } = useAuth();
  const basePath = user?.role === 'ADMINISTRADOR' ? '/admin' : '/secretaria';

  const dadosIniciais = location.state || {};

  const [etapaAtual, setEtapaAtual] = useState(1);
  const [carregando, setCarregando] = useState(false);
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
      observacao: '',
    },
  );

  useEffect(() => {
    if (!isEditMode) return;
    api
      .get(`api/alunos/${id}`)
      .then((res) => {
        const a = res.data;
        setDadosPessoais({
          fotoPerfil: a.fotoPerfil || '',
          nomeCompleto: a.nome || '',
          email: a.email || '',
          cpf: a.cpf || '',
          dataNascimento: a.dataNascimento ? a.dataNascimento.substring(0, 10) : '',
          telefone: a.tipoContato || '',
        });
        setEndereco({
          cep: a.endereco?.cep || '',
          logradouro: a.endereco?.rua || '',
          numero: a.endereco?.numero || '',
          bairro: a.endereco?.bairro || '',
          cidade: a.endereco?.cidade || '',
          estado: a.endereco?.estado || '',
          uf: a.endereco?.uf || '',
        });
        setInformacoesAluno({
          problemasMobilidade: a.alunoComLimitacoesFisicas ?? false,
          observacao: a.observacao || '',
        });
      })
      .catch((err) => {
        console.error('Erro ao carregar aluno para edição:', err);
        toast.error('Não foi possível carregar os dados do aluno.');
        navigate(`${basePath}/alunos`);
      });
  }, [id]);

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
          toast.warning('CEP não encontrado. Verifique o CEP digitado.');
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
        toast.error('Erro ao buscar CEP. Tente novamente.');
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
      toast.warning('Preencha todos os campos obrigatórios corretamente.');
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
    navigate(`${basePath}/alunos`);
  };

  const cadastrarAluno = async () => {
    setCarregando(true);
    const payload = {
      nome: dadosPessoais.nomeCompleto || '',
      email: dadosPessoais.email || '',
      cpf: dadosPessoais.cpf.replace(/\D/g, '') || '',
      dataNascimento: dadosPessoais.dataNascimento || '',
      status: true,
      alunoComLimitacoesFisicas: !!informacoesAluno.problemasMobilidade,
      observacao: informacoesAluno.observacao || '',
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

    try {
      if (isEditMode) {
        await api.patch(`api/alunos/${id}`, payload);
        toast.success('Aluno atualizado com sucesso!');
      } else {
        await api.post('api/alunos', payload);
        toast.success('Aluno cadastrado com sucesso!');
      }
      navigate(`${basePath}/alunos`);
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      toast.error(isEditMode ? 'Não foi possível atualizar o aluno.' : 'Não foi possível cadastrar o aluno.');
    } finally {
      setCarregando(false);
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="register-student-page">
      <div className="register-container">
        <div className="register-header">
          <button className="back-button" onClick={() => navigate(`${basePath}/alunos`)}>
            <FaArrowLeft size={13} />
            <span>Voltar</span>
          </button>
          <div className="header-title-group">
            <div className="header-icon" aria-hidden="true">
              <FaUserGraduate size={18} />
            </div>
            <div>
              <h1 className="main-title">{isEditMode ? 'Editar Aluno' : 'Cadastrar Aluno'}</h1>
              <p className="main-subtitle">Preencha as informações abaixo</p>
            </div>
          </div>
          <span className="header-step-badge">Etapa {etapaAtual} de {etapas.length}</span>
        </div>

        <div className="register-content">
          <StepIndicator steps={etapas} currentStep={etapaAtual} onStepClick={irParaEtapa} />

          <div className="register-card">
            <form className="register-form" onSubmit={(e) => e.preventDefault()}>
              {renderEtapa()}
            </form>

            <div className="form-actions">
              <button className="btn-cancel" onClick={cancelarCadastro} disabled={carregando}>
                Cancelar
              </button>
              {etapaAtual > 1 && (
                <button className="btn-back" onClick={etapaAnterior} disabled={carregando}>
                  <FiArrowLeftIcon size={15} /> Voltar
                </button>
              )}
              {etapaAtual < 4 && (
                <button className="btn-next" onClick={proximaEtapa} disabled={carregando}>
                  Próximo <FiArrowRight size={15} />
                </button>
              )}
              {etapaAtual === 4 && (
                <button className="btn-finish" onClick={cadastrarAluno} disabled={carregando}>
                  {carregando ? '⏳ ' + (isEditMode ? 'Salvando...' : 'Cadastrando...') : <><FiCheck size={16} /> Confirmar e {isEditMode ? 'Salvar' : 'Cadastrar'}</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
