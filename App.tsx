
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ShoppingCart, Search, SearchX, X, Trophy, Crown, LogOut, History, User as UserIcon, Settings, Package, Loader2, ChevronDown, MessageCircle, Star, Quote, ChevronLeft, ChevronRight, ExternalLink, WifiOff, Zap, Eye, Ghost, Smartphone, Lock, Unlock, ShieldAlert, Users, CheckCircle2, Gift, Sparkles, Rocket, Plus, Minus, HelpCircle, Timer, FastForward, MessageSquare, Medal, Percent } from 'lucide-react';
import { FAQS, TESTIMONIALS, PRODUCTS as FALLBACK_PRODUCTS } from './constants';
import { User, Product, CartItem, Buyer, Review, Notification } from './types';
import { AuthService } from './services/auth';
import { ProductService } from './services/products';
import { supabase } from './services/supabase';
import Button from './components/Button';
import ChatWidget from './components/ChatWidget';
import AuthModal from './components/AuthModal';
import HistoryModal from './components/HistoryModal';
import CartModal from './components/CartModal';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import PaymentModal from './components/PaymentModal';
import AdminModal from './components/AdminModal';
import PolicyModal from './components/PolicyModal';
import Toast, { ToastType } from './components/Toast';
import NotificationCenter from './components/NotificationCenter';
import RewardInfoModal from './components/RewardInfoModal';
import VIPPromoModal from './components/VIPPromoModal';

const App: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [launchStage, setLaunchStage] = useState<'idle' | 'shaking' | 'takeoff'>('idle');
  const [currentUser, setCurrentUser] = useState<User | null>(AuthService.getCachedUser());
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isRewardInfoOpen, setIsRewardInfoOpen] = useState(false);
  const [isVIPPromoOpen, setIsVIPPromoOpen] = useState(false);
  const [vipPromoType, setVipPromoType] = useState<'vazados' | 'telas'>('vazados');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [policyType, setPolicyType] = useState<'terms' | 'privacy'>('terms');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ranking, setRanking] = useState<Buyer[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const bootstrap = async () => {
    try {
      await Promise.all([
        ProductService.getAll().then(prods => prods && setAllProducts(prods)),
        AuthService.getLeaderboard().then(setRanking)
      ]);
      const user = await AuthService.refreshSession();
      if (user) setCurrentUser(user);
      
      // Inicia sequência de lançamento
      setLaunchStage('shaking');
      setTimeout(() => {
        setLaunchStage('takeoff');
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 1200); // Duração do rocket-launch
      }, 1500); // Tempo vibrando

    } catch (e) {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
    const savedCart = localStorage.getItem('nexus_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) {}
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') bootstrap();
      if (event === 'SIGNED_OUT') setCurrentUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const showToast = (message: string, type: ToastType = 'info') => setToast({ message, type });

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    showToast("Você saiu da conta.", 'info');
  };

  const addToCart = (product: Product, openCart: boolean = false) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const newCart = existing 
        ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { ...product, quantity: 1 }];
      localStorage.setItem('nexus_cart', JSON.stringify(newCart));
      return newCart;
    });
    showToast(`${product.name} no carrinho!`, 'success');
    if (openCart) setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.id !== id);
      localStorage.setItem('nexus_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const newCart = prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item);
      localStorage.setItem('nexus_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentOpen(false);
    setCart([]);
    localStorage.removeItem('nexus_cart');
    showToast("Pagamento confirmado! Verifique seu inventário.", 'success');
    const updated = await AuthService.refreshSession();
    if (updated) setCurrentUser(updated);
  };

  const handleVIPAction = () => {
    const productId = vipPromoType === 'vazados' ? 'v1' : 'tf1';
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      addToCart(product, true);
      setIsVIPPromoOpen(false);
    }
  };

  const filteredProducts = allProducts.filter(p => {
    const s = searchQuery.toLowerCase();
    return (p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s)) && (selectedCategory === 'Todos' || p.category === selectedCategory);
  });

  const categories = ['Todos', ...new Set(allProducts.map(p => p.category))];
  const cartItemCount = cart.reduce((a, b) => a + b.quantity, 0);
  const cartTotal = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 starfield animate-stars-move opacity-30"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className={`relative mb-8 ${launchStage === 'shaking' ? 'animate-shake' : launchStage === 'takeoff' ? 'animate-rocket-launch' : ''}`}>
             <Rocket 
              className={`w-20 h-20 text-violet-500 transform -rotate-45 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)] ${launchStage === 'idle' ? 'animate-bounce' : ''}`} 
             />
             {launchStage !== 'idle' && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4 h-20 bg-gradient-to-t from-transparent via-violet-500/80 to-white/40 blur-md rounded-full animate-pulse"></div>
             )}
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-white font-black uppercase tracking-[0.3em] text-sm animate-pulse">
              {launchStage === 'takeoff' ? 'Lançamento Autorizado' : launchStage === 'shaking' ? 'Preparando Propulsores' : 'Iniciando Sistemas Nexus'}
            </h2>
            <div className="flex gap-1 justify-center">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Glow de fundo que aumenta com o estágio */}
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/20 rounded-full blur-[120px] transition-all duration-1000 ${launchStage === 'takeoff' ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-violet-500/30 overflow-x-hidden animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10 h-16">
        <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-violet-600/20">N</div>
            <span className="text-xl font-bold tracking-tighter uppercase hidden sm:block">NEXUS STORE</span>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="text" placeholder="Buscar produtos..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-violet-500/50 outline-none" />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationCenter notifications={notifications} onMarkAsRead={() => {}} onMarkAllAsRead={() => {}} onDelete={() => {}} />
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-all">
              <ShoppingCart size={22} />
              {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-violet-600 text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border border-black">{cartItemCount}</span>}
            </button>
            {currentUser ? (
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                  <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full border border-white/10 shadow-lg" />
                  <span className="text-sm font-bold hidden lg:block">{currentUser.name.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-zoom-in">
                    <button onClick={() => { setIsHistoryOpen(true); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <History size={18} /> Meus Pedidos
                    </button>
                    {currentUser.role === 'admin' && (
                      <button onClick={() => { setIsAdminOpen(true); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-yellow-500 hover:bg-yellow-500/10 transition-colors">
                        <ShieldCheck size={18} /> Painel Admin
                      </button>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut size={18} /> Sair da Conta
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setIsAuthOpen(true)}>Entrar</Button>
            )}
          </div>
        </div>
      </nav>

      <header className="relative pt-32 pb-16 sm:pt-48 sm:pb-24 text-center container mx-auto px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] -z-10"></div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter italic max-w-4xl mx-auto leading-tight">
          Pare de pagar caro e evite golpe. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-violet-500 to-cyan-400">
            Aqui você compra digital que funciona.
          </span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg italic px-4 font-medium">
          A Nexus é a maior referência em produtos digitais do Brasil. <br className="hidden sm:block" />
          Entrega automática, suporte 24h e a garantia de quem é Elite.
        </p>
      </header>

      {/* Seção Destaques Premium com Imagens de Fundo Atualizadas */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Card Vazados +18 com Imagem Customizada */}
            <div 
              onClick={() => { setVipPromoType('vazados'); setIsVIPPromoOpen(true); }}
              className="group relative h-64 sm:h-80 rounded-[40px] overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-2xl border border-white/5"
            >
              <div className="absolute inset-0">
                <img src="https://putariatelegram.com/wp-content/uploads/2025/04/4967834138816130767_99.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
              </div>
              <div className="relative z-10 h-full p-8 flex flex-col justify-center max-w-md">
                <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-violet-600/40">
                  <Lock className="text-white group-hover:animate-pulse" size={24} />
                </div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Vazados +18</h3>
                <p className="text-gray-300 text-sm font-medium mb-6 leading-relaxed">Acesso vitalício aos canais mais restritos do Telegram. Conteúdo 4K atualizado minuto a minuto.</p>
                <div className="flex items-center gap-3 text-xs font-black text-violet-400 uppercase tracking-widest">
                  Acessar Grupo <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card Telas Fake 7 com Imagem Customizada */}
            <div 
              onClick={() => { setVipPromoType('telas'); setIsVIPPromoOpen(true); }}
              className="group relative h-64 sm:h-80 rounded-[40px] overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-2xl border border-white/5"
            >
              <div className="absolute inset-0">
                <img src="https://i.scdn.co/image/ab67616d0000b273b88d16ec2cfe1950409aeb58" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
              </div>
              <div className="relative z-10 h-full p-8 flex flex-col justify-center max-w-md">
                <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-cyan-600/40">
                  <Smartphone className="text-white group-hover:animate-bounce" size={24} />
                </div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Telas Fake 7</h3>
                <p className="text-gray-300 text-sm font-medium mb-6 leading-relaxed">Interfaces bancárias e sociais idênticas. Qualidade inigualável para vídeos e demonstrações.</p>
                <div className="flex items-center gap-3 text-xs font-black text-cyan-400 uppercase tracking-widest">
                  Ver Modelos <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-zinc-950/50 border-y border-white/5" id="products">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Catálogo Elite</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(c => (
                <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategory === c ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/40' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} onOpenDetails={setSelectedProduct} />
            ))}
          </div>
        </div>
      </section>

      {/* Hall da Fama */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 relative">
             <Trophy className="text-yellow-500 mx-auto mb-4 animate-glow-pulse" size={48} />
             <h2 className="text-4xl font-black text-white italic uppercase mb-2 tracking-tighter">Hall da Fama</h2>
             <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Os investidores de elite do mês.</p>
             <button 
              onClick={() => setIsRewardInfoOpen(true)}
              className="mt-4 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-yellow-500/20 transition-all flex items-center gap-2 mx-auto"
             >
               <Gift size={12} /> Ver Premiações Ativas
             </button>
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            {ranking.map((buyer, idx) => (
              <div 
                key={buyer.id} 
                className={`group relative flex items-center justify-between p-5 rounded-2xl transition-all duration-300 border ${
                  idx === 0 
                  ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.2)]' 
                  : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Coroa Flutuante para o TOP 1 */}
                {idx === 0 && (
                  <div className="absolute -top-7 -left-5 -rotate-12 animate-bounce z-10">
                    <Crown size={36} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,1)]" />
                  </div>
                )}

                <div className="flex items-center gap-5">
                  <div className="relative">
                    <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-black italic text-lg ${
                      idx === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 
                      idx === 1 ? 'bg-zinc-300 text-black' :
                      idx === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-gray-400'
                    }`}>
                      {idx + 1}
                    </span>
                  </div>
                  <div className="relative">
                    <img src={buyer.avatar} className="w-12 h-12 rounded-full border-2 border-white/10 group-hover:scale-110 transition-transform" alt="" />
                    {idx === 0 && (
                      <div className="absolute -inset-1 rounded-full border-2 border-yellow-500/50 animate-ping pointer-events-none"></div>
                    )}
                  </div>
                  <div>
                    <span className={`font-black uppercase tracking-tight ${idx === 0 ? 'text-white text-lg' : 'text-gray-300'}`}>{buyer.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                         {idx === 0 ? <Crown size={10} className="text-yellow-500" /> : <Medal size={10} className="text-gray-600" />}
                         Nexus Elite
                      </p>
                      {idx === 0 && (
                        <span className="bg-yellow-500/20 text-yellow-500 text-[8px] font-black px-1.5 py-0.5 rounded border border-yellow-500/20 animate-pulse uppercase">
                          Bônus Ativo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-black italic block ${idx === 0 ? 'text-yellow-500 text-xl' : 'text-violet-400 text-lg'}`}>R$ {buyer.spent.toFixed(2)}</span>
                  <p className="text-[8px] text-gray-600 font-bold uppercase">Total Acumulado</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voz da Elite (Feedbacks) com Estética do Ranking */}
      <section className="py-24 bg-zinc-950 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <MessageSquare className="text-violet-500 mx-auto mb-4" size={40} />
            <h2 className="text-3xl font-black text-white uppercase italic mb-2 tracking-tighter">Voz da Elite</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Nossa autoridade é construída por quem compra.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div key={t.id} className="group p-8 bg-zinc-900 border border-white/5 rounded-[40px] relative hover:border-violet-500/30 transition-all duration-500 shadow-2xl flex flex-col h-full">
                <Quote className="absolute top-6 right-8 text-violet-500/10 group-hover:text-violet-500/20 transition-colors" size={48} />
                
                <div className="flex items-center gap-1 mb-6">
                   {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />)}
                </div>

                <p className="text-gray-300 italic text-base mb-10 leading-relaxed font-medium flex-1">"{t.text}"</p>
                
                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={t.avatar} 
                        className={`w-14 h-14 rounded-2xl border-2 shadow-lg group-hover:rotate-6 transition-transform ${
                          idx === 0 ? 'border-yellow-500/30' : 'border-white/5'
                        }`} 
                        alt={t.author} 
                      />
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-zinc-900">
                        <CheckCircle2 size={10} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-black uppercase text-sm tracking-tight">{t.author}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                         {idx === 0 ? <Crown size={12} className="text-yellow-500" /> : <Medal size={12} className="text-violet-400" />}
                         <p className={`text-[9px] font-black uppercase tracking-widest ${idx === 0 ? 'text-yellow-500' : 'text-violet-400'}`}>
                           {t.role}
                         </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-2xl ${idx === 0 ? 'bg-yellow-500/10' : 'bg-white/5'}`}>
                    {idx === 0 ? (
                      <Trophy size={20} className="text-yellow-500 animate-pulse" />
                    ) : (
                      <Medal size={20} className="text-zinc-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <HelpCircle className="text-zinc-500 mx-auto mb-4" size={40} />
            <h2 className="text-3xl font-black text-white uppercase italic mb-2 tracking-tighter">Dúvidas Frequentes</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">O protocolo Nexus é transparente.</p>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-zinc-900 border border-white/5 rounded-3xl p-8 hover:bg-zinc-800/50 transition-colors group">
                <h4 className="text-white font-bold mb-3 flex items-center gap-3">
                   <div className="w-2 h-2 bg-violet-500 rounded-full group-hover:scale-150 transition-transform"></div>
                   {faq.question}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed pl-5 border-l border-white/10">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ChatWidget products={allProducts} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={(u) => { setCurrentUser(u); bootstrap(); }} />
      {currentUser && <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} user={currentUser} onUserUpdate={setCurrentUser} />}
      {currentUser && <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} user={currentUser} cart={cart} total={cartTotal} onPaymentSuccess={handlePaymentSuccess} />}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onRemove={removeFromCart} onUpdateQuantity={updateQuantity} onCheckout={() => currentUser ? setIsPaymentOpen(true) : setIsAuthOpen(true)} />
      {selectedProduct && <ProductDetailsModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} onBuyNow={(p) => addToCart(p, true)} />}
      <PolicyModal isOpen={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} type={policyType} />
      <RewardInfoModal isOpen={isRewardInfoOpen} onClose={() => setIsRewardInfoOpen(false)} currentMonth={currentMonthName} />
      <VIPPromoModal isOpen={isVIPPromoOpen} onClose={() => setIsVIPPromoOpen(false)} type={vipPromoType} onAction={handleVIPAction} />
      {currentUser?.role === 'admin' && <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} products={allProducts} onRefresh={bootstrap} onToast={showToast} currentUser={currentUser} onUserUpdate={setCurrentUser} />}

      <footer className="py-16 border-t border-white/5 text-center bg-black">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">N</div>
            <span className="font-bold uppercase tracking-tighter">NEXUS STORE</span>
          </div>
          <p className="text-gray-600 text-[10px] uppercase font-black tracking-[0.2em]">© 2024 Nexus Store Digital • Protocolo de Entrega Automática Ativo</p>
          <div className="flex gap-6 text-[10px] text-gray-500 font-black uppercase tracking-widest">
             <button onClick={() => { setPolicyType('terms'); setIsPolicyOpen(true); }} className="hover:text-white transition-colors">Termos</button>
             <button onClick={() => { setPolicyType('privacy'); setIsPolicyOpen(true); }} className="hover:text-white transition-colors">Privacidade</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
