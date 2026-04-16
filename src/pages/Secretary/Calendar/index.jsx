import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AgendamentoModal from './Components/AulaModal';
import AusenciaModal from '../../Teacher/Calendar/Components/AusenciaModal';
import DefinirAusenciaModal from '../../Teacher/Calendar/Components/DefinirAusenciaModal';
import { getColorForEspecialidade } from '../../../utils/utils';
import './styles/Calendar.scss';
import './styles/Filtros.scss';

export default function CalendarSecretary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const basePath = user?.role === 'ADMINISTRADOR' ? '/admin' : '/secretaria';

  const [salas, setSalas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [idSala, setIdSala] = useState('');
  const [idProfessor, setIdProfessor] = useState('0');
  const [agendamentos, setAgendamentos] = useState([]);
  const [ausencias, setAusencias] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [jaBuscou, setJaBuscou] = useState(false);
  const [carregouInicial, setCarregouInicial] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [activeView, setActiveView] = useState('timeGridWeek');
  const [showLoading, setShowLoading] = useState(false);
  const [isAusenciaViewModalOpen, setIsAusenciaViewModalOpen] = useState(false);
  const [selectedAusencia, setSelectedAusencia] = useState(null);
  const [isAusenciaModalOpen, setIsAusenciaModalOpen] = useState(false);

  const calendarRef = useRef(null);
  const calendarInstance = useRef(null);
  const currentViewRef = useRef('timeGridWeek');
  const currentDateRef = useRef(null);

  // Apply location.state filters (e.g. from GerenciamentoProfessor "Ver agenda")
  useEffect(() => {
    if (location.state?.idProfessor !== undefined) {
      setIdProfessor(String(location.state.idProfessor));
    }
    if (location.state?.idSala !== undefined) {
      setIdSala(String(location.state.idSala));
    }
  }, [location.state]);

  // Debounced auto-fetch whenever filters change after initial load
  useEffect(() => {
    if (carregouInicial) {
      const timeoutId = setTimeout(() => {
        fetchAgendamentosFiltro();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [idProfessor, idSala, carregouInicial]);

  async function fetchFiltros() {
    try {
      setErrorMessage('');
      const [respSalas, respProfs] = await Promise.all([
        api.get('/api/salas').catch(() => ({ data: [] })),
        api.get('/api/professores').catch(() => ({ data: [] })),
      ]);
      setSalas(Array.isArray(respSalas.data) ? respSalas.data : []);
      setProfessores(Array.isArray(respProfs.data) ? respProfs.data : []);
    } catch (err) {
      console.error('Erro ao carregar filtros:', err);
      setErrorMessage('Erro ao carregar filtros. Tente novamente.');
    }
  }

  async function fetchAgendamentosFiltro() {
    const todasSalas = !idSala || idSala === '';
    const todosProfessores = !idProfessor || idProfessor === '0' || idProfessor === '';

    try {
      setIsLoading(true);
      setErrorMessage('');
      setJaBuscou(true);

      let url = '';
      if (todasSalas && todosProfessores) {
        url = '/api/agendamentos';
      } else if (!todasSalas && !todosProfessores) {
        url = `/api/agendamentos/${idSala}/${idProfessor}`;
      } else if (!todosProfessores) {
        url = `/api/agendamentos/professorId/${idProfessor}`;
      } else if (!todasSalas) {
        url = `/api/agendamentos/sala/${idSala}`;
      }

      const response = await api.get(url);
      const dados = Array.isArray(response.data) ? response.data : [];
      setAgendamentos(dados);

      if (!todosProfessores) {
        try {
          const respAus = await api.get(`/api/ausencias/professor/${idProfessor}`);
          setAusencias(Array.isArray(respAus.data) ? respAus.data : []);
        } catch {
          setAusencias([]);
        }
      } else {
        setAusencias([]);
      }
    } catch (err) {
      console.error('Erro ao buscar:', err);
      setErrorMessage('Erro ao buscar agendamentos.');
      setAgendamentos([]);
      setAusencias([]);
    } finally {
      setIsLoading(false);
    }
  }

  function calcularDuracao(dataHora) {
    const inicio = new Date(dataHora);
    const fim = new Date(inicio.getTime() + 60 * 60 * 1000);
    return fim.toISOString();
  }

  function initCalendar() {
    if (!calendarRef.current) return;

    if (calendarInstance.current?.view) {
      currentViewRef.current = calendarInstance.current.view.type;
      const currentDate = calendarInstance.current.view.activeStart;
      if (currentDate) currentDateRef.current = currentDate;
      calendarInstance.current.destroy();
    } else if (calendarInstance.current) {
      calendarInstance.current.destroy();
    }

    const eventosAulas = agendamentos.map((aula) => {
      const { backgroundColor, textColor } = getColorForEspecialidade(aula.especialidade);
      return {
        id: String(aula.id),
        title: `${aula.especialidade} - ${aula.professorNome || 'Professor'} - ${new Date(
          aula.dataHora,
        ).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        start: aula.dataHora,
        end: calcularDuracao(aula.dataHora),
        backgroundColor,
        borderColor: backgroundColor,
        textColor,
        extendedProps: aula,
      };
    });

    const eventosAusencias = ausencias.map((a) => ({
      id: `aus-${a.id}`,
      title: 'Ausência',
      start: a.dataInicio,
      end: a.dataFim,
      backgroundColor: '#9d9d9e',
      borderColor: '#000000',
      textColor: '#111827',
      classNames: ['ausencia-event'],
      extendedProps: {
        isAusencia: true,
        ausenciaId: a.id,
        motivo: a.motivo,
        dataInicio: a.dataInicio,
        dataFim: a.dataFim,
      },
    }));

    const eventos = [...eventosAulas, ...eventosAusencias];

    let initialDate = null;
    if (currentViewRef.current === 'timeGridDay' && currentDateRef.current) {
      initialDate = currentDateRef.current;
    }

    const calendar = new window.FullCalendar.Calendar(calendarRef.current, {
      initialView: currentViewRef.current || 'timeGridWeek',
      weekends: false,
      locale: 'pt-br',
      height: 'auto',
      slotMinTime: '07:00:00',
      slotMaxTime: '22:00:00',
      allDaySlot: false,
      expandRows: true,
      slotDuration: '00:30:00',
      headerToolbar: { left: '', center: 'title', right: 'prev,next' },
      events: eventos,
      dateClick: (info) => {
        const currentView = calendar.view.type;
        if (currentView === 'dayGridMonth' || currentView === 'timeGridWeek') {
          calendar.changeView('timeGridDay', info.dateStr);
          currentViewRef.current = 'timeGridDay';
          currentDateRef.current = new Date(info.date);
          window.dispatchEvent(
            new CustomEvent('calendarViewChanged', { detail: { view: 'timeGridDay' } }),
          );
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('calendarViewChanged', { detail: { view: 'timeGridDay' } }),
            );
          }, 100);
        } else if (currentView === 'timeGridDay') {
          const clickedDate = new Date(info.date);
          let hora = clickedDate.getHours();
          if (hora < 7) hora = 7;
          if (hora > 22) hora = 22;
          navigate(`${basePath}/agendamento/criar`, {
            state: {
              data: clickedDate.toISOString().split('T')[0],
              horario: `${String(hora).padStart(2, '0')}:00`,
            },
          });
        }
      },
      eventClick: (info) => {
        const isAusencia = info.event.extendedProps?.isAusencia;
        if (isAusencia) {
          setSelectedAusencia(info.event.extendedProps);
          setIsAusenciaViewModalOpen(true);
          return;
        }
        setAgendamentoSelecionado(info.event.extendedProps);
        setModalOpen(true);
      },
      eventDidMount: (info) => {
        info.el.style.cursor = 'pointer';
      },
    });

    if (initialDate && currentViewRef.current === 'timeGridDay') {
      calendar.render();
      calendar.gotoDate(initialDate);
    } else {
      calendar.render();
    }
    calendarInstance.current = calendar;

    // Keep currentViewRef / currentDateRef in sync when user navigates prev/next
    calendar.on('datesSet', () => {
      if (calendarInstance.current?.view) {
        currentViewRef.current = calendarInstance.current.view.type;
        const d = calendarInstance.current.view.activeStart;
        if (d) currentDateRef.current = d;
        window.dispatchEvent(
          new CustomEvent('calendarViewChanged', {
            detail: { view: calendarInstance.current.view.type },
          }),
        );
      }
    });
  }

  const handleChangeView = (viewName) => {
    if (calendarInstance.current) {
      calendarInstance.current.changeView(viewName);
      setActiveView(viewName);
    }
  };

  // Sync activeView state when calendarInstance changes
  useEffect(() => {
    if (calendarInstance.current) {
      setActiveView(calendarInstance.current.view?.type || 'timeGridWeek');
    }
  }, [calendarInstance]);

  // Sync activeView button highlight when dateClick drill-down changes the view
  useEffect(() => {
    const handleViewChanged = (e) => {
      if (e.detail?.view) {
        setActiveView(e.detail.view);
        setTimeout(() => {
          if (calendarInstance.current?.view) {
            setActiveView(calendarInstance.current.view.type || 'timeGridWeek');
          }
        }, 150);
      }
    };
    window.addEventListener('calendarViewChanged', handleViewChanged);
    return () => window.removeEventListener('calendarViewChanged', handleViewChanged);
  }, [calendarInstance]);

  useEffect(() => {
    const timeout = isLoading ? null : setTimeout(() => setShowLoading(false), 400);
    if (isLoading) setShowLoading(true);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Load FullCalendar script and trigger initial fetch
  useEffect(() => {
    const bootstrap = async () => {
      if (!window.FullCalendar) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js';
        script.onload = async () => {
          await fetchFiltros();
          setTimeout(() => {
            setCarregouInicial(true);
            fetchAgendamentosFiltro();
          }, 200);
        };
        document.body.appendChild(script);
      } else {
        await fetchFiltros();
        setTimeout(() => {
          setCarregouInicial(true);
          fetchAgendamentosFiltro();
        }, 200);
      }
    };

    bootstrap();

    return () => {
      if (calendarInstance.current) {
        calendarInstance.current.destroy();
        calendarInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (window.FullCalendar && jaBuscou) {
      initCalendar();
    }
  }, [agendamentos, ausencias]);

  // Refetch on absence events (create/update/delete)
  useEffect(() => {
    if (!idProfessor) return;
    const handler = () => fetchAgendamentosFiltro();
    window.addEventListener('ausencia:create', handler);
    window.addEventListener('ausencia:update', handler);
    window.addEventListener('ausencia:delete', handler);
    return () => {
      window.removeEventListener('ausencia:create', handler);
      window.removeEventListener('ausencia:update', handler);
      window.removeEventListener('ausencia:delete', handler);
    };
  }, [idProfessor]);

  async function deletarAgendamento(id) {
    const result = await Swal.fire({
      title: 'Deletar aula?',
      text: 'Tem certeza que deseja deletar esta aula? Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/agendamentos/${id}`);
        toast.success('Aula deletada com sucesso.');
        setModalOpen(false);
        setAgendamentoSelecionado(null);
        fetchAgendamentosFiltro();
      } catch (error) {
        console.error('Erro ao deletar aula:', error);
        toast.error('Não foi possível deletar a aula. Tente novamente.');
      }
    }
  }

  const hasAgendamentos = agendamentos.length > 0 || (jaBuscou && ausencias.length > 0);

  return (
    <div className="calendar-container">
      <div className="calendar-header-top">
        <h1 className="text-2xl md:text-3xl">Agenda</h1>
        <div className="flex gap-2">
          <button
            className="btn-criar-aula"
            onClick={() => setIsAusenciaModalOpen(true)}
            title="Criar ausência de professor"
          >
            <span className="hidden sm:inline">+ Criar Ausência</span>
            <span className="sm:hidden">+ Aus.</span>
          </button>
          <button
            className="btn-criar-aula"
            onClick={() => navigate(`${basePath}/agendamento/criar`)}
            title="Criar nova aula"
          >
            <span className="hidden sm:inline">+ Criar Aula</span>
            <span className="sm:hidden">+ Aula</span>
          </button>
        </div>
      </div>

      <main className="calendar-main">
        <div className="calendar-header-info">
          <div className="calendar-view-buttons">
            <button
              className={`filter-button ${activeView === 'dayGridMonth' ? 'active' : ''}`}
              onClick={() => handleChangeView('dayGridMonth')}
            >
              <span className="hidden sm:inline">Mês</span>
              <span className="sm:hidden">M</span>
            </button>
            <button
              className={`filter-button ${activeView === 'timeGridWeek' ? 'active' : ''}`}
              onClick={() => handleChangeView('timeGridWeek')}
            >
              <span className="hidden sm:inline">Semana</span>
              <span className="sm:hidden">S</span>
            </button>
            <button
              className={`filter-button ${activeView === 'timeGridDay' ? 'active' : ''}`}
              onClick={() => handleChangeView('timeGridDay')}
            >
              <span className="hidden sm:inline">Dia</span>
              <span className="sm:hidden">D</span>
            </button>
          </div>

          <div className="filtros-inline">
            <div className="filtro-item">
              <label htmlFor="filtro-sala" className="hidden md:inline">
                Sala:
              </label>
              <select
                id="filtro-sala"
                value={idSala}
                onChange={(e) => setIdSala(e.target.value)}
                className="filtro-select-inline"
                disabled={isLoading}
              >
                <option value="">Todas</option>
                {salas.map((sala) => (
                  <option key={sala.id} value={sala.id}>
                    {sala.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-item">
              <label htmlFor="filtro-professor" className="hidden md:inline">
                Professor:
              </label>
              <select
                id="filtro-professor"
                value={idProfessor}
                onChange={(e) => setIdProfessor(e.target.value)}
                className="filtro-select-inline"
                disabled={isLoading}
              >
                <option value="0">Todos</option>
                {professores.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {jaBuscou && !hasAgendamentos && !isLoading && (
          <div className="aviso-vazio">
            <p className="text-sm md:text-base">
              Nenhum agendamento encontrado para os filtros selecionados.
            </p>
          </div>
        )}

        {jaBuscou && (
          <div className="calendar-wrapper">
            <div className={`loading-container ${showLoading ? 'show' : ''}`}>
              <LoadingSpinner message={'Carregando calendário...'} />
            </div>
            <div
              ref={calendarRef}
              className="fullcalendar"
              style={{ opacity: showLoading ? 0 : 1, transition: 'opacity 0.4s ease' }}
            />
          </div>
        )}

        <AgendamentoModal
          isOpen={modalOpen}
          agendamento={agendamentoSelecionado}
          onClose={() => setModalOpen(false)}
          onDelete={deletarAgendamento}
        />

        <AusenciaModal
          isOpen={isAusenciaViewModalOpen}
          ausencia={selectedAusencia}
          onClose={() => {
            setIsAusenciaViewModalOpen(false);
            setSelectedAusencia(null);
          }}
          onDelete={() => {
            setIsAusenciaViewModalOpen(false);
            setSelectedAusencia(null);
            fetchAgendamentosFiltro();
          }}
        />

        <DefinirAusenciaModal
          isOpen={isAusenciaModalOpen}
          onClose={() => setIsAusenciaModalOpen(false)}
          isSecretaria={true}
          professores={professores}
        />
      </main>
    </div>
  );
}
