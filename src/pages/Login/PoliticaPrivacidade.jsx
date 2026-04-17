import { FiArrowLeft, FiShield, FiLock, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function PoliticaPrivacidade() {
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
            Privacidade e Dados
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-16 px-6 md:px-12">
        <header className="mb-20">
          <div className="inline-flex p-3 rounded-xl bg-blue-50 text-blue-600 mb-6">
            <FiShield size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Política de <span className="text-blue-500">Privacidade</span>
          </h1>
          <p className="text-slate-400 font-medium flex items-center gap-2">
            OnePilates Data Protection <span className="w-1 h-1 rounded-full bg-slate-200" /> Atualizado em 17 de Abril de 2026
          </p>
        </header>

        <div className="space-y-16">
          <section className="group">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-blue-500"></span>
              01. Compromisso com a Privacidade
            </h2>
            <div className="text-slate-600 leading-relaxed text-lg pl-12">
              <p>
                A privacidade dos seus dados é o pilar da nossa confiança. Esta política descreve como o OnePilates coleta, protege e utiliza suas informações para oferecer a melhor experiência em seu estúdio de Pilates.
              </p>
            </div>
          </section>

          <section className="group">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-blue-500"></span>
              02. Coleta e Uso de Informações
            </h2>
            <div className="text-slate-600 leading-relaxed text-lg pl-12 space-y-8">
              <p>
                Coletamos apenas o estritamente necessário para sua segurança física e identificação nas aulas.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
                  <FiLock className="mb-4 text-blue-500" size={24} />
                  <h4 className="font-bold text-slate-900 mb-2">Dados Cadastrais</h4>
                  <p className="text-sm text-slate-500">Nome, CPF e e-mail para identificação única no sistema e registros do estúdio.</p>
                </div>
                <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
                  <FiCheckCircle className="mb-4 text-blue-500" size={24} />
                  <h4 className="font-bold text-slate-900 mb-2">Saúde e Bem-estar</h4>
                  <p className="text-sm text-slate-500">Informações sobre limitações físicas para que os instrutores adaptem os exercícios com segurança.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="group">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-blue-500"></span>
              03. Seus Direitos Digitais
            </h2>
            <div className="text-slate-600 leading-relaxed text-lg pl-12">
              <p>
                Seus dados pertencem a você. Você tem o direito de solicitar a correção, exportação ou exclusão total dos seus dados do nosso banco de dados a qualquer momento, bastando entrar em contato com o suporte ou a secretaria do estúdio.
              </p>
            </div>
          </section>

          <section className="group border-t border-slate-100 pt-16">
            <div className="p-10 bg-slate-900 rounded-[2rem] text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-md">
                  <h3 className="text-2xl font-bold mb-3">Privacidade Levada a Sério</h3>
                  <p className="text-slate-400 text-sm">Estamos em conformidade com as melhores práticas de proteção de dados (LGPD) para garantir sua total segurança.</p>
                </div>
                <a 
                  href="mailto:privacidade@onepilates.com" 
                  className="inline-flex items-center justify-center px-10 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-50 transition-all shrink-0"
                >
                  Canal de Dados
                </a>
              </div>
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
