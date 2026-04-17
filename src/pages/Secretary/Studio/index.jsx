import { useEffect, useState } from 'react';
import { FiEdit, FiTrash2, FiX, FiChevronDown } from 'react-icons/fi';
import api from '../../../services/api';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import Botao from '../../../components/Button';
import { getColorForEspecialidade } from '../../../utils/utils';

export default function StudioView() {
  const [activeTab, setActiveTab] = useState('especialidades');

  // Especialidades States
  const [especialidades, setEspecialidades] = useState([]);
  // Modal Especialidades States
  const [showEspModal, setShowEspModal] = useState(false);
  const [editingEsp, setEditingEsp] = useState(null);
  const [formEsp, setFormEsp] = useState('');

  // Salas States
  const [salas, setSalas] = useState([]);
  // Modal Salas States
  const [showSalaModal, setShowSalaModal] = useState(false);
  const [editingSala, setEditingSala] = useState(null);
  const [formSala, setFormSala] = useState({
    nome: '',
    quantidadeMaximaAlunos: '',
    quantidadeEquipamentosPCD: '',
    especialidades: [],
    especialidadesIds: [],
  });

  const fetchData = async () => {
    try {
      // Always fetch specialties as they are needed for both tabs (mapping names/IDs)
      const espResponse = await api.get(`api/especialidades`);
      setEspecialidades(espResponse.data || []);

      if (activeTab === 'salas') {
        const salasResponse = await api.get(`api/salas`);
        setSalas(salasResponse.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do studio:', error);
      toast.error('Ocorreu um erro ao carregar os dados.');
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Funções Especialidades
  const handleAddEsp = () => {
    setEditingEsp(null);
    setFormEsp('');
    setShowEspModal(true);
  };

  const handleEditEsp = (esp) => {
    setEditingEsp(esp);
    setFormEsp(esp.nome);
    setShowEspModal(true);
  };

  const handleSaveEsp = async () => {
    if (!formEsp.trim()) {
      toast.warning('O nome da especialidade não pode estar vazio.');
      return;
    }

    if (editingEsp) {
      try {
        const newName = { nome: formEsp };
        await api.patch(`api/especialidades/${editingEsp.id}`, newName);
        setEspecialidades(
          especialidades.map((e) => (e.id === editingEsp.id ? { ...e, nome: formEsp } : e)),
        );
        toast.success('Especialidade atualizada com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar especialidade:', error);
        toast.error('Ocorreu um erro ao atualizar a especialidade.');
      }
    } else {
      try {
        const newName = { nome: formEsp };
        const response = await api.post(`api/especialidades`, newName);
        toast.success('Especialidade criada com sucesso!');
        setEspecialidades([...especialidades, response.data]);
      } catch (error) {
        console.error('Erro ao criar especialidade:', error);
        toast.error('Ocorreu um erro ao criar a especialidade.');
      }
    }
    setShowEspModal(false);
  };

  const handleDeleteEspecialidade = async (id) => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Essa ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, deletar!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`api/especialidades/${id}`);
          setEspecialidades(especialidades.filter((esp) => esp.id !== id));
          toast.success('Especialidade deletada com sucesso.');
        } catch (error) {
          console.error('Erro ao deletar especialidade:', error);
          toast.error('Ocorreu um erro ao deletar a especialidade.');
        }
      }
    });
  };

  // Funções Salas
  const handleAddSala = () => {
    setEditingSala(null);
    setFormSala({
      nome: '',
      quantidadeMaximaAlunos: '',
      quantidadeEquipamentosPCD: '',
      especialidades: [],
      especialidadesIds: [],
    });
    setShowSalaModal(true);
  };

  const handleEditSala = (sala) => {
    const especialidadesIds = (sala.especialidades || [])
      .map((nomeEsp) => {
        const esp = especialidades.find((e) => e.nome === nomeEsp);
        return esp ? esp.id : null;
      })
      .filter((id) => id !== null);

    setEditingSala(sala);
    setFormSala({
      nome: sala.nome,
      quantidadeMaximaAlunos: sala.quantidadeMaximaAlunos,
      quantidadeEquipamentosPCD: sala.quantidadeEquipamentosPCD,
      especialidades: sala.especialidades || [],
      especialidadesIds: especialidadesIds,
    });
    setShowSalaModal(true);
  };

  const handleSaveSala = async () => {
    if (!formSala.nome.trim()) {
      toast.warning('O nome da sala não pode estar vazio.');
      return;
    } else if (!formSala.quantidadeMaximaAlunos || isNaN(formSala.quantidadeMaximaAlunos)) {
      toast.warning('A quantidade máxima de alunos deve ser um número válido.');
      return;
    } else if (formSala.quantidadeEquipamentosPCD === '' || isNaN(formSala.quantidadeEquipamentosPCD)) {
      toast.warning('A quantidade de equipamentos para PCD deve ser um número válido.');
      return;
    } else if (formSala.especialidades.length === 0) {
      toast.warning('Selecione pelo menos uma especialidade.');
      return;
    }

    const salaObj = {
      nome: formSala.nome,
      especialidadeIds: formSala.especialidadesIds,
      quantidadeMaximaAlunos: Number(formSala.quantidadeMaximaAlunos),
      quantidadeEquipamentosPCD: Number(formSala.quantidadeEquipamentosPCD),
    };

    if (editingSala) {
      try {
        const response = await api.patch(`api/salas/${editingSala.id}`, salaObj);
        toast.success('Sala atualizada com sucesso!');
        setSalas(salas.map((s) => (s.id === editingSala.id ? { ...s, ...response.data } : s)));
      } catch (error) {
        console.error('Erro ao atualizar sala:', error);
        toast.error('Ocorreu um erro ao atualizar a sala.');
      }
    } else {
      try {
        const response = await api.post('api/salas', salaObj);
        toast.success('Sala criada com sucesso!');
        setSalas([...salas, response.data]);
      } catch (error) {
        console.error('Erro ao criar sala:', error);
        toast.error('Ocorreu um erro ao criar a sala.');
      }
    }
    setShowSalaModal(false);
  };

  const handleDeleteSala = (id) => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Essa ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, deletar!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`api/salas/${id}`);
          setSalas(salas.filter((s) => s.id !== id));
          toast.success('Sala deletada com sucesso.');
        } catch (error) {
          console.error('Erro ao deletar sala:', error);
          toast.error('Ocorreu um erro ao deletar a sala.');
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 py-6 px-4 md:px-8 lg:px-16 h-full mx-auto ml-auto bg-slate-50/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Configurações do Studio
        </h1>
      </div>

      {/* Tabs Navigation Standard */}
      <div className="flex gap-4 border-b-2 border-slate-100/60 pb-1">
        <button
          onClick={() => setActiveTab('especialidades')}
          className={`px-6 py-4 text-base font-bold transition-all duration-300 border-b-4 -mb-[2px] ${activeTab === 'especialidades'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
          Especialidades
        </button>
        <button
          onClick={() => setActiveTab('salas')}
          className={`px-6 py-4 text-base font-bold transition-all duration-300 border-b-4 -mb-[2px] ${activeTab === 'salas'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
          Salas
        </button>
      </div>

      {/* Content */}
      <div className="w-full">
        {activeTab === 'especialidades' ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Especialidades Cadastradas</h2>
                <p className="text-sm font-medium text-slate-400 mt-1">
                  {especialidades.length} {especialidades.length === 1 ? 'especialidade' : 'especialidades'} encontrada(s)
                </p>
              </div>
              <button
                onClick={handleAddEsp}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-md shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                + Nova Especialidade
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {especialidades.length > 0 ? (
                especialidades.map((esp) => {
                  const { backgroundColor } = getColorForEspecialidade(esp.nome);
                  return (
                    <div
                      key={esp.id}
                      className="rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 bg-white hover:translate-y-[-2px]"
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className="w-3 h-10 rounded-full shrink-0"
                            style={{ backgroundColor }}
                          />
                          <h3 className="font-bold text-lg text-slate-700">
                            {esp.nome}
                          </h3>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleEditEsp(esp)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all hover:scale-110"
                            title="Editar"
                          >
                            <FiEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteEspecialidade(esp.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all hover:scale-110"
                            title="Deletar"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-100">
                  <p className="text-slate-400 font-medium">Nenhuma especialidade cadastrada ainda</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Salas Cadastradas</h2>
                <p className="text-sm font-medium text-slate-400 mt-1">
                  {salas.length} {salas.length === 1 ? 'sala pesquisada' : 'salas pesquisadas'} encontrada(s)
                </p>
              </div>
              <button
                onClick={handleAddSala}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-md shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                + Nova Sala
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {salas.length > 0 ? (
                salas.map((sala) => (
                  <div
                    key={sala.id}
                    className="rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 bg-white hover:translate-y-[-2px]"
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                      <div className="flex flex-col gap-4 flex-1 w-full">
                        <h3 className="font-extrabold text-2xl text-slate-800 tracking-tight">
                          {sala.nome}
                        </h3>

                        <div className="flex flex-wrap gap-6">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Capacidade:</span>
                            <span className="px-4 py-1.5 rounded-xl text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              {sala.quantidadeMaximaAlunos} alunos
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">PCD:</span>
                            <span className="px-4 py-1.5 rounded-xl text-sm font-bold bg-violet-50 text-violet-700 border border-violet-100">
                              {sala.quantidadeEquipamentosPCD} unidades
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Especialidades Vinculadas:</span>
                          <div className="flex gap-2 flex-wrap">
                            {sala.especialidades && sala.especialidades.length > 0 ? (
                              sala.especialidades.map((esp, index) => {
                                const espNome = typeof esp === 'string' ? esp : esp.nome;
                                const { backgroundColor, textColor } = getColorForEspecialidade(espNome);
                                return (
                                  <span
                                    key={index}
                                    className="px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-white/50 shadow-sm"
                                    style={{ backgroundColor, color: textColor }}
                                  >
                                    {espNome}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-sm text-slate-300 italic">Nenhuma especialidade vinculada</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-3 shrink-0 self-end lg:self-start">
                        <button
                          onClick={() => handleEditSala(sala)}
                          className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-blue-100"
                          title="Editar"
                        >
                          <FiEdit size={22} />
                        </button>
                        <button
                          onClick={() => handleDeleteSala(sala.id)}
                          className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-rose-100"
                          title="Deletar"
                        >
                          <FiTrash2 size={22} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-100 col-span-full">
                  <p className="text-slate-400 font-medium">Nenhuma sala cadastrada ainda</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Specialty Modal Standard */}
      {showEspModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl border border-slate-100 animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {editingEsp ? 'Editar Especialidade' : 'Nova Especialidade'}
              </h3>
              <button
                onClick={() => setShowEspModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Nome da Especialidade
                </label>
                <input
                  type="text"
                  value={formEsp}
                  onChange={(e) => setFormEsp(e.target.value)}
                  placeholder="Ex: Fisioterapia"
                  className="w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all border-2 border-slate-100 font-medium"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowEspModal(false)}
                  className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEsp}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-md shadow-blue-100"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Modal Standard */}
      {showSalaModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full my-8 p-10 shadow-2xl border border-slate-100 animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {editingSala ? 'Editar Sala' : 'Nova Sala'}
              </h3>
              <button
                onClick={() => setShowSalaModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Nome da Sala
                </label>
                <input
                  type="text"
                  value={formSala.nome}
                  onChange={(e) => setFormSala({ ...formSala, nome: e.target.value })}
                  placeholder="Ex: Sala Reformer"
                  className="w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all border-2 border-slate-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Capacidade Máxima
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formSala.quantidadeMaximaAlunos}
                    onChange={(e) => setFormSala({ ...formSala, quantidadeMaximaAlunos: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all border-2 border-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Equipamentos PCD
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formSala.quantidadeEquipamentosPCD}
                    onChange={(e) => setFormSala({ ...formSala, quantidadeEquipamentosPCD: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all border-2 border-slate-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                  Especialidades Permitidas
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-4 rounded-[1.5rem] bg-slate-50/50 border border-slate-100">
                  {especialidades.map((esp) => (
                    <label
                      key={esp.id}
                      className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all bg-white border border-slate-50 hover:border-orange-100 hover:shadow-sm"
                    >
                      <input
                        type="checkbox"
                        checked={
                          formSala.especialidades?.includes(esp.nome) ||
                          formSala.especialidadesIds?.includes(esp.id) ||
                          false
                        }
                        onChange={(e) => {
                          const currentNomes = formSala.especialidades || [];
                          const currentIds = formSala.especialidadesIds || [];
                          if (e.target.checked) {
                            setFormSala({
                              ...formSala,
                              especialidades: [...currentNomes, esp.nome],
                              especialidadesIds: [...currentIds, esp.id],
                            });
                          } else {
                            setFormSala({
                              ...formSala,
                              especialidades: currentNomes.filter((nome) => nome !== esp.nome),
                              especialidadesIds: currentIds.filter((id) => id !== esp.id),
                            });
                          }
                        }}
                        className="w-5 h-5 accent-orange-500 border-slate-300 rounded"
                      />
                      <span className="text-sm font-bold text-slate-700">{esp.nome}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button
                  onClick={() => setShowSalaModal(false)}
                  className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveSala}
                  className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all hover:scale-105"
                >
                  Salvar Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
