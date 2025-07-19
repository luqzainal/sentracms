import { useState, useCallback } from 'react';

interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
  onConfirm: () => void;
}

export const useConfirmation = () => {
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);

  const showConfirmation = useCallback((
    onConfirm: () => void,
    options: ConfirmationOptions
  ) => {
    setConfirmation({
      isOpen: true,
      onConfirm,
      title: options.title || 'Confirm Action',
      message: options.message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      type: options.type || 'danger',
      icon: options.icon
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmation(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmation) {
      confirmation.onConfirm();
      hideConfirmation();
    }
  }, [confirmation, hideConfirmation]);

  return {
    confirmation,
    showConfirmation,
    hideConfirmation,
    handleConfirm
  };
}; 