import { useState } from 'react';
import type { ReactNode } from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  /** Explique la consecuencia, no solo la acción. */
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
}

/**
 * Confirmación de acciones destructivas o irreversibles.
 * Sustituye a las barras de advertencia en línea: no desplaza el contenido de la página.
 */
export default function ConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
}: ConfirmDialogProps) {
  const [isWorking, setIsWorking] = useState(false);

  const handleConfirm = async () => {
    setIsWorking(true);
    try {
      await onConfirm();
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      icon={tone === 'danger' ? 'warning' : 'help'}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={isWorking}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={isWorking}
            icon={tone === 'danger' ? 'delete' : undefined}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-[15px] leading-relaxed text-ink">{description}</div>
    </Modal>
  );
}
