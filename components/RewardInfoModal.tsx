
import React from 'react';
import { X, Trophy, Gift, Star, Zap, Calendar, ShieldCheck, Percent, Sparkles } from 'lucide-react';
import Button from './Button';

interface RewardInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string;
}

const RewardInfoModal: React.FC<RewardInfoModalProps> = ({ isOpen, onClose, currentMonth }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
      
      <div className="relative bg-zinc-900 border border-yellow-500/30 w-full max-w-lg rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.1)] overflow-hidden animate-zoom-in">
        <div className="bg-gradient-to-br from-yellow-600/20 to-black p-8 text-center border-b border-white/5">
          <div className="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20 rotate-3">
            <Trophy className="text-black" size={40} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Prêmios de {currentMonth}</h2>
          <p className="text-yellow-500/70 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Temporada de Elite</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
                <Sparkles size={40} className="text-yellow-500" />
              </div>
              <div className="bg-yellow-500/20 p-2 rounded-xl text-yellow-500 shrink-0">
                <Trophy size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                  1º Lugar: BÔNUS MASTER
                </h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  <span className="text-yellow-500 font-bold">R$ 100,00 em saldo</span> + 1x Nitro Gift + <span className="text-white font-bold">10% CASHBACK</span> em todas as compras do mês seguinte.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 opacity-80">
              <div className="bg-zinc-400/20 p-2 rounded-xl text-zinc-400 shrink-0">
                <Star size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">2º e 3º Lugar: Os Elites</h4>
                <p className="text-xs text-gray-400 mt-1">R$ 30,00 em saldo na loja + Cupom de 20% OFF em qualquer produto.</p>
              </div>
            </div>

            <div className="bg-violet-600/10 border border-violet-500/20 p-4 rounded-2xl flex items-center gap-4">
              <div className="bg-violet-500/20 p-2 rounded-xl text-violet-400 shrink-0">
                <Percent size={20} />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Bônus de Fidelidade</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">O Top Comprador recebe cashback real em créditos na loja.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center p-3 bg-black/40 rounded-2xl border border-white/5">
              <Calendar className="mx-auto mb-2 text-violet-400" size={18} />
              <p className="text-[9px] text-gray-500 font-bold uppercase">Fechamento</p>
              <p className="text-xs text-white font-black">Último dia do mês</p>
            </div>
            <div className="text-center p-3 bg-black/40 rounded-2xl border border-white/5">
              <ShieldCheck className="mx-auto mb-2 text-green-400" size={18} />
              <p className="text-[9px] text-gray-500 font-bold uppercase">Entrega</p>
              <p className="text-xs text-white font-black">Automática</p>
            </div>
          </div>

          <Button onClick={onClose} fullWidth size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase italic tracking-widest mt-4 shadow-lg shadow-yellow-500/20">
            Quero esse bônus agora!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RewardInfoModal;
