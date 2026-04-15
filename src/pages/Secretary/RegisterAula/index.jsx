import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { FiArrowRight, FiArrowLeft as FiArrowLeftIcon, FiCheck, FiCalendar } from 'react-icons/fi';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import api from '../../../services/api';
import StepIndicator from '../../../components/StepIndicator';
import Etapa1DataHora from './screens/Etapa1DataHora';
import Etapa2Turma from './screens/Etapa2Turma';
import Etapa3Alunos from './screens/Etapa3Alunos';
import Etapa4Confirmacao from './screens/Etapa4Confirmacao';
import './style.scss';

export default function RegisterAula() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const basePath = user?.role === 'ADMINISTRADOR' ? '/admin' : '/secretaria';
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState({});

  const [dataHora, setDataHora] = useState({
    data: location.state?.data || '',
    horario: location.state?.horario || '',
  });

  const [professor, setProfessor] = useState('');
  const [sala, setSala] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [searchAluno, setSearchAluno] = useState('');

  const [professores, setProfessores] = useState([]);
  const [salas, setSalas] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [todosAlunos, setTodosAlunos] = useState([]);
  const [mostrarListaAlunos, setMostrarListaAlunos] = useState(false);

  const etapas = [
    { label: 'Data e Hora' },
    { label: 'Turma' },
    { label: 'Alunos' },
    { label: 'Confirmação' },
  ];

  const normalizarAluno = (aluno) => {
    const id = aluno?.id ?? aluno?.idAluno ?? aluno?.alunoId ?? null;
    const nome = aluno?.nome ?? aluno?.nomeCompleto ?? aluno?.alunoNome ?? '';

    return {
      ...aluno,
      id,
      nome,
      alunoComLimitacoesFisicas: aluno?.alunoComLimitacoesFisicas ?? false,
    };
  };

  const extrairLista = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.alunos)) return payload.alunos;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [profRes, salaRes, espRes, alunoRes] = await Promise.all([
          api.get('/api/professores'),
          api.get('/api/salas'),
          api.get('/api/especialidades'),
          api.get('/api/alunos'),
        ]);

        setProfessores(extrairLista(profRes.data));
        setSalas(extrairLista(salaRes.data));
        setEspecialidades(extrairLista(espRes.data));
        const alunosRaw = extrairLista(alunoRes.data);
        const alunosNormalizados = alunosRaw
          .map(normalizarAluno)
          .filter((aluno) => aluno.id !== null && aluno.nome);

        setTodosAlunos(alunosNormalizados);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Não foi possível carregar os dados. Tente novamente.');
      }
    };

    carregarDados();
  }, []);

  useEffect(() => {
    if (especialidade) {
      setSala('');
      setProfessor('');
      api
        .get(`/api/especialidades/salas/${especialidade}`)
        .then((res) => setSalas(res.data || []))
        .catch((err) => console.error('Erro ao carregar salas:', err));
    } else {
      setSalas([]);
    }
  }, [especialidade]);

  useEffect(() => {
    if (sala && especialidade) {
      setProfessor('');
      api
        .get(`/api/especialidades/professores/${especialidade}`)
        .then((res) => setProfessores(res.data || []))
        .catch((err) => console.error('Erro ao carregar professores:', err));
    } else if (!especialidade) {
      setProfessores([]);
    }
  }, [sala, especialidade]);

  const validarEtapa = () => {
    const novosErros = {};

    if (etapaAtual === 1) {
      if (!dataHora.data) {
        novosErros.data = 'Data é obrigatória';
      }
      if (!dataHora.horario) {
        novosErros.horario = 'Horário é obrigatório';
      }
    }

    if (etapaAtual === 2) {
      if (!professor) {
        novosErros.professor = 'Professor é obrigatório';
      }
      if (!sala) {
        novosErros.sala = 'Sala é obrigatória';
      }
      if (!especialidade) {
        novosErros.especialidade = 'Especialidade é obrigatória';
      }
    }

    if (etapaAtual === 3) {
      if (alunos.length === 0) {
        novosErros.alunos = 'Selecione pelo menos um aluno';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleAdicionarAluno = (aluno) => {
    const alunoNormalizado = normalizarAluno(aluno);

    if (alunoNormalizado.id !== null && !alunos.find((a) => a.id === alunoNormalizado.id)) {
      setAlunos([...alunos, alunoNormalizado]);
      setSearchAluno('');
      setMostrarListaAlunos(false);
    }
  };

  const handleRemoverAluno = (alunoId) => {
    setAlunos(alunos.filter((a) => a.id !== alunoId));
  };

  const alunosDisponiveis = Array.isArray(todosAlunos)
    ? todosAlunos.filter((aluno) => !alunos.find((a) => a.id === aluno.id))
    : [];

  const proximaEtapa = () => {
    if (validarEtapa()) {
      if (etapaAtual === 3) {
        finalizar();
      } else if (etapaAtual < 4) {
        setEtapaAtual(etapaAtual + 1);
      }
    } else {
      toast.warning('Preencha todos os campos obrigatórios.');
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
    setEtapaAtual(4);
  };

  const criarAula = async () => {
    setCarregando(true);

    try {
      const dataHoraString = `${dataHora.data}T${dataHora.horario}:00`;
      const professorId = Number(professor);
      const salaId = Number(sala);
      const especialidadeId = Number(especialidade);
      const alunoIds = alunos
        .map((a) => Number(a.id))
        .filter((id) => Number.isFinite(id) && id > 0);

      const payloadInvalido =
        !Number.isFinite(professorId) ||
        !Number.isFinite(salaId) ||
        !Number.isFinite(especialidadeId) ||
        alunoIds.length === 0;

      if (payloadInvalido) {
        toast.error('Dados da aula inválidos. Revise professor, sala, especialidade e alunos.');
        setCarregando(false);
        return;
      }

      const payload = {
        dataHora: dataHoraString,
        professorId,
        salaId,
        especialidadeId,
        alunoIds,
      };

      await api.post('/api/agendamentos', payload);

      toast.success('Aula criada com sucesso!');

      navigate(`${basePath}/agendamento`, {
        state: {
          idProfessor: professorId,
          idSala: salaId,
          autoCarregar: true,
        },
      });
    } catch (error) {
      console.error('Erro ao criar aula:', error);
      console.error('Detalhes do erro:', error.response?.data);

      let mensagem = 'Erro ao criar aula. Tente novamente.';

      if (error.response?.data?.erro) {
        mensagem = error.response.data.erro;
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.response?.data) {
        mensagem = JSON.stringify(error.response.data);
      }

      if (mensagem === 'Authentication failed') {
        toast.error('Sua sessão expirou. Faça login novamente.');
        setCarregando(false);
        navigate('/login');
        return;
      }

      toast.error(mensagem);
      setCarregando(false);
    }
  };

  const cancelar = () => {
    Swal.fire({
      title: 'Cancelar cadastro?',
      text: 'Tem certeza que deseja cancelar? Todos os dados serão perdidos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, cancelar',
      cancelButtonText: 'Não, continuar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`${basePath}/agendamento`);
      }
    });
  };

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return <Etapa1DataHora dataHora={dataHora} setDataHora={setDataHora} erros={erros} />;
      case 2:
        return (
          <Etapa2Turma
            professor={professor}
            setProfessor={setProfessor}
            sala={sala}
            setSala={setSala}
            especialidade={especialidade}
            setEspecialidade={setEspecialidade}
            professores={professores}
            salas={salas}
            especialidades={especialidades}
            erros={erros}
          />
        );
      case 3:
        return (
          <Etapa3Alunos
            alunos={alunos}
            searchAluno={searchAluno}
            setSearchAluno={setSearchAluno}
            mostrarListaAlunos={mostrarListaAlunos}
            setMostrarListaAlunos={setMostrarListaAlunos}
            alunosDisponiveis={alunosDisponiveis}
            handleAdicionarAluno={handleAdicionarAluno}
            handleRemoverAluno={handleRemoverAluno}
            erros={erros}
          />
        );
      case 4:
        return (
          <Etapa4Confirmacao
            dataHora={dataHora}
            professor={professor}
            sala={sala}
            especialidade={especialidade}
            alunos={alunos}
            todosAlunos={todosAlunos}
            professores={professores}
            salas={salas}
            especialidades={especialidades}
            irParaEtapa={irParaEtapa}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="register-container register-aula-page">
      <div className="register-header">
        <button className="back-button" onClick={() => navigate(`${basePath}/agendamento`)}>
          <FiArrowLeftIcon size={14} />
          <span>Voltar</span>
        </button>
        <div className="header-title-group">
          <div className="header-icon" aria-hidden="true">
            <FiCalendar size={20} />
          </div>
          <div>
            <h1 className="main-title">Criar Nova Aula</h1>
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
            <button className="btn-cancel" onClick={cancelar} disabled={carregando}>
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
              <button className="btn-finish" onClick={criarAula} disabled={carregando}>
                {carregando ? '⏳ Criando...' : <><FiCheck size={16} /> Confirmar e Criar</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
