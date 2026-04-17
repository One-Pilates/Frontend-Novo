import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function TermosDeUso() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Barra de Navegação Interna */}
      <nav className="border-b border-slate-100 px-6 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group"
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
            Voltar
          </button>
          <div className="text-xs font-bold text-slate-300 tracking-widest uppercase">
            Documentação Legal
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-16 px-6 md:px-12">
        <header className="mb-20">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Termos de Uso do <span className="text-orange-500">OnePilates</span>
          </h1>
          <p className="text-slate-400 font-medium flex items-center gap-2">
            Versão 1.0 <span className="w-1 h-1 rounded-full bg-slate-200" /> Atualizado em 17 de Abril de 2026
          </p>
        </header>

        <div className="space-y-16">
          <section className="group">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-orange-500"></span>
              01. Introdução e Aceitação
            </h2>
            <div className="text-slate-600 leading-relaxed text-lg pl-12">
              <p>
                Bem-vindo à plataforma OnePilates. Ao utilizar nossos serviços, você aceita integralmente estes Termos de Uso. Este documento regula o acesso e a utilização do nosso sistema de gerenciamento de estúdios.
              </p>
            </div>
          </section>

          <section className="group">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-orange-500"></span>
              02. Responsabilidades do Usuário
            </h2>
            <div className="text-slate-600 leading-relaxed text-lg pl-12 space-y-6">
              <p>
                Como usuário do OnePilates (aluno ou instrutor), você se compromete a fornecer informações precisas e a manter a segurança de suas credenciais de acesso.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-8 rounded-2xl border border-slate-100">
                <div className="flex gap-4">
                  <FiChevronRight className="text-orange-500 shrink-0 mt-1" />
                  <p className="text-sm font-medium">Uso correto das ferramentas de agendamento e cancelamento.</p>
                </div>
                <div className="flex gap-4">
                  <FiChevronRight className="text-orange-500 shrink-0 mt-1" />
                  <p className="text-sm font-medium">Proteção de dados sensíveis e senhas pessoais.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="group">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-orange-500"></span>
              03. Agendamentos e Estúdios
            </h2>
            <div className="text-slate-600 leading-relaxed text-lg pl-12">
              <p>
                O sistema OnePilates é um facilitador. As regras de cada estúdio parceiro (horários, faltas, reposições) são definidas individualmente e devem ser respeitadas conforme o contrato firmado com a unidade física.
              </p>
            </div>
          </section>

          <section className="group border-t border-slate-100 pt-16">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="max-w-md">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Dúvidas Frequentes?</h3>
                <p className="text-slate-500 text-sm">Se você tiver qualquer dúvida sobre como operamos, nossa equipe de suporte está pronta para ajudar.</p>
              </div>
              <a 
                href="mailto:suporte@onepilates.com" 
                className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
              >
                Suporte Técnico
              </a>
            </div>
          </section>
        </div>

        <footer className="mt-32 pt-12 border-t border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest text-center space-y-2">
          <div>&copy; 2026 OnePilates — Todos os direitos reservados.</div>
          <div className="text-slate-300">São Paulo Tech School</div>
        </footer>
      </div>
    </div>
  );
}
