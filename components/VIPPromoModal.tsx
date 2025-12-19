
import React from 'react';
import { X, Crown, Zap, ShieldCheck, CheckCircle2, Lock, Rocket, Smartphone, MessageSquare } from 'lucide-react';
import Button from './Button';

interface VIPPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'vazados' | 'telas';
  onAction: () => void;
}

const VIPPromoModal: React.FC<VIPPromoModalProps> = ({ isOpen, onClose, type, onAction }) => {
  if (!isOpen) return null;

  const content = {
    vazados: {
      title: "ACESSO VIP VAZADOS",
      subtitle: "O maior acervo do Brasil agora no seu Telegram",
      description: "Esqueça assinaturas individuais. Entre no protocolo Nexus e tenha acesso vitalício a todas as pastas das maiores criadoras.",
      image: "https://putariatelegram.com/wp-content/uploads/2025/04/4967834138816130767_99.jpg",
      benefits: ["Atualizações minuto a minuto", "Conteúdo 4K Ultra HD", "Link Direto Google Drive", "Sem mensalidades"],
      color: "from-violet-600 to-indigo-600",
      accent: "text-violet-400",
      icon: <Lock className="text-white" size={32} />
    },
    telas: {
      title: "PACK TELAS FAKE 7",
      subtitle: "A ferramenta definitiva para criadores e marketing",
      description: "Interfaces idênticas aos maiores bancos e redes sociais do mundo. Edite saldos, nomes e notificações em tempo real.",
      image: "https://i.scdn.co/image/ab67616d0000b273b88d16ec2cfe1950409aeb58",
      benefits: ["Painel de controle interno", "Animações reais de transição", "Suporte a múltiplos bancos", "Atualização gratuita vitalícia"],
      color: "from-cyan-600 to-blue-600",
      accent: "text-cyan-400",
      icon: <Smartphone className="text-white" size={32} />
    }
  };

  const active = content[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={onClose}></div>
      
      <div className="relative bg-zinc-900 border border-white/10 w-full max-w-4xl rounded-[40px] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden animate-zoom-in flex flex-col md:flex-row max-h-[90vh]">
        {/* Lado Esquerdo: Imagem e Impacto */}
        <div className="w-full md:w-[45%] h-64 md:h-auto relative overflow-hidden shrink-0">
          <img src={active.image} alt="" className="w-full h-full object-cover opacity-60 scale-105 group-hover:scale-110 transition-transform duration-1000" />
          <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/40 to-transparent`}></div>
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:justify-center">
            <div className={`w-16 h-16 bg-gradient-to-tr ${active.color} rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-black/50`}>
              {active.icon}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Crown size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Protocolo Elite</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight italic uppercase tracking-tighter">
              {active.title}
            </h2>
          </div>
        </div>

        {/* Lado Direito: Oferta e CTA */}
        <div className="flex-1 flex flex-col p-8 md:p-12 bg-zinc-900 relative overflow-y-auto custom-scrollbar">
          <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>

          <div className="space-y-8">
            <div>
              <p className={`text-sm font-black uppercase tracking-widest ${active.accent} mb-4`}>{active.subtitle}</p>
              <p className="text-gray-400 leading-relaxed">{active.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {active.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className={`p-1 rounded-full ${active.accent} bg-white/5`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-tight">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Acesso Único</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-black italic tracking-tighter text-white`}>R$ {type === 'vazados' ? '29,90' : '39,90'}</span>
                    <span className="text-xs text-gray-600 font-bold uppercase line-through">R$ {type === 'vazados' ? '149,90' : '199,90'}</span>
                  </div>
                </div>
                <div className="bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20 text-green-500 text-[10px] font-black uppercase flex items-center gap-2">
                  <Zap size={14} className="fill-green-500" /> Vaga Garantida
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={onAction}
                  size="lg" 
                  fullWidth 
                  className={`bg-gradient-to-r ${active.color} text-white font-black uppercase italic tracking-widest h-14 shadow-2xl animate-glow-pulse`}
                >
                  <Rocket size={20} className="mr-2" /> Desbloquear Agora
                </Button>
                <div className="flex items-center justify-center gap-4 text-gray-500">
                  <ShieldCheck size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Nexus Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VIPPromoModal;
