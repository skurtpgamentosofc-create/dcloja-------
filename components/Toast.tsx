import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: <CheckCircle2 className="text-green-400" size={24} />,
      styles: "border-green-500/20 bg-zinc-900/95 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-green-500/10",
      title: "Sucesso"
    },
    error: {
      icon: <AlertTriangle className="text-red-400" size={24} />,
      styles: "border-red-500/20 bg-zinc-900/95 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-red-500/10",
      title: "Atenção"
    },
    info: {
      icon: <Info className="text-violet-400" size={24} />,
      styles: "border-violet-500/20 bg-zinc-900/95 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-violet-500/10",
      title: "Informação"
    }
  };

  const { icon, styles, title } = config[type];

  return (
    <div className={`fixed top-24 right-4 z-[60] flex items-start gap-4 px-5 py-4 rounded-xl border ${styles} backdrop-blur-md animate-slide-in-right max-w-sm w-full pointer-events-auto`}>
      <div className="shrink-0 mt-0.5 bg-white/5 p-2 rounded-full">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-white text-sm mb-0.5 leading-none">{title}</h4>
        <p className="text-sm text-gray-400 leading-snug">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="shrink-0 -mr-2 -mt-2 text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;