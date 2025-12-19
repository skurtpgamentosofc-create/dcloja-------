
import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Package, Loader2, ShieldCheck, RefreshCw, Check, Ban, Lock, Edit3, Save, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Product, User } from '../types';
import { ProductService } from '../services/products';
import { AuthService } from '../services/auth';
import Button from './Button';
import { ToastType } from './Toast';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefresh: () => void;
  onToast: (message: string, type: ToastType) => void;
  currentUser: User | null;
  onUserUpdate: (user: User) => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, products, onRefresh, onToast, currentUser, onUserUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [syncingRole, setSyncingRole] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    feature: ''
  });
  const [features, setFeatures] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: '', image: '', feature: '' });
    setFeatures([]);
    setEditingProduct(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isUUID = (uuid: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
  };

  // Função para comprimir a imagem antes do envio
  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Reduz a qualidade para 70% para economizar banda
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price).replace('.', ','),
      category: product.category,
      image: product.image,
      feature: ''
    });
    setFeatures(product.features);
    const formElement = document.getElementById('admin-form-container');
    formElement?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = currentUser?.role === 'admin';

  const handleSyncRole = async () => {
    setSyncingRole(true);
    try {
      const updatedUser = await AuthService.refreshSession();
      if (updatedUser) {
        onUserUpdate(updatedUser);
        onToast(`Sessão sincronizada! Cargo: ${updatedUser.role}`, updatedUser.role === 'admin' ? "success" : "info");
      }
    } catch (err) {
      onToast("Falha ao sincronizar cargo.", "error");
    } finally {
      setSyncingRole(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limite de 5MB antes da compressão
    if (file.size > 5 * 1024 * 1024) {
      onToast("Arquivo original muito grande (Max 5MB).", "error");
      return;
    }

    const reader = new FileReader();
    setCompressing(true);
    
    reader.onloadend = async () => {
      try {
        const compressed = await compressImage(reader.result as string);
        setFormData(prev => ({ ...prev, image: compressed }));
        onToast("Imagem otimizada com sucesso!", "success");
      } catch (err) {
        onToast("Erro ao otimizar imagem.", "error");
      } finally {
        setCompressing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addFeature = () => {
    if (formData.feature.trim()) {
      setFeatures([...features, formData.feature.trim()]);
      setFormData(prev => ({ ...prev, feature: '' }));
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      onToast("Você não tem permissão de administrador.", "error");
      return;
    }

    setLoading(true);
    try {
      const priceString = String(formData.price).replace(',', '.');
      
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: priceString,
        category: formData.category,
        image: formData.image,
        features: features
      };

      let result;
      if (editingProduct && isUUID(editingProduct.id)) {
        result = await ProductService.update(editingProduct.id, payload, editingProduct);
      } else {
        result = await ProductService.create(payload);
      }

      if (result.success) {
        onToast(editingProduct ? "Produto atualizado!" : "Produto criado!", "success");
        await onRefresh();
        resetForm();
      } else {
        onToast(`Erro: ${result.error}`, "error");
      }
    } catch (err: any) {
      onToast("Erro de rede. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async (id: string) => {
    if (!isUUID(id)) {
      onToast("Item padrão não pode ser deletado.", "error");
      setConfirmDeleteId(null);
      return;
    }

    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      const result = await ProductService.delete(id);
      if (result.success) {
        onToast(`Removido.`, "success");
        await onRefresh(); 
      } else {
        onToast(`Erro: ${result.error}`, "error");
      }
    } catch (err) {
      onToast("Falha na conexão.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
      
      <div className="relative bg-zinc-900 border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col animate-zoom-in max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="text-violet-400" /> Gerenciar Loja
            </h2>
            <div className="flex items-center gap-3 mt-1">
               <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${isAdmin ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                 <ShieldCheck size={10} /> {currentUser?.role || 'user'}
               </div>
               <button 
                onClick={handleSyncRole} 
                disabled={syncingRole}
                className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1 uppercase font-bold transition-colors disabled:opacity-30"
               >
                 {syncingRole ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                 Sincronizar
               </button>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-8 custom-scrollbar bg-zinc-900/50" id="admin-form-container">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                {editingProduct ? <Edit3 size={14} className="text-yellow-500" /> : <Plus size={14} className="text-violet-500" />}
                {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
              </h3>
              {editingProduct && (
                <button onClick={resetForm} className="text-[10px] text-gray-500 hover:text-white uppercase font-bold">Cancelar</button>
              )}
            </div>

            <form onSubmit={handleSubmit} className={`space-y-4 p-4 rounded-2xl transition-all ${editingProduct ? 'border border-yellow-500/30 bg-yellow-500/5' : ''} ${!isAdmin ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Título</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-violet-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Valor (R$)</label>
                  <input 
                    required 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-violet-500 outline-none transition-all"
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Categoria</label>
                  <input 
                    required
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-violet-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Foto do Produto</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      readOnly
                      value={compressing ? "Otimizando..." : (formData.image ? "Imagem Carregada ✔" : "Selecione uma imagem")}
                      className={`w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-[10px] font-mono ${compressing ? 'text-yellow-500 animate-pulse' : 'text-white'}`}
                    />
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || compressing}
                    className="bg-violet-600/10 border border-violet-500/20 p-3 rounded-lg hover:bg-violet-600/20 text-violet-400 transition-all disabled:opacity-30"
                  >
                    {compressing ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                  </button>
                </div>
                {formData.image && (
                  <div className="mt-2 relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/20">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Descrição</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-violet-500 outline-none h-20 resize-none transition-all text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Vantagens (Dê enter para adicionar)</label>
                <div className="flex gap-2">
                  <input 
                    value={formData.feature}
                    onChange={e => setFormData({...formData, feature: e.target.value})}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none"
                    placeholder="Ex: Entrega Instantânea"
                  />
                  <button type="button" onClick={addFeature} className="bg-violet-600 p-3 rounded-lg"><Plus size={20} /></button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {features.map((f, i) => (
                    <span key={i} className="bg-violet-500/10 text-violet-300 px-2 py-1 rounded-md text-[10px] flex items-center gap-1 border border-violet-500/20">
                      {f} <X size={10} className="cursor-pointer" onClick={() => removeFeature(i)} />
                    </span>
                  ))}
                </div>
              </div>

              <Button type="submit" fullWidth disabled={loading || compressing}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : (editingProduct ? 'Salvar Alterações' : 'Cadastrar')}
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
              Catálogo ({products.length})
            </h3>
            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className={`bg-black/40 border p-3 rounded-xl flex items-center justify-between group transition-all ${editingProduct?.id === p.id ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-zinc-800" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-500">R$ {p.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {confirmDeleteId === p.id ? (
                      <>
                        <button onClick={() => executeDelete(p.id)} className="text-green-500 p-2"><Check size={18} /></button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-gray-500 p-2"><Ban size={18} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(p)} className="text-gray-500 hover:text-yellow-500 p-2"><Edit3 size={18} /></button>
                        {isUUID(p.id) && (
                          <button onClick={() => setConfirmDeleteId(p.id)} className="text-gray-500 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-yellow-500 animate-pulse" />
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Otimização de Imagens Ativa • Payload Seguro</p>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
