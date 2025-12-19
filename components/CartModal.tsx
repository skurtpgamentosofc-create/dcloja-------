import React from 'react';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Wallet } from 'lucide-react';
import { CartItem } from '../types';
import Button from './Button';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ 
  isOpen, 
  onClose, 
  cart, 
  onRemove, 
  onUpdateQuantity,
  onCheckout 
}) => {
  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      ></div>
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-zinc-900 border-l border-white/10 h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
             <div className="bg-violet-500/10 p-2 rounded-lg">
                <ShoppingCart className="text-violet-400" size={20} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Seu Carrinho</h2>
                <p className="text-gray-400 text-sm">{cart.length} itens adicionados</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                <ShoppingCart size={64} className="mb-4" />
                <p className="text-lg font-medium">Seu carrinho está vazio</p>
                <p className="text-sm">Adicione produtos para começar.</p>
             </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex gap-4 group hover:border-violet-500/30 transition-colors">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-white/5">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-1">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="font-bold text-violet-300">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => onRemove(item.id)}
                    className="text-gray-600 hover:text-red-400 self-start transition-colors p-1"
                    title="Remover item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 bg-zinc-950 border-t border-white/10 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Taxas</span>
                <span className="text-green-400">Grátis</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/5">
                <span>Total</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={onCheckout} className="group">
              <span className="mr-2">Finalizar Compra</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
              <Wallet size={12} />
              Pagamento seguro e entrega imediata
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;