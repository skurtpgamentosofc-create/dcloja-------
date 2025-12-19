
import React, { useState } from 'react';
import { X as XIcon, Mail as MailIcon, Lock as LockIcon, User as UserIconLucide, Loader2 as Loader2Icon, Gamepad2 as GamepadIcon, FileText as FileTextIcon, Smartphone as SmartphoneIcon, RefreshCw } from 'lucide-react';
import Button from './Button';
import { AuthService } from '../services/auth';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    document: '',
    phone: '',
    discordId: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let user;
      if (isLogin) {
        user = await AuthService.login(formData.email, formData.password);
      } else {
        if (!formData.name) throw new Error('Nome é obrigatório');
        if (formData.password.length < 6) throw new Error('A senha deve ter no mínimo 6 caracteres');
        if (!formData.document) throw new Error('CPF é obrigatório para pagamentos');
        
        user = await AuthService.register(
          formData.name, 
          formData.email,
          formData.password,
          formData.document, 
          formData.discordId
        );
      }
      
      if (user) {
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      
      <div className="relative bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-zoom-in">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <XIcon size={20} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white mb-2 uppercase italic italic">
            {isLogin ? 'Bem-vindo de volta' : 'Elite Nexus Store'}
          </h2>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">
            {isLogin 
              ? 'Acesse seu inventário digital' 
              : 'Crie sua conta para começar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative">
                  <UserIconLucide size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">CPF</label>
                  <div className="relative">
                    <FileTextIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input 
                      type="text" 
                      value={formData.document}
                      onChange={e => setFormData({...formData, document: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-violet-500 transition-colors text-xs"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Discord ID</label>
                  <div className="relative">
                    <GamepadIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input 
                      type="text" 
                      value={formData.discordId}
                      onChange={e => setFormData({...formData, discordId: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-violet-500 transition-colors text-xs"
                      placeholder="seu_user"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <MailIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Senha</label>
            <div className="relative">
              <LockIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input 
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                placeholder="Min. 6 caracteres"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-[10px] font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center flex flex-col items-center gap-2">
              {error}
              {error.includes("demorou") && (
                 <button type="button" onClick={() => window.location.reload()} className="text-white bg-red-500/20 px-3 py-1 rounded flex items-center gap-1 hover:bg-red-500/40 transition-colors">
                   <RefreshCw size={10} /> Recarregar Site
                 </button>
              )}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading} className="mt-4 h-12 text-sm font-black uppercase tracking-widest italic">
            {loading ? <Loader2Icon className="animate-spin" size={18} /> : (isLogin ? 'Entrar Agora' : 'Finalizar')}
          </Button>
        </form>

        <div className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-gray-600">
          {isLogin ? 'Ainda não é membro? ' : 'Já faz parte da elite? '}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-violet-400 hover:text-white transition-colors"
          >
            {isLogin ? 'Criar Conta' : 'Fazer Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
