
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { sendMessageToGemini } from '../services/gemini';
import { ChatMessage, Product } from '../types';

interface ChatWidgetProps {
  products: Product[];
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou o assistente da Nexus Store. Como posso ajudar você a encontrar o produto ideal hoje?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');
    
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const responseText = await sendMessageToGemini(userText, products);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100] pointer-events-none">
      {/* Janela de Chat com posicionamento absoluto para não ocupar espaço quando fechada */}
      <div 
        className={`absolute bottom-20 left-0 w-80 md:w-96 bg-zinc-900 border border-zinc-700 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 origin-bottom-left pointer-events-auto ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0 visible' 
            : 'opacity-0 scale-95 translate-y-10 invisible pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-r from-violet-900 to-zinc-900 p-4 flex justify-between items-center border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-xl">
              <Bot size={20} className="text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm tracking-tight">Nexus Assistant</h3>
              <p className="text-[10px] text-green-400 flex items-center gap-1 font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <button onClick={toggleChat} className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="h-80 overflow-y-auto p-4 bg-zinc-950/50 space-y-4 scrollbar-thin">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === 'user' 
                  ? 'bg-violet-600 text-white rounded-br-none shadow-lg shadow-violet-600/20' 
                  : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 border border-zinc-700">
                <Loader2 size={16} className="animate-spin text-violet-500" />
                <span className="text-xs text-zinc-400 font-bold">Analisando estoque...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Dúvidas sobre os produtos?"
            className="flex-1 bg-black/40 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500/50 border border-white/5 focus:border-violet-500 transition-all placeholder-zinc-600"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/20"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Botão de Toggle fixo na sua posição, sempre interativo */}
      <button 
        onClick={toggleChat}
        className={`pointer-events-auto h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen 
            ? 'bg-zinc-800 text-zinc-400 -rotate-90 border border-white/10' 
            : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-violet-600/40'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

export default ChatWidget;
