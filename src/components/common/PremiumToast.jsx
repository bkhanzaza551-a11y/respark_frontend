import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function PremiumToast({ message, type = "error", onClose, duration = 4000 }) {
  useEffect(() => {
    if (message && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message || typeof document === 'undefined') return null;

  const config = {
    error: {
      icon: <AlertCircle size={20} color="#ef4444" />,
      title: "Error",
      borderColor: "#ef4444",
      bg: "#fff"
    },
    success: {
      icon: <CheckCircle size={20} color="#10b981" />,
      title: "Success",
      borderColor: "#10b981",
      bg: "#fff"
    },
    info: {
      icon: <Info size={20} color="#3b82f6" />,
      title: "Information",
      borderColor: "#3b82f6",
      bg: "#fff"
    }
  };

  const currentConfig = config[type] || config.info;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 32,
      right: 32,
      zIndex: 999999,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      background: currentConfig.bg,
      padding: '16px 20px',
      borderRadius: 12,
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      borderLeft: `4px solid ${currentConfig.borderColor}`,
      maxWidth: 400,
      width: 'max-content',
      animation: 'slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    }}>
      <style>{`
        @keyframes slideInToast {
          0% { transform: translateX(120%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        {currentConfig.icon}
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{currentConfig.title}</span>
        <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
          {message}
        </span>
      </div>
      
      <button 
        onClick={onClose}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          padding: 4,
          margin: '-4px -4px 0 0',
          color: '#94a3b8',
          display: 'flex',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#475569'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
      >
        <X size={16} />
      </button>
    </div>,
    document.body
  );
}
