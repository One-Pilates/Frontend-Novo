import { useState, useEffect, useCallback } from 'react';
import { FiActivity, FiUserX, FiUserCheck, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import './style.scss';
import KPICard from './components/KPICard';
import FrequenciaChart from './components/FrequenciaChart';
import PieChart from './components/PieChart';
import Filter from './components/Filter';
import NoDataAlert from './components/NoDataAlert';

export default function DashboardSecretary() {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [kpis, setKpis] = useState([]);
  const [pie, setPie] = useState([]);
  const [frequencia, setFrequencia] = useState([]);
  const [hasData, setHasData] = useState(true);
  const [_totalAulas, setTotalAulas] = useState(0);
  const [_top3, setTop3] = useState([]);

  const { user } = useAuth();

  const emptyKpis = [
    {
      title: 'Sessões Realizadas',
      value: '',
      iconBgColor: '#d8b4fe',
      icon: <FiActivity size={24} color="#fff" />,
    },
    {
      title: 'Alunos Atendidos',
      value: '',
      iconBgColor: '#fdba74',
      icon: <FiUserX size={24} color="#fff" />,
    },
    {
      title: 'Dia com Maior Atendimento',
      value: '',
      iconBgColor: '#93c5fd',
      icon: <FiUserCheck size={24} color="#fff" />,
    },
    {
      title: 'Professor com mais atendimentos',
      value: '',
      iconBgColor: '#fef08a',
      icon: <FiUsers size={24} color="#fff" />,
    },
  ];

  const handleFilterChange = useCallback((newPeriod) => {
    setSelectedPeriod(newPeriod);
  }, []);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchDashboardData = async () => {
      try {
        const dias = selectedPeriod || 30;
        const endpoint = `api/secretarias/qtdUltimosDias/${dias}`;

        const { data } = await api.get(endpoint);

        const graficoDias = data.agendamentosPorDias || [];
        const graficoProf = data.qtdSessoesPorProfessor || [];
        const qtdAlunos = data.qtdDeAlunosAtendidos || 0;

        const hasAnyData = graficoDias.length > 0 || graficoProf.length > 0;
        if (!hasAnyData) {
          setPie([]);
          setFrequencia([]);
          setTop3([]);
          setTotalAulas(0);
          setKpis(emptyKpis);
          setHasData(false);
          return;
        }

        setFrequencia(graficoDias);

        const pieData = graficoProf.map((p) => ({
          name: p.nomeProfessor,
          y: p.totalAgendamentosPorProfessor,
        }));
        setPie(pieData);

        const total = graficoProf.reduce(
          (sum, item) => sum + item.totalAgendamentosPorProfessor,
          0,
        );
        setTotalAulas(total);

        let diaComMaiorAtendimento =
          graficoDias.length > 0
            ? graficoDias.reduce((a, b) => (a.totalAgendamentos > b.totalAgendamentos ? a : b))
                .diaSemana
            : '-';

        const diasPT = {
          monday: 'Segunda-feira',
          tuesday: 'Terça-feira',
          wednesday: 'Quarta-feira',
          thursday: 'Quinta-feira',
          friday: 'Sexta-feira',
          saturday: 'Sábado',
          sunday: 'Domingo',
        };

        diaComMaiorAtendimento = (diaComMaiorAtendimento || '').toLowerCase();
        diaComMaiorAtendimento = diasPT[diaComMaiorAtendimento] || '';

        const professorMaisAtendido =
          graficoProf.length > 0
            ? graficoProf.reduce((a, b) =>
                a.totalAgendamentosPorProfessor > b.totalAgendamentosPorProfessor ? a : b,
              ).nomeProfessor
            : '';

        const newKpis = [
          {
            title: 'Sessões Realizadas',
            value: total ? total.toString() : '',
            iconBgColor: '#d8b4fe',
            icon: <FiActivity size={24} color="#fff" />,
          },
          {
            title: 'Alunos Atendidos',
            value: qtdAlunos ? qtdAlunos.toString() : '',
            iconBgColor: '#fdba74',
            icon: <FiUserX size={24} color="#fff" />,
          },
          {
            title: 'Dia com Maior Atendimento',
            value: diaComMaiorAtendimento,
            iconBgColor: '#93c5fd',
            icon: <FiUserCheck size={24} color="#fff" />,
          },
          {
            title: 'Professor com mais atendimentos',
            value: professorMaisAtendido || '',
            iconBgColor: '#fef08a',
            icon: <FiUsers size={24} color="#fff" />,
          },
        ];

        setKpis(newKpis);

        const top = [...graficoProf]
          .sort((a, b) => b.totalAgendamentosPorProfessor - a.totalAgendamentosPorProfessor)
          .slice(0, 3)
          .map((item) => ({
            professor: item.nomeProfessor,
            total: item.totalAgendamentosPorProfessor,
            percentual: total ? Math.round((item.totalAgendamentosPorProfessor / total) * 100) : 0,
          }));

        setTop3(top);
        setHasData(true);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setPie([]);
        setFrequencia([]);
        setTotalAulas(0);
        setTop3([]);
        setKpis(emptyKpis);
        setHasData(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, selectedPeriod]);

  return (
    <div className="overview-teacher">
      <div className="overview-header">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-escuro)' }}>
          Visão Geral
        </h1>
        <Filter value={selectedPeriod} onChange={handleFilterChange} />
      </div>

      {!hasData && <NoDataAlert selectedPeriod={selectedPeriod} />}

      <div className="kpi-grid">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} {...kpi} />
        ))}
      </div>

      <div className="charts-grid">
        <FrequenciaChart
          title="Frequência por Dia da Semana"
          data={frequencia}
          period={selectedPeriod}
        />

        <PieChart title="Porcentagem de aulas por professor" data={pie} />
      </div>
    </div>
  );
}
