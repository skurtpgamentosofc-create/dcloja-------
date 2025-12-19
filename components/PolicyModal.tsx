
import React from 'react';
import { X, ShieldAlert, Lock, ScrollText } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const content = {
    terms: {
      title: "Termos de Uso",
      icon: <ScrollText className="text-violet-400" size={24} />,
      sections: [
        {
          title: "1. Aceitação dos Termos",
          text: "Ao acessar a Nexus Store, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site."
        },
        {
          title: "2. Entrega de Produtos Digitais",
          text: "Nossos produtos são exclusivamente digitais. A entrega ocorre de forma automática e imediata após a confirmação do pagamento via Pix ou outro método disponível. O acesso será enviado para o e-mail cadastrado e estará disponível no histórico de pedidos."
        },
        {
          title: "3. Política de Reembolso",
          text: "Devido à natureza dos produtos (chaves de ativação, licenças e contas), uma vez que o código é visualizado ou utilizado, não realizamos reembolsos, exceto em casos de defeito comprovado do produto onde a reposição não seja possível."
        },
        {
          title: "4. Uso Proibido",
          text: "É proibido usar nossos produtos para fins ilícitos que violem os termos de serviço de terceiros (como desenvolvedores de jogos). A Nexus Store não se responsabiliza por banimentos resultantes do uso indevido de ferramentas de terceiros."
        }
      ]
    },
    privacy: {
      title: "Política de Privacidade",
      icon: <Lock className="text-violet-400" size={24} />,
      sections: [
        {
          title: "1. Coleta de Dados",
          text: "Coletamos informações essenciais para o processamento de pedidos: E-mail (para entrega), Nome (identificação), CPF (exigência do Banco Central para transações Pix) e Discord ID (para suporte técnico)."
        },
        {
          title: "2. Segurança",
          text: "Utilizamos a infraestrutura do Supabase com criptografia de ponta a ponta e Row Level Security (RLS) para garantir que apenas você tenha acesso aos seus dados e histórico de compras."
        },
        {
          title: "3. Compartilhamento de Informações",
          text: "Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins de marketing. Os dados de pagamento são processados de forma segura via TriboPay, sem armazenamento de dados sensíveis em nossos servidores próprios."
        },
        {
          title: "4. Seus Direitos",
          text: "Você tem o direito de solicitar a exclusão total da sua conta e de todos os dados associados a qualquer momento através do nosso suporte oficial no Discord."
        }
      ]
    }
  };

  const active = content[type];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
      
      <div className="relative bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col animate-zoom-in max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            {active.icon} {active.title}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-zinc-900/50">
          {active.sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-violet-400 font-bold tracking-tight">{section.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed text-justify">
                {section.text}
              </p>
            </div>
          ))}
          
          <div className="pt-8 border-t border-white/5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest text-center">
              Última atualização: Dezembro de 2024 • Nexus Store Official
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
