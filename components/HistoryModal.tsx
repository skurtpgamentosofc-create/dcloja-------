
import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Calendar, CheckCircle, Clock, User, Mail, Gamepad2, Star, MessageSquare, Loader2, Camera, Save, RefreshCw } from 'lucide-react';
import { User as UserType, Review } from '../types';
import { ProductService } from '../services/products';
import { AuthService } from '../services/auth';
import Button from './Button';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUserUpdate: (user: UserType) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, user, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'profile'>('history');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit Profile States
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Update edit fields when user prop changes (e.g. after a refresh)
  useEffect(() => {
    setEditName(user.name);
    setEditAvatar(user.avatar);
  }, [user]);

  if (!isOpen) return null;

  const handleReview = async (purchase: any) => {
    setIsSubmitting(true);
    try {
      await ProductService.submitReview({
        productId: purchase.productId || purchase.id,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        rating,
        comment
      });
      setReviewingId(null);
      setComment('');
      setRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setIsSavingProfile(true);
    try {
      const updatedUser = await AuthService.updateProfile(user.id, {
        name: editName,
        avatar: editAvatar
      });
      if (updatedUser) {
        onUserUpdate(updatedUser);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const totalSpent = user.history.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      
      <div className="relative bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col animate-zoom-in h-[600px] overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-violet-500/30 bg-zinc-800">
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded border border-violet-500/20">{user.role === 'admin' ? 'Administrador' : 'Membro'}</span>
                  {user.discordId && (
                    <span className="flex items-center gap-1">
                      <Gamepad2 size={12} />
                      {user.discordId}
                    </span>
                  )}
                </div>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-white/5 bg-zinc-900/50">
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history' 
                ? 'border-violet-500 text-white bg-white/5' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Histórico de Compras
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'profile' 
                ? 'border-violet-500 text-white bg-white/5' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Editar Perfil
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-zinc-900">
          {activeTab === 'history' && (
            <div className="space-y-4">
              {user.history.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 pt-20">
                    <ShoppingBag size={64} className="mb-4" />
                    <p>Nenhuma compra realizada ainda.</p>
                 </div>
              ) : (
                user.history.map((purchase) => (
                  <div key={purchase.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-4 hover:border-violet-500/20 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${purchase.status === 'Concluído' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                           {purchase.status === 'Concluído' ? <CheckCircle size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{purchase.productName}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Calendar size={12} />
                            {new Date(purchase.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">R$ {purchase.price.toFixed(2)}</div>
                        {purchase.status === 'Concluído' && !reviewingId && (
                          <button 
                            onClick={() => setReviewingId(purchase.id)}
                            className="text-[10px] text-violet-400 font-bold uppercase tracking-wider hover:text-violet-300 transition-colors mt-1"
                          >
                            Avaliar Produto
                          </button>
                        )}
                      </div>
                    </div>

                    {reviewingId === purchase.id && (
                      <div className="bg-white/5 border border-violet-500/30 rounded-lg p-4 animate-fade-in">
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-xs font-bold text-white uppercase tracking-widest">Sua Avaliação</span>
                           <div className="flex gap-1">
                             {[1,2,3,4,5].map(s => (
                               <Star 
                                 key={s} 
                                 size={16} 
                                 className={`cursor-pointer transition-colors ${s <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`}
                                 onClick={() => setRating(s)}
                               />
                             ))}
                           </div>
                        </div>
                        <textarea 
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          placeholder="O que achou do produto? Seu feedback ajuda outros gamers."
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-violet-500 outline-none h-20 resize-none mb-3"
                        />
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setReviewingId(null)}
                            className="text-xs text-gray-500 hover:text-white px-3 py-1.5"
                          >
                            Cancelar
                          </button>
                          <button 
                            disabled={isSubmitting || !comment.trim()}
                            onClick={() => handleReview(purchase)}
                            className="bg-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-violet-500 disabled:opacity-30 flex items-center gap-2"
                          >
                            {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                            Enviar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col items-center gap-4 mb-8">
                 <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-violet-600/30 bg-zinc-800 shadow-xl">
                      <img src={editAvatar} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none">
                       <Camera size={24} className="text-white" />
                    </div>
                 </div>
                 <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Avatar Preview</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nome de Exibição</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-violet-500 transition-all"
                      placeholder="Como você quer ser chamado?"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">URL da Imagem de Avatar</label>
                  <div className="relative">
                    <Camera size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      value={editAvatar}
                      onChange={e => setEditAvatar(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-violet-500 transition-all font-mono text-xs"
                      placeholder="https://link-da-sua-imagem.png"
                    />
                  </div>
                  <p className="text-[9px] text-gray-600 px-1">Dica: Use links do Imgur, Discord ou DiceBear.</p>
                </div>

                <div className="pt-4">
                  <Button 
                    fullWidth 
                    disabled={isSavingProfile || (editName === user.name && editAvatar === user.avatar)}
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2"
                  >
                    {isSavingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Salvar Alterações
                  </Button>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 mt-8">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-tight">
                  <RefreshCw size={16} className="text-violet-400" /> Resumo da Conta
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-center">
                    <div className="text-xl font-black text-white">{user.history.length}</div>
                    <div className="text-[9px] text-gray-500 uppercase font-bold">Pedidos</div>
                  </div>
                  <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-center">
                    <div className="text-xl font-black text-green-400">R$ {totalSpent.toFixed(2)}</div>
                    <div className="text-[9px] text-gray-500 uppercase font-bold">Investido</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-500 bg-black/20 p-2 rounded border border-white/5">
                   <Mail size={12} /> {user.email}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
