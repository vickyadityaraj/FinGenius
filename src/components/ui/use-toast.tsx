import React, { createContext, useContext, useState } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success';

type ToastProps = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextType = {
  toast: (props: ToastProps) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);
  
  const toast = (props: ToastProps) => {
    const id = Date.now();
    const newToast = { ...props, id };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, props.duration || 3000);
  };
  
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-md shadow-md transition-all transform animate-in fade-in slide-in-from-right-10 max-w-md ${
              t.variant === 'destructive'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : t.variant === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{t.title}</h3>
                {t.description && <p className="text-sm mt-1">{t.description}</p>}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 