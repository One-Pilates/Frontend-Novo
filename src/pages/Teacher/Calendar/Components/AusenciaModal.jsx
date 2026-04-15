import React from 'react';
import { FiX, FiTrash2, FiCalendar, FiClock } from 'react-icons/fi';
import Swal from 'sweetalert2';
import api from '../../../../services/api';
import { toast } from 'sonner';
import '../Styles/Modal.scss';

const AusenciaModal = ({ isOpen, ausencia, onClose, onDelete }) => {
  if (!isOpen || !ausencia) return null;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    // Trata string "2025-04-10T08:00:00" ou com Z
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${data} às ${hora}`;
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Excluir ausência?',
      text: 'Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      confirmButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    try {
      const id = ausencia.ausenciaId ?? ausencia.id;
      await api.delete(`/api/ausencias/${id}`);
      toast.success('Ausência excluída com sucesso!');
      window.dispatchEvent(new CustomEvent('ausencia:delete', { detail: { id } }));
      onDelete && onDelete(id);
      onClose();
    } catch (e) {
      console.error('Erro ao excluir ausência:', e);
      toast.error('Erro ao excluir ausência. Tente novamente.');
    }
  };

  return (
    <div className="modal-overlay animate-backdropFadeIn" onClick={onClose}>
      <div
        className="modal-content animate-slideUp"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px' }}
      >
        <div className="modal-header">
          <h2>Ausência do Professor</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="info-section">
            <div className="info-group">
              {ausencia.motivo && (
                <div className="info-item">
                  <span className="info-label">Motivo:</span>
                  <span className="info-value">{ausencia.motivo}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">
                  <FiCalendar size={14} style={{ marginRight: '4px' }} />
                  Data início:
                </span>
                <span className="info-value">{formatDateTime(ausencia.dataInicio)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FiClock size={14} style={{ marginRight: '4px' }} />
                  Data fim:
                </span>
                <span className="info-value">{formatDateTime(ausencia.dataFim)}</span>
              </div>
            </div>
          </div>

          <div className="edit-actions" style={{ marginTop: '1.5rem' }}>
            <button className="btn-cancel" onClick={onClose}>
              Fechar
            </button>
            <button
              className="btn-save"
              onClick={handleDelete}
              style={{
                backgroundColor: '#d33',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FiTrash2 size={16} />
              Excluir Ausência
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AusenciaModal;
