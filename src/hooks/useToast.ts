import { useToastContext } from '../context/ToastContext';
import { ToastType } from '../context/ToastContext';

export const useToast = () => {
  const { addToast } = useToastContext();

  const success = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration });
  };

  const error = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration });
  };

  const warning = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration });
  };

  const info = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration });
  };

  const toast = (type: ToastType, title: string, message?: string, duration?: number) => {
    addToast({ type, title, message, duration });
  };

  return {
    success,
    error,
    warning,
    info,
    toast,
  };
}; 