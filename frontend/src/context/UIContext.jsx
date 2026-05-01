
import React, { createContext, useContext, useState, useCallback } from 'react';


const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);


    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
      <UIContext.Provider value={{ showToast }}>
        {children}

        {/* Toast Container - Giữ nguyên logic của bạn */}
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {toasts.map((toast) => (
              <div
                  key={toast.id}
                  style={{
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: toast.type === 'success'
                        ? 'rgba(34, 197, 94, 0.9)'
                        : toast.type === 'danger'
                            ? 'rgba(239, 68, 68, 0.9)'
                            : 'rgba(59, 130, 246, 0.9)',
                    transition: 'all 0.3s ease'
                  }}
              >
                {toast.message}
              </div>
          ))}
        </div>
      </UIContext.Provider>
  );
};


export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};