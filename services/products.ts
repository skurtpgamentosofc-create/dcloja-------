
import { supabase } from "./supabase";
import { Product, Review } from "../types";
import { PRODUCTS as FALLBACK_PRODUCTS } from "../constants";

export interface ServiceResponse {
  success: boolean;
  error?: string;
}

// Aumentado para 120 segundos (2 minutos) para garantir o salvamento em conexões muito lentas
const withTimeout = <T>(promise: PromiseLike<T>, timeoutMs: number = 120000): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("O servidor demorou muito para processar os dados. Reduzimos o tamanho da imagem, mas a conexão ainda falhou. Tente novamente.")), timeoutMs)
    ),
  ]);
};

const isUUID = (uuid: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
};

const getRandom2025Date = () => {
  const start = new Date('2025-01-01').getTime();
  const now = new Date().getTime();
  const end = Math.min(now, new Date('2025-12-31').getTime());
  const randomDate = new Date(start + Math.random() * (end - start));
  return randomDate.toISOString();
};

const REVIEWS_POOL: Omit<Review, 'productId' | 'productName' | 'productImage'>[] = [
  { id: 'p1', userId: 'u1', userName: 'GhostKiller_99', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost', rating: 5, comment: 'Vei, veio um jogo de 150 reais na key de 25! Puta custo benefício, Nexus é elite.', date: '' },
  { id: 'p2', userId: 'u2', userName: 'ViperMain', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Viper', rating: 5, comment: 'Ativação via Gift é muito melhor, sem risco nenhum. Nexus sempre salvando!', date: '' },
  { id: 'p3', userId: 'u3', userName: 'Caique_Dev', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Caique', rating: 5, comment: 'Perfil privado rodando 4K liso. Melhor que pagar 60 conto na oficial kkkk.', date: '' },
  { id: 'p4', userId: 'u4', userName: 'Letícia_Gamer', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leticia', rating: 5, comment: 'Consegui trocar o nick e a skin sem problemas. Full acesso mesmo!', date: '' },
  { id: 'p5', userId: 'u5', userName: 'Marcos_Pro', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos', rating: 5, comment: 'Esse pack mudou meu jogo. O otimizador de FPS é bizarro de bom. Vale cada centavo.', date: '' }
];

const getDailyShuffledReviews = (pool: any[]): Review[] => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const shuffled = [...pool].sort((a, b) => {
    const seedA = parseInt(a.id.substring(1)) * dayOfYear;
    const seedB = parseInt(b.id.substring(1)) * dayOfYear;
    return (seedA % 10) - (seedB % 10);
  });

  return shuffled.map(review => ({
    ...review,
    date: getRandom2025Date(),
    productName: FALLBACK_PRODUCTS[Math.floor(Math.random() * FALLBACK_PRODUCTS.length)].name,
    productImage: FALLBACK_PRODUCTS[Math.floor(Math.random() * FALLBACK_PRODUCTS.length)].image
  })) as Review[];
};

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    try {
      const { data: dbData, error } = await supabase
        .from('products')
        .select('id, name, description, price, category, image, features')
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      const processedDbProducts = (dbData || []).map(p => ({
        id: String(p.id),
        name: p.name,
        description: p.description,
        price: Number(p.price),
        category: p.category,
        image: p.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&h=300&auto=format&fit=crop',
        features: Array.isArray(p.features) ? p.features : [],
        rating: 4.7 + Math.random() * 0.3,
        reviewCount: Math.floor(Math.random() * 50) + 10
      }));

      const combined = new Map<string, Product>();
      
      FALLBACK_PRODUCTS.forEach(p => combined.set(p.name.toLowerCase(), {
        ...p, 
        rating: 4.8, 
        reviewCount: 25
      }));
      
      processedDbProducts.forEach(p => combined.set(p.name.toLowerCase(), p));

      return Array.from(combined.values()).reverse();
    } catch (err) {
      return FALLBACK_PRODUCTS.map(p => ({ ...p, rating: 4.8, reviewCount: 30 }));
    }
  },

  getProductReviews: async (productId: string): Promise<Review[]> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return getDailyShuffledReviews(REVIEWS_POOL).slice(0, 3).map(r => ({ ...r, productId }));
      }
      
      return data.map(r => ({
        id: r.id,
        productId: r.product_id,
        userId: r.user_id,
        userName: r.user_name,
        userAvatar: r.user_avatar,
        rating: r.rating,
        comment: r.comment,
        date: r.created_at
      }));
    } catch (err) {
      return getDailyShuffledReviews(REVIEWS_POOL).slice(0, 3).map(r => ({ ...r, productId }));
    }
  },

  getGlobalReviews: async (): Promise<Review[]> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);

      if (error || !data || data.length === 0) {
        return getDailyShuffledReviews(REVIEWS_POOL).slice(0, 12);
      }

      return data.map(r => ({
        id: r.id,
        productId: r.product_id,
        userId: r.user_id,
        userName: r.user_name,
        userAvatar: r.user_avatar,
        rating: r.rating,
        comment: r.comment,
        date: r.created_at
      }));
    } catch (err) {
      return getDailyShuffledReviews(REVIEWS_POOL).slice(0, 12);
    }
  },

  submitReview: async (review: Omit<Review, 'id' | 'date'>): Promise<ServiceResponse> => {
    if (!isUUID(review.productId)) {
      return { success: false, error: "Este produto não suporta avaliações no momento." };
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          product_id: review.productId,
          user_id: review.userId,
          rating: review.rating,
          comment: review.comment,
          user_name: review.userName,
          user_avatar: review.userAvatar
        }]);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  create: async (productData: Omit<Product, 'id'>): Promise<ServiceResponse> => {
    try {
      const cleanPrice = typeof productData.price === 'string' 
        ? parseFloat(String(productData.price).replace(',', '.'))
        : Number(productData.price);

      const payload = {
        name: String(productData.name).trim(),
        description: String(productData.description).trim(),
        price: cleanPrice,
        category: String(productData.category).trim(),
        image: productData.image, 
        features: Array.isArray(productData.features) ? productData.features : []
      };

      const { error } = await withTimeout(supabase.from('products').insert([payload]));
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  update: async (id: string, productData: Partial<Product>, oldProduct?: Product): Promise<ServiceResponse> => {
    if (!isUUID(id)) return { success: false, error: "Este é um produto de demonstração. Você pode criar um novo produto com estes dados para salvá-lo no banco de dados." };
    try {
      const payload: any = {};
      if (productData.name !== undefined) payload.name = String(productData.name).trim();
      if (productData.description !== undefined) payload.description = String(productData.description).trim();
      if (productData.category !== undefined) payload.category = String(productData.category).trim();
      if (productData.features !== undefined) payload.features = productData.features;
      
      // OTIMIZAÇÃO: Só envia a imagem se ela for diferente da antiga
      // Se a imagem for Base64 e for igual à URL do banco, não reenviamos os dados pesados
      if (productData.image !== undefined && productData.image !== '' && productData.image !== oldProduct?.image) {
        payload.image = productData.image; 
      }
      
      if (productData.price !== undefined) {
        payload.price = typeof productData.price === 'string' 
          ? parseFloat(String(productData.price).replace(',', '.'))
          : Number(productData.price);
      }
      
      const { error } = await withTimeout(supabase.from('products').update(payload).eq('id', id));
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  delete: async (id: string): Promise<ServiceResponse> => {
    if (!isUUID(id)) return { success: false, error: "Produtos padrão não podem ser deletados." };
    try {
      const { error } = await withTimeout(supabase.from('products').delete().eq('id', id));
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
