
import { FAQItem, Product, Testimonial, Buyer } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: 'v1',
    name: 'Acesso VIP Grupo Vazados',
    description: 'Acesso vitalício ao maior grupo de vazados Privacy e OnlyFans do Brasil.',
    price: 29.90,
    category: 'Vazados +18',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&h=300&auto=format&fit=crop',
    features: ['Atualização Diária', 'Sem Mensalidade', 'Link Direto Drive'],
    isPopular: true
  },
  {
    id: 'v2',
    name: 'Pack Privacy Top 1% Brasil',
    description: 'Coleção completa das criadoras mais influentes do momento. Conteúdo bruto.',
    price: 49.90,
    category: 'Vazados +18',
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=400&h=300&auto=format&fit=crop',
    features: ['4K Ultra HD', 'Download Ilimitado', 'Pastas Organizadas']
  },
  {
    id: 'tf1',
    name: 'Pack Telas Fake Bancos',
    description: 'Interface idêntica aos principais bancos para vídeos e demonstrações.',
    price: 39.90,
    category: 'Telas Fake 7',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=400&h=300&auto=format&fit=crop',
    features: ['Edição de Saldo', 'Animações Reais', 'Painel de Controle'],
    isPopular: true
  },
  {
    id: 'tf2',
    name: 'Dashboard Social Fake Pro',
    description: 'Telas de notificações e direct fake para Instagram e WhatsApp.',
    price: 19.90,
    category: 'Telas Fake 7',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&h=300&auto=format&fit=crop',
    features: ['Customizável', 'Resolução Mobile', 'Acesso Imediato']
  },
  {
    id: 'n1',
    name: 'Nitro Link Mensal',
    description: 'Link promocional para ativação de 1 mês de Discord Nitro Gaming.',
    price: 14.90,
    category: 'Nitros',
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=400&h=300&auto=format&fit=crop',
    features: ['Ativação via Link', '2 Boosts inclusos', 'Entrega Imediata'],
    isPopular: true
  },
  {
    id: 'n3',
    name: 'Nitro Gift Mensal',
    description: 'Presente oficial Discord Nitro. Funciona em qualquer conta, sem restrições.',
    price: 44.90,
    category: 'Nitros',
    image: 'https://images.unsplash.com/photo-1596567130084-2450e3566139?q=80&w=400&h=300&auto=format&fit=crop',
    features: ['Sem Restrições', 'Link Oficial Gift', 'Garantia de 30 dias']
  },
  {
    id: 'a1',
    name: 'Netflix Premium 4K',
    description: 'Acesso Ultra HD com perfil privado e renovável.',
    price: 19.90,
    category: 'Assinaturas',
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=400&h=300&auto=format&fit=crop',
    features: ['Qualidade 4K HDR', 'Perfil Privado', 'Suporte 24/7'],
    isPopular: true
  },
  {
    id: 'a2',
    name: 'Spotify Premium',
    description: 'Assinatura individual para sua própria conta ou plano família.',
    price: 12.90,
    category: 'Assinaturas',
    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=300&auto=format&fit=crop',
    features: ['Sem Anúncios', 'Modo Offline', 'Sua própria conta']
  },
  {
    id: 'j1',
    name: 'Minecraft Original',
    description: 'Código de ativação oficial para a edição Bedrock e Java do Minecraft.',
    price: 39.90,
    category: 'Jogos',
    image: 'https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?q=80&w=400&h=300&auto=format&fit=crop',
    features: ['Full Acesso', 'Pode Mudar Nick', 'Vitalício'],
    isPopular: true
  },
  {
    id: 'p6',
    name: 'Pack Exclusivo Nexus',
    description: 'O pack definitivo com todas as nossas ferramentas de elite em um só lugar.',
    price: 149.90,
    category: 'Packs',
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=400&h=300&auto=format&fit=crop',
    features: ['VIP Access', 'Todos os Spoofer', 'Suporte Prioritário'],
    isPopular: true
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    text: "O pack de telas fake é assustadoramente real. Usei para um vídeo e ninguém desconfiou. Entrega na hora!",
    author: "Zika_Gamer",
    role: "Cliente VIP",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zika",
    badge: "vip"
  },
  {
    id: 2,
    text: "Grupo de vazados sempre atualizado. Melhor investimento que fiz esse mês. Privacy top 1% liberado!",
    author: "Danilo H.",
    role: "Membro Elite",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Danilo",
    badge: "elite"
  },
  {
    id: 3,
    text: "Nitro ativou na hora pelo link promocional. Nexus é a única que confio pra digital hoje em dia.",
    author: "Felipe G.",
    role: "Membro Pioneiro",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felipe",
    badge: "pioneer"
  }
];

export const FAQS: FAQItem[] = [
  {
    question: "Como recebo o acesso aos Vazados?",
    answer: "Após o Pix, você recebe um convite automático para o canal privado do Telegram e o link do Drive."
  },
  {
    question: "As Telas Fake são editáveis?",
    answer: "Sim, os arquivos acompanham instruções para você alterar saldos, nomes e datas conforme desejar."
  }
];
