
import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle2, Loader2, ShieldCheck, Smartphone, QrCode, AlertTriangle, Receipt, CreditCard, ExternalLink } from 'lucide-react';
import { AmploPayService, PaymentResponse } from '../services/amplopay';
import { CartItem, User } from '../types';
import Button from './Button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  cart: CartItem[];
  total: number;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  cart, 
  total,
  onPaymentSuccess
}) => {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [status, setStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initPayment = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await AmploPayService.createPayment(user, cart, total);
          setPaymentData(data);
          setStatus('pending');
        } catch (err: any) {
          setError(err.message || "Erro ao conectar com a AmploPay Gateway.");
        } finally {
          setLoading(false);
        }
      };
      initPayment();
    }
    
    return () => {
      setPaymentData(null);
      setStatus('pending');
      setError(null);
    };
  }, [isOpen, user, cart, total]);

  useEffect(() => {
    if (!isOpen || !paymentData || status === 'paid' || error) return;

    const interval = setInterval(async () => {
      try {
        const newStatus = await AmploPayService.checkStatus(paymentData.id);
        if (newStatus === 'paid') {
          setStatus('paid');
          setTimeout(() => onPaymentSuccess(), 2500);
        }
      } catch (err) {
        console.error("Erro ao verificar status", err);
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, [isOpen, paymentData, status, onPaymentSuccess, error]);

  const handleCopy = () => {
    if (paymentData?.copy_paste) {
      navigator.clipboard.writeText(paymentData.copy_paste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getQrCodeSource = (data: string | null | undefined) => {
    if (!data) return null;
    if (data.startsWith('data:image')) return data;
    return `data:image/png;base64,${data}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
      
      <div className="relative bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-zoom-in flex flex-col max-h-[90vh]">
        {/* Header Premium Nexus */}
        <div className="bg-gradient-to-br from-violet-900 via-indigo-900 to-black p-6 sm:p-8 text-center relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(139,92,246,1),transparent)]"></div>
          </div>
          
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full z-10">
            <X size={20} />
          </button>

          <div className="flex justify-center mb-4 relative">
             <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20 shadow-2xl">
               {/* Fixed responsive size using Tailwind classes instead of non-existent sm:size prop */}
               <ShieldCheck className="text-violet-400 w-7 h-7 sm:w-8 sm:h-8" />
             </div>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">Nexus Checkout</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-violet-200 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">AmploPay Secure Gateway</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="text-center py-10">
              {/* Fixed responsive size using Tailwind classes instead of non-existent sm:size prop */}
              <Loader2 className="animate-spin text-violet-500 mx-auto mb-6 w-12 h-12 sm:w-14 sm:h-14" />
              <p className="text-white font-bold animate-pulse text-xs sm:text-sm uppercase tracking-widest">Sincronizando Gateway...</p>
              <p className="text-gray-500 text-[10px] sm:text-xs mt-2 italic">Gerando chaves de transação...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4 w-full animate-fade-in">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                 {/* Fixed responsive size using Tailwind classes instead of non-existent sm:size prop */}
                 <AlertTriangle className="text-red-500 w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 uppercase tracking-tight">Restrição da Gateway</h3>
              
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 sm:p-5 mb-8 text-left">
                <p className="text-xs sm:text-sm text-red-400 font-bold mb-3">{error}</p>
                <div className="space-y-2 text-[10px] sm:text-xs text-gray-400 leading-relaxed italic">
                    <p>• Verifique se o backend está ativo.</p>
                    <p>• Certifique-se que o CPF e WhatsApp são válidos.</p>
                </div>
              </div>

              <Button onClick={() => window.location.reload()} variant="primary" fullWidth size="lg">
                Tentar Novamente
              </Button>
            </div>
          ) : status === 'paid' ? (
            <div className="text-center py-10 animate-fade-in">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(34,197,94,0.4)]">
                {/* Fixed responsive size using Tailwind classes instead of non-existent sm:size prop */}
                <CheckCircle2 className="text-white w-14 h-14 sm:w-16 sm:h-16" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tighter uppercase italic">Pago com Sucesso!</h3>
              <p className="text-gray-400 text-sm font-medium">Sua conta Nexus está sendo atualizada.</p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center animate-fade-in">
              {/* Pedido Info */}
              <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-3 sm:p-4 mb-6 sm:mb-8 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="bg-violet-500/20 p-2 rounded-xl shrink-0">
                    <Receipt size={18} className="text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-black uppercase tracking-widest">Total</p>
                    <p className="text-lg sm:text-xl font-black text-white italic tracking-tighter truncate">R$ {total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-black uppercase tracking-widest">Metodo</p>
                  <p className="text-[10px] sm:text-xs font-bold text-violet-300">PIX Instantâneo</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl mb-6 sm:mb-8 shadow-[0_20px_60px_rgba(139,92,246,0.15)] relative group overflow-hidden border-4 border-white/10 shrink-0">
                {paymentData?.qr_code_base64 ? (
                  <img 
                    src={getQrCodeSource(paymentData.qr_code_base64) || ''} 
                    alt="QR Code Pix" 
                    className="w-40 h-40 sm:w-52 sm:h-52 object-contain" 
                  />
                ) : (
                  <div className="w-40 h-40 sm:w-52 sm:h-52 flex flex-col items-center justify-center bg-zinc-50 rounded-xl text-zinc-300 text-center px-4">
                    <QrCode size={40} className="mb-2 text-zinc-200" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Escaneamento indisponível</p>
                  </div>
                )}
              </div>

              {/* Copia e Cola */}
              <div className="w-full space-y-2 sm:space-y-3 shrink-0">
                <label className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black px-1 flex justify-between">
                  <span>Código Copia e Cola</span>
                  <span className="text-violet-400 animate-pulse">Pague agora</span>
                </label>
                <div className="flex gap-2">
                  <div 
                    onClick={handleCopy}
                    className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-4 py-3 sm:py-4 relative overflow-hidden group cursor-pointer hover:border-violet-500/50 transition-colors"
                  >
                     <input 
                       readOnly 
                       value={paymentData?.copy_paste} 
                       className="w-full bg-transparent text-[10px] text-gray-300 focus:outline-none font-mono truncate cursor-pointer" 
                     />
                  </div>
                  <Button 
                    onClick={handleCopy} 
                    variant={copied ? "primary" : "outline"}
                    className="rounded-2xl shrink-0 px-4 sm:px-6"
                  >
                    {copied ? <CheckCircle2 size={18} className="text-white" /> : <Copy size={18} />}
                  </Button>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex items-center gap-3 text-sm text-violet-400 bg-violet-400/5 px-6 sm:px-8 py-3 rounded-2xl border border-violet-500/10 shrink-0">
                <Loader2 size={14} className="animate-spin" />
                <span className="font-black text-[9px] sm:text-[10px] uppercase tracking-widest italic">Confirmando...</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer Security Seals */}
        <div className="bg-black/60 p-3 sm:p-4 border-t border-white/5 flex items-center justify-center gap-4 sm:gap-6 shrink-0">
           <div className="flex items-center gap-2 opacity-30">
              <ShieldCheck size={12} className="text-green-500" />
              <span className="text-[7px] sm:text-[8px] text-white font-black uppercase tracking-widest">SSL</span>
           </div>
           <div className="flex items-center gap-2 opacity-30">
              <CreditCard size={12} className="text-violet-400" />
              <span className="text-[7px] sm:text-[8px] text-white font-black uppercase tracking-widest">AMPLOPAY V1</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
