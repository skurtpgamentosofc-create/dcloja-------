
import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Star, CheckCircle2, MessageSquare, Loader2, Award, Zap, ShieldCheck } from 'lucide-react';
import { Product, Review } from '../types';
import { ProductService } from '../services/products';
import Button from './Button';

interface ProductDetailsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, isOpen, onClose, onAddToCart, onBuyNow }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      ProductService.getProductReviews(product.id)
        .then(setReviews)
        .finally(() => setLoading(false));
    }
  }, [isOpen, product.id]);

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product);
    } else {
      onAddToCart(product);
    }
    onClose();
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    // Para manter a consistência com o "comprar agora", fechamos o modal suavemente
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={onClose}></div>
      
      <div className="relative bg-zinc-900 border border-white/10 w-full max-w-5xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row animate-zoom-in max-h-[90vh] overflow-hidden">
        {/* Close Button Mobile Header */}
        <div className="md:hidden absolute top-4 right-4 z-50">
          <button onClick={onClose} className="bg-black/50 backdrop-blur-md p-2 rounded-full text-white border border-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Left Side: Dynamic Visuals */}
        <div className="w-full md:w-[45%] bg-black relative flex flex-col border-r border-white/5">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover opacity-60 md:opacity-100" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>
          
          <div className="absolute bottom-8 left-8 right-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-violet-600/40">
                {product.category}
              </span>
              <span className="bg-zinc-800/80 backdrop-blur-md text-zinc-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                Entrega Flash
              </span>
            </div>
            <h2 className="text-4xl font-black text-white leading-none tracking-tighter uppercase">{product.name}</h2>
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md w-fit p-2 rounded-xl border border-white/5">
               <div className="flex text-yellow-500">
                 {[...Array(5)].map((_, i) => (
                   <Star 
                    key={i} 
                    size={14} 
                    className={i < Math.floor(product.rating || 5) ? 'fill-yellow-500' : 'text-zinc-800'} 
                   />
                 ))}
               </div>
               <span className="text-xs text-white font-bold">
                 {product.rating?.toFixed(1) || '4.9'} <span className="text-zinc-500 font-normal ml-1">({product.reviewCount || 0} reviews)</span>
               </span>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Content */}
        <div className="w-full md:w-[55%] flex flex-col bg-zinc-900 overflow-y-auto custom-scrollbar relative">
          <div className="p-8 pb-32 md:pb-8 space-y-10">
            {/* Action Bar Desktop */}
            <div className="hidden md:flex items-center justify-between gap-6 bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
               <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Preço Especial</span>
                  <div className="text-3xl font-black text-white italic">
                    <span className="text-sm text-violet-500 not-italic mr-1">R$</span>
                    {product.price.toFixed(2)}
                  </div>
               </div>
               <Button size="lg" onClick={handleBuyNow} className="flex-1 shadow-xl shadow-violet-600/20">
                 <ShoppingCart size={20} className="mr-2" /> Comprar Agora
               </Button>
            </div>

            {/* Description */}
            <section className="space-y-4">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={14} className="text-violet-500" /> Descrição Técnica
              </h3>
              <p className="text-zinc-300 leading-relaxed text-sm md:text-base">{product.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                {product.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-zinc-800/40 p-4 rounded-xl border border-white/5 group hover:bg-zinc-800 transition-colors">
                    <div className="bg-violet-500/10 p-1.5 rounded-lg text-violet-400 group-hover:scale-110 transition-transform">
                      <Award size={18} />
                    </div>
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-tight">{f}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="pt-10 border-t border-white/5">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <MessageSquare size={16} className="text-violet-500" /> Avaliações Reais
                 </h3>
                 <div className="flex items-center gap-2 text-[10px] text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                    <ShieldCheck size={12} /> Compra 100% Protegida
                 </div>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="py-20 text-center flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-violet-500" />
                    <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Sincronizando Feedbacks...</span>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="py-10 text-center text-zinc-600 text-sm italic">
                    Nenhuma avaliação recente para este item.
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-violet-500/20 transition-all group">
                      <div className="flex items-center gap-4 mb-4">
                        <img src={rev.userAvatar} className="w-10 h-10 rounded-full border-2 border-zinc-800 group-hover:border-violet-500/40 transition-colors" alt="" />
                        <div className="flex-1">
                          <h4 className="text-xs font-black text-white uppercase tracking-tight">{rev.userName}</h4>
                          <div className="flex gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={10} 
                                className={i < rev.rating ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-800'} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-bold bg-zinc-800 px-2 py-1 rounded">
                          {new Date(rev.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed italic border-l-2 border-violet-500/30 pl-4 py-1">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sticky Mobile Footer Action */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 p-6 bg-zinc-950/90 backdrop-blur-xl border-t border-white/10 z-[100] flex items-center justify-between gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Total</span>
              <span className="text-2xl font-black text-white italic tracking-tighter">
                R$ {product.price.toFixed(2)}
              </span>
            </div>
            <Button size="md" onClick={handleAddToCart} className="flex-1 font-black uppercase tracking-widest h-12">
              Adicionar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
