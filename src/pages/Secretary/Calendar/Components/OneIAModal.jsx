import React, { useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiSend, FiX } from 'react-icons/fi';
import api from '../../../../services/api';
import '../styles/OneIAModal.scss';

/* ─────────────────────────────────────────
   Hook: efeito de digitação (typewriter)
───────────────────────────────────────── */
function useTypewriter(text, speed = 18, enabled = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayed(text || '');
      setDone(true);
      return;
    }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayed, done };
}

/* ─────────────────────────────────────────
   Bolha da IA com typewriter
───────────────────────────────────────── */
function IaBubble({ text, animate }) {
  const { displayed } = useTypewriter(text, 16, animate);

  return (
    <div className="oneia-chat-bubble ia">
      <div className="oneia-chat-avatar ia-avatar">✨</div>
      <div className="oneia-chat-text">
        {displayed}
        {animate && displayed.length < text.length && (
          <span className="oneia-cursor">|</span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Bolha do usuário
───────────────────────────────────────── */
function UserBubble({ text }) {
  return (
    <div className="oneia-chat-bubble user">
      <div className="oneia-chat-text">{text}</div>
      <div className="oneia-chat-avatar user-avatar">👤</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Shimmer de carregamento
───────────────────────────────────────── */
function IaTypingIndicator() {
  return (
    <div className="oneia-chat-bubble ia">
      <div className="oneia-chat-avatar ia-avatar">✨</div>
      <div className="oneia-typing-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Modal Principal OneIA
───────────────────────────────────────── */
const MAX_RESPOSTAS = 3;

const OneIAModal = ({
  isOpen,
  onClose,
  onBack,
  nomeAluno,
  observacao,
  especialidade,
  recomendacaoInicial,
}) => {
  const [mensagens, setMensagens] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [respostasUsuario, setRespostasUsuario] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  /* Popula a primeira mensagem da IA ao abrir */
  useEffect(() => {
    if (isOpen && recomendacaoInicial) {
      setMensagens([{ role: 'ia', text: recomendacaoInicial, animate: true }]);
      setRespostasUsuario(0);
      setInputValue('');
    }
  }, [isOpen, recomendacaoInicial]);

  /* Scroll automático para o final */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, carregando]);

  if (!isOpen) return null;

  const podeResponder = respostasUsuario < MAX_RESPOSTAS && !carregando;

  const handleEnviar = async () => {
    const texto = inputValue.trim();
    if (!texto || !podeResponder) return;

    const novasMensagens = [
      ...mensagens,
      { role: 'usuario', text: texto },
    ];
    setMensagens(novasMensagens);
    setInputValue('');
    setRespostasUsuario((n) => n + 1);
    setCarregando(true);

    try {
      /* Monta o histórico para o backend */
      const historico = novasMensagens.map((m) => ({
        role: m.role === 'ia' ? 'assistant' : 'user',
        content: m.text,
      }));

      const response = await api.post('/api/ia/recomendacao', {
        nomeAluno,
        observacao,
        especialidade,
        historico,
        mensagemUsuario: texto,
      });

      const resposta =
        response.data?.recomendacao || 'Não consegui gerar uma resposta. Tente novamente.';

      setMensagens((prev) => [
        ...prev,
        { role: 'ia', text: resposta, animate: true },
      ]);
    } catch (err) {
      console.error('Erro IA Chat (Backend):', err);
      
      // Simulação de resposta no chat
      const simulationReply = `Entendi seu ponto sobre "${texto}". Para o aluno ${nomeAluno}, recomendo ajustar a intensidade e focar na progressão gradual. (Nota: Esta é uma resposta simulada pois o backend está offline).`;
      
      setMensagens((prev) => [
        ...prev,
        { role: 'ia', text: simulationReply, animate: true },
      ]);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  const restantes = MAX_RESPOSTAS - respostasUsuario;

  return (
    <div className="oneia-modal-overlay" onClick={onBack}>
      <div className="oneia-modal-content" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="oneia-modal-header">
          <button className="oneia-back-btn" onClick={onBack} title="Voltar para a aula">
            <FiArrowLeft size={18} />
          </button>

          <div className="oneia-header-info">
            <span className="oneia-header-badge">✨ OneIA</span>
            <span className="oneia-header-subtitle">
              Recomendações para <strong>{nomeAluno}</strong>
            </span>
          </div>

          <button className="oneia-close-top-btn" onClick={onClose} title="Fechar">
            <FiX size={18} />
          </button>
        </div>

        {/* Chat Body */}
        <div className="oneia-chat-body">
          {mensagens.map((msg, idx) =>
            msg.role === 'ia' ? (
              <IaBubble key={idx} text={msg.text} animate={msg.animate} />
            ) : (
              <UserBubble key={idx} text={msg.text} />
            ),
          )}

          {carregando && <IaTypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Footer / Input */}
        <div className="oneia-chat-footer">
          {respostasUsuario >= MAX_RESPOSTAS ? (
            <div className="oneia-limit-msg">
              Limite de {MAX_RESPOSTAS} perguntas atingido para esta consulta.
            </div>
          ) : (
            <>
              <div className="oneia-input-wrapper">
                <textarea
                  ref={inputRef}
                  className="oneia-input"
                  placeholder="Tire uma dúvida ou peça mais detalhes…"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!podeResponder}
                  rows={1}
                />
                <button
                  className="oneia-send-btn"
                  onClick={handleEnviar}
                  disabled={!inputValue.trim() || !podeResponder}
                  title="Enviar"
                >
                  <FiSend size={16} />
                </button>
              </div>
              <span className="oneia-counter">
                {restantes} pergunta{restantes !== 1 ? 's' : ''} restante{restantes !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OneIAModal;
