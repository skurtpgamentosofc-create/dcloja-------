
import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderClassName?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  placeholderClassName = '',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Resetar estado e verificar se a imagem já está no cache
  useEffect(() => {
    setIsLoaded(false);
    setError(false);

    // Se a imagem já estiver completa (comum em localhost/cache/base64)
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton / Placeholder - Visível enquanto não carrega */}
      {(!isLoaded && !error) && (
        <div className={`absolute inset-0 bg-zinc-800 animate-pulse ${placeholderClassName}`} />
      )}
      
      {/* Fallback para erro */}
      {error && (
        <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center text-zinc-700 p-4 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest">Erro de Mídia</span>
        </div>
      )}

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="eager" // Mudado para eager para garantir prioridade no catálogo
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
