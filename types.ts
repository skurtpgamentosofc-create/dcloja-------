
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  features: string[];
  rating?: number;
  reviewCount?: number;
  isPopular?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  productImage?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Testimonial {
  id: number;
  text: string;
  author: string;
  role: string;
  avatar: string;
  badge?: 'vip' | 'elite' | 'pioneer';
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface Buyer {
  id: string;
  name: string;
  spent: number;
  avatar: string;
  rank: number;
}

export interface Purchase {
  id: string;
  date: string;
  productName: string;
  productId?: string; 
  price: number;
  status: 'Concluído' | 'Processando';
  isReviewed?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
  document?: string;
  phone?: string;
  discordId?: string;
  avatar: string;
  history: Purchase[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'success' | 'info' | 'warning';
}
