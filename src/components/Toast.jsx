import React, { createContext, useContext, useState, useCallback } from 'react';

// Toast Context
const ToastContext = createContext();

// Toast Provider Component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, message, type };

    setToasts(prev => [...prev, toast]);

    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Container Component
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

// Individual Toast Component
function Toast({ toast, onRemove }) {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`toast toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
      <span className="toast-icon" aria-hidden="true">{getIcon(toast.type)}</span>
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-close"
        onClick={() => onRemove(toast.id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

// Custom Hook to use Toast
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return {
    showToast: context.showToast,
  };
}
