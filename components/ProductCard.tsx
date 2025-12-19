
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, ShoppingCart, Check, Star, MessageCircle, Trophy, Sparkles, Flame, Zap } from 'lucide-react';
import { Product } from '../types';
import Button from './Button';
import LazyImage from './LazyImage';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onOpenDetails }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdded) return;
    setIsAdded(true);
    onAddToCart(product);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div 
      ref={cardRef}
      onClick={() => onOpenDetails(product)}
      className={`group relative bg-zinc-900 border border-white/5 rounded-[32px] overflow-hidden hover:border-violet-500/40 transition-all duration-500 flex flex-col cursor-pointer w-full shadow-2xl ${
        isVisible ? 'animate-slide-in-up opacity-100' : 'opacity-0 translate-y-4'
      } ${product.isPopular ? 'ring-1 ring-yellow-500/20 shadow-yellow-500/5' : ''}`}
    >
      {/* Glow Effect on Hover */}
      <div className={`absolute -inset-0.5 rounded-[32px] opacity-0 group-hover:opacity-20 blur transition duration-500 ${
        product.isPopular ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-violet-600 to-cyan-500'
      }`}></div>

      {/* Image Container */}
      <div className="relative h-56 sm:h-64 overflow-hidden bg-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent z-10"></div>
        
        <LazyImage 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full group-hover:scale-110 transition-transform duration-1000 ease-out"
        />
        
        {/* Floating Category Tag */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/60 backdrop-blur-md text-white text-[9px] uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
            {product.category}
          </div>
        </div>

        {/* Popular Badge / Trophy */}
        {product.isPopular && (
          <div className="absolute top-4 right-4 z-20">
            <div className="relative bg-yellow-500 text-black text-[9px] font-black px-3 py-1.5 rounded-full border border-white/20 shadow-xl flex items-center gap-1.5 uppercase italic animate-pulse">
              <Trophy size={12} className="fill-black shrink-0" />
              <span>Best Seller</span>
            </div>
          </div>
        )}

        {/* Stats Overlay */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-violet-600 text-white text-[9px] font-black px-2 py-1 rounded-lg border border-white/10 shadow-lg">
            <MessageCircle size={10} /> {product.reviewCount || 0}
          </div>
          <div className="flex items-center gap-1 bg-white text-black text-[9px] font-black px-2 py-1 rounded-lg border border-black/10 shadow-lg">
            <Star size={10} className="fill-black" /> {product.rating?.toFixed(1) || '5.0'}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 flex-1 flex flex-col relative z-10 bg-zinc-900">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-xl font-black text-white group-hover:text-violet-400 transition-colors duration-300 truncate italic uppercase">
            {product.name}
          </h3>
          {product.isPopular && (
            <div className="bg-yellow-500/10 p-1.5 rounded-lg border border-yellow-500/20">
              <Star size={14} className="text-yellow-500 fill-yellow-500 animate-glow-pulse" />
            </div>
          )}
        </div>
        
        <p className="text-gray-500 text-xs mb-6 flex-1 line-clamp-2 leading-relaxed h-[3rem]">
          {product.description}
        </p>
        
        <div className="space-y-2 mb-8">
          {product.features.slice(0, 2).map((feature, idx) => (
            <div key={idx} className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-tight">
              {product.isPopular ? <Flame size={12} className="text-yellow-500 mr-2 shrink-0" /> : <Sparkles size={12} className="text-violet-500 mr-2 shrink-0" />}
              <span className="truncate">{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-1">
              {product.isPopular && <Zap size={8} className="text-yellow-500 fill-yellow-500" />}
              Valor Nexus
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-violet-400">R$</span>
              <span className={`text-2xl font-black italic tracking-tighter ${product.isPopular ? 'text-yellow-500' : 'text-white'}`}>
                {product.price.toFixed(2)}
              </span>
            </div>
          </div>
          
          <Button 
            size="md" 
            onClick={handleAddToCart}
            className={`transition-all duration-300 rounded-2xl w-14 h-12 shrink-0 ${
              isAdded 
                ? 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/40' 
                : product.isPopular 
                  ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-900/20'
                  : 'shadow-lg shadow-violet-900/20'
            }`}
          >
            {isAdded ? <Check size={20} /> : <ShoppingCart size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
