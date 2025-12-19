
import { User, Purchase, Buyer } from "../types";
// Removed non-existent import TOP_BUYERS from constants
import { supabase } from "./supabase";

const SESSION_KEY = 'nexus_session';
const MASTER_ADMIN_EMAIL = 'bieltaionn@gmail.com';

// Timeout reduzido para não travar a UI; o sistema deve falhar rápido ou usar cache
const withTimeout = <T>(promise: PromiseLike<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Conexão lenta. Tentando recuperar dados locais...")), timeoutMs)
    ),
  ]);
};

export const AuthService = {
  // Retorno instantâneo do cache para evitar o "foguete de loading"
  getCachedUser: (): User | null => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const { data: authData, error: authError } = await withTimeout(
        supabase.auth.signInWithPassword({ email: email.trim(), password })
      );
      
      if (authError || !authData.user) throw new Error(authError?.message || "E-mail ou senha incorretos.");

      const userId = authData.user.id;
      const userEmail = authData.user.email?.toLowerCase();
      const isMasterAdmin = userEmail === MASTER_ADMIN_EMAIL.toLowerCase();

      // PARALELISMO: Busca tudo de uma vez só
      const [profileRes, purchasesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('purchases').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      const user: User = {
        id: userId,
        name: profileRes.data?.name || (isMasterAdmin ? 'Admin Nexus' : 'Usuário'),
        email: authData.user.email!,
        role: isMasterAdmin ? 'admin' : (profileRes.data?.role || 'user'),
        document: profileRes.data?.document,
        discordId: profileRes.data?.discord_id,
        avatar: profileRes.data?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        history: (purchasesRes.data || []).map(p => ({
          id: p.id,
          date: p.created_at,
          productName: p.product_name,
          price: p.price,
          status: p.status
        }))
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      throw err;
    }
  },

  register: async (name: string, email: string, password: string, document: string, discordId: string): Promise<User> => {
    try {
      const { data: authData, error: signUpError } = await withTimeout(
        supabase.auth.signUp({ email: email.trim(), password })
      );
      
      if (signUpError) throw new Error(signUpError.message);
      if (!authData.user) throw new Error("Erro ao criar conta.");

      const id = authData.user.id;
      const isMasterAdmin = email.trim().toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();

      // Criação do perfil em background
      await supabase.from('profiles').insert([{ 
        id, 
        name, 
        email: email.trim(), 
        document, 
        discord_id: discordId, 
        role: isMasterAdmin ? 'admin' : 'user', 
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` 
      }]);

      const newUser: User = { 
        id, 
        name, 
        email: email.trim(), 
        role: isMasterAdmin ? 'admin' : 'user', 
        document, 
        discordId, 
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, 
        history: [] 
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      return newUser;
    } catch (err: any) {
      throw err;
    }
  },

  logout: async () => {
    localStorage.removeItem(SESSION_KEY);
    await supabase.auth.signOut().catch(() => {});
  },

  refreshSession: async (): Promise<User | null> => {
    try {
      // Background check: não trava o usuário
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      
      const userId = session.user.id;
      const isMasterAdmin = session.user.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();

      const [profileRes, purchasesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('purchases').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      const user: User = {
        id: userId,
        name: profileRes.data?.name || (isMasterAdmin ? 'Admin Nexus' : 'Usuário'),
        email: session.user.email!,
        role: isMasterAdmin ? 'admin' : (profileRes.data?.role || 'user'),
        document: profileRes.data?.document,
        discordId: profileRes.data?.discord_id,
        avatar: profileRes.data?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        history: (purchasesRes.data || []).map(p => ({ id: p.id, date: p.created_at, productName: p.product_name, price: p.price, status: p.status }))
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch (err) {
      // Se a rede falhar, mantém o cache para o usuário não ser deslogado à força
      return AuthService.getCachedUser();
    }
  },

  // FIX: Adicionado método updateProfile para permitir edição de perfil no HistoryModal e resolver erro de propriedade inexistente
  updateProfile: async (userId: string, updates: { name?: string; avatar?: string }): Promise<User | null> => {
    try {
      const { error } = await withTimeout(
        supabase.from('profiles').update(updates).eq('id', userId)
      );
      if (error) throw error;
      
      // Sincroniza cache local chamando refreshSession após atualização no banco
      return await AuthService.refreshSession();
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err);
      throw err;
    }
  },

  getLeaderboard: async (): Promise<Buyer[]> => {
    try {
      // Implementação otimizada do ranking com teto realista de R$ 300
      const now = new Date();
      const seed = now.getFullYear() * 100 + now.getMonth();
      const day = now.getDate();
      
      const bots = [
        { name: 'GhostKiller_99', base: 55, growth: 7.8 },
        { name: 'ViperMain', base: 48, growth: 6.5 },
        { name: 'Nexus_Enjoyer', base: 42, growth: 5.8 },
        { name: 'ShadowZ', base: 36, growth: 4.2 },
        { name: 'Luiza_Gamer', base: 31, growth: 3.5 }
      ].map((b, i) => ({
        id: `bot_${i}`,
        name: b.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${b.name}`,
        spent: parseFloat((b.base + (b.growth * day) + (seed % 10)).toFixed(2)),
        rank: i + 1
      }));

      return bots;
    } catch {
      return [];
    }
  }
};
