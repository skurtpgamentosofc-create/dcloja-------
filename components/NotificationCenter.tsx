
import React, { useState } from 'react';
import { Bell, CheckCircle2, Info, AlertCircle, X, CheckCheck, Trash2 } from 'lucide-react';
import { Notification } from '../types';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onDelete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-green-400" size={16} />;
      case 'warning': return <AlertCircle className="text-yellow-400" size={16} />;
      default: return <Info className="text-violet-400" size={16} />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
      >
        <Bell size={22} className={unreadCount > 0 ? "animate-pulse" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-black animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-3 w-80 md:w-96 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-zoom-in overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Notificações</p>
                <p className="text-xs font-bold text-white">Central de Status</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={onMarkAllAsRead}
                  className="flex items-center gap-1 text-[9px] text-violet-400 hover:text-white font-black uppercase tracking-widest transition-colors"
                >
                  <CheckCheck size={12} /> Ler Tudo
                </button>
              )}
            </div>

            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center gap-3">
                  <Bell className="text-zinc-700" size={32} />
                  <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest italic">Tudo limpo por aqui</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 flex gap-3 transition-colors hover:bg-white/5 group ${!n.read ? 'bg-violet-600/5' : ''}`}
                      onClick={() => onMarkAsRead(n.id)}
                    >
                      <div className="mt-0.5 shrink-0">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-xs font-bold truncate ${!n.read ? 'text-white' : 'text-zinc-400'}`}>
                            {n.title}
                          </h4>
                          <span className="text-[8px] text-zinc-600 font-medium shrink-0 ml-2">
                            {new Date(n.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-[10px] leading-relaxed line-clamp-2 ${!n.read ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {n.message}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-700 hover:text-red-400 transition-all shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-white/5 bg-black/20 text-center">
                 <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Nexus Notification Protocol v1.2</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
