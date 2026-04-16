import React, { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';
import Button from './Components/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AgendamentoModal from './Components/AulaModal';
import DefinirAusenciaModal from './Components/DefinirAusenciaModal';
import AusenciaModal from './Components/AusenciaModal';
import { toast } from 'sonner';
import './Styles/Calendar.scss';

const Calendar = () => {
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [isAgendamentoModalOpen, setIsAgendamentoModalOpen] = useState(false);
  const [isAusenciaModalOpen, setIsAusenciaModalOpen] = useState(false);
  const [isAusenciaViewModalOpen, setIsAusenciaViewModalOpen] = useState(false);
  const [selectedAusencia, setSelectedAusencia] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [ausencias, setAusencias] = useState([]);

  const calendarRef = useRef(null);
  const calendarInstance = useRef(null);

  const especialidadeCores = {
    Pilates: '#ff6600',
    Fisioterapia: '#4CAF50',
    Osteopatia: '#2196F3',
    RPG: '#009688',
    Microfisioterapia: '#9C27B0',
    Shiatsu: '#673AB7',
    'Drenagem Linfática': '#03A9F4',
    Acupuntura: '#E91E63',
  };

  const getColorForEspecialidade = (esp) => {
    const backgroundColor = especialidadeCores[esp] || '#3788d8';
    const textColor = [
      '#ff6600',
      '#4CAF50',
      '#2196F3',
      '#9C27B0',
      '#673AB7',
      '#E91E63',
      '#009688',
      '#03A9F4',
    ].includes(backgroundColor)
      ? '#fff'
      : '#000';
    return { backgroundColor, textColor };
  };

  async function fetchAgendamentos() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.get(`/api/agendamentos/professorId/${user.id}`);
      setAgendamentos(Array.isArray(response.data) ? response.data : []);

      try {
        const respAus = await api.get(`/api/ausencias/professor/${user.id}`);
        setAusencias(Array.isArray(respAus.data) ? respAus.data : []);
      } catch (err) {
        console.warn('Não foi possível carregar ausências:', err);
        setAusencias([]);
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      setAgendamentos([]);
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
    if (calendarInstance.current) calendarInstance.current.destroy();

    const eventosAulas = agendamentos.map((aula) => {
      const { backgroundColor, textColor } = getColorForEspecialidade(aula.especialidade);
      return {
        id: String(aula.id),
        title: `${aula.especialidade} - ${new Date(aula.dataHora).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        start: aula.dataHora,
        end: calcularDuracao(aula.dataHora),
        backgroundColor,
        borderColor: backgroundColor,
        textColor,
        extendedProps: aula,
      };
    });

    const eventosAusencias = (ausencias || []).map((a) => {
      return {
        id: `aus-${a.id}`,
        title: 'Ausência',
        start: a.dataInicio,
        end: a.dataFim,
        backgroundColor: '#9d9d9e',
        borderColor: '#000000',
        textColor: '#111827',
        classNames: ['ausencia-event'],
        extendedProps: { isAusencia: true, ausenciaId: a.id, motivo: a.motivo, dataInicio: a.dataInicio, dataFim: a.dataFim },
      };
    });

    const eventos = [...eventosAulas, ...eventosAusencias];
    const isMobile = window.innerWidth < 768;
    const calendar = new window.FullCalendar.Calendar(calendarRef.current, {
      initialView: isMobile ? 'timeGridDay' : 'timeGridWeek',
      weekends: false,
      locale: 'pt-br',
      height: 'auto',
      slotMinTime: '07:00:00',
      slotMaxTime: '22:00:00',
      allDaySlot: false,
      expandRows: true,
      slotDuration: '00:30:00',
      headerToolbar: {
        left: isMobile ? '' : '',
        center: 'title',
        right: 'prev,next',
      },
      titleFormat: isMobile
        ? { month: 'short', day: 'numeric' }
        : { month: 'long', year: 'numeric' },
      events: eventos,
      selectable: true,
      selectAllow: (selectInfo) => {
        const start = selectInfo.start;
        const end = selectInfo.end;
        const hasOverlap = calendar.getEvents().some((ev) => {
          if (!ev.start || !ev.end) return false;
          const isBlocked =
            ev.display === 'background' || (ev.extendedProps && ev.extendedProps.isAusencia);
          if (!isBlocked) return false;
          return !(end <= ev.start || start >= ev.end);
        });
        return !hasOverlap;
      },
      dateClick: (info) => {
        const view = calendarInstance.current?.view?.type;
        if (view === 'dayGridMonth' || view === 'timeGridWeek') {
          calendarInstance.current.changeView('timeGridDay', info.date);
          setActiveView('timeGridDay');
          return;
        }
        const clickDate = info.date;
        const tinyEnd = new Date(clickDate.getTime() + 1000);
        const blocked = calendar.getEvents().some((ev) => {
          if (!ev.start || !ev.end) return false;
          const isBlocked =
            ev.display === 'background' || (ev.extendedProps && ev.extendedProps.isAusencia);
          if (!isBlocked) return false;
          return !(tinyEnd <= ev.start || clickDate >= ev.end);
        });
        if (blocked) return;
      },
      eventClick: (info) => {
        const isBlocked =
          info.event.display === 'background' ||
          (info.event.extendedProps && info.event.extendedProps.isAusencia);
        if (isBlocked) {
          if (info.event.extendedProps?.isAusencia) {
            setSelectedAusencia(info.event.extendedProps);
            setIsAusenciaViewModalOpen(true);
          }
          return;
        }
        const agendamentoData = info.event.extendedProps;
        if (agendamentoData) {
          setSelectedAgendamento(agendamentoData);
          setIsAgendamentoModalOpen(true);
        }
      },
      eventDidMount: (info) => {
        const isBlocked =
          info.event.display === 'background' ||
          (info.event.extendedProps && info.event.extendedProps.isAusencia);
        info.el.style.cursor = isBlocked ? 'pointer' : 'pointer';
      },
    });

    calendar.render();
    calendarInstance.current = calendar;
  }

  useEffect(() => {
    const loadCalendar = async () => {
      try {
        if (!window.FullCalendar) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css';
          document.head.appendChild(link);

          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js';
          script.onload = async () => {
            await fetchAgendamentos();
          };
          document.body.appendChild(script);
        } else {
          await fetchAgendamentos();
        }
      } catch (error) {
        console.error('Erro ao carregar calendário:', error);
        setIsLoading(false);
      }
    };

    loadCalendar();

    return () => {
      if (calendarInstance.current) {
        calendarInstance.current.destroy();
        calendarInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (window.FullCalendar && !isLoading) {
      initCalendar();
    }
  }, [agendamentos, ausencias, isLoading]);

  useEffect(() => {
    const handleAusenciaCreate = (e) => {
      const ev = e.detail;
      if (calendarInstance.current && ev) {
        try {
          calendarInstance.current.addEvent(ev);
        } catch (err) {
          console.error('Erro ao adicionar evento de ausência no calendário:', err);
        }
      }
    };

    const handleAusenciaDelete = () => {
      fetchAgendamentos();
    };

    const handleAusenciaUpdate = () => {
      fetchAgendamentos();
    };

    window.addEventListener('ausencia:create', handleAusenciaCreate);
    window.addEventListener('ausencia:delete', handleAusenciaDelete);
    window.addEventListener('ausencia:update', handleAusenciaUpdate);
    return () => {
      window.removeEventListener('ausencia:create', handleAusenciaCreate);
      window.removeEventListener('ausencia:delete', handleAusenciaDelete);
      window.removeEventListener('ausencia:update', handleAusenciaUpdate);
    };
  }, []);

  const [activeView, setActiveView] = useState('timeGridWeek');
  const [showLoading, setShowLoading] = useState(false);

  const handleChangeView = (viewName) => {
    const calendar = calendarInstance.current;
    if (calendar) {
      calendar.changeView(viewName);
      setActiveView(viewName);
    }
  };

  useEffect(() => {
    if (calendarInstance.current) {
      setActiveView(calendarInstance.current.view?.type || 'timeGridWeek');
    }
  }, [calendarInstance]);

  useEffect(() => {
    let timeout;
    if (isLoading) {
      setShowLoading(true);
    } else {
      timeout = setTimeout(() => setShowLoading(false), 400);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  return (
    <div className="calendar-container px-3 sm:px-4 md:px-6 lg:px-8 py-2">
      <h1 className="text-xl sm:text-2xl font-bold mb-3">Agenda</h1>
      <main className="calendar-main">
        <div className="calendar-header-info flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="calendar-view-buttons w-full sm:w-auto justify-center sm:justify-start">
            <button
              className={`filter-button ${activeView === 'dayGridMonth' ? 'active' : ''} flex-1 sm:flex-initial`}
              onClick={() => handleChangeView('dayGridMonth')}
            >
              <span className="hidden sm:inline">Mês</span>
              <span className="sm:hidden">M</span>
            </button>
            <button
              className={`filter-button ${activeView === 'timeGridWeek' ? 'active' : ''} flex-1 sm:flex-initial`}
              onClick={() => handleChangeView('timeGridWeek')}
            >
              <span className="hidden sm:inline">Semana</span>
              <span className="sm:hidden">S</span>
            </button>
            <button
              className={`filter-button ${activeView === 'timeGridDay' ? 'active' : ''} flex-1 sm:flex-initial`}
              onClick={() => handleChangeView('timeGridDay')}
            >
              <span className="hidden sm:inline">Dia</span>
              <span className="sm:hidden">D</span>
            </button>
          </div>

          <Button onClick={() => setIsAusenciaModalOpen(true)} disabled={isLoading}>
            <span className="hidden sm:inline">Definir Ausência</span>
            <span className="sm:hidden text-xs">Ausência</span>
          </Button>
        </div>

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
      </main>

      <AgendamentoModal
        isOpen={isAgendamentoModalOpen}
        agendamento={selectedAgendamento}
        onClose={() => {
          setIsAgendamentoModalOpen(false);
          setSelectedAgendamento(null);
        }}
      />

      <DefinirAusenciaModal
        isOpen={isAusenciaModalOpen}
        onClose={() => setIsAusenciaModalOpen(false)}
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
        }}
      />
    </div>
  );
};

export default Calendar;
