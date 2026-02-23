
import React, { useState, useEffect, useRef } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { Message } from '../types';

const ChatSimulator: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou o assistente da APSILVA. 🤖 Como posso te ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "Preço do e-CPF A1",
    "Preciso para CNPJ",
    "Como funciona a vídeo?"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const messageContent = textToSend || input;
    if (!messageContent.trim()) return;

    const userMsg: Message = { role: 'user', text: messageContent };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const botResponse = await getGeminiResponse(messageContent);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'model', text: botResponse }]);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#E5DDD5] rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[600px] border-[8px] border-slate-900 relative">
      {/* WhatsApp Header */}
      <div className="bg-[#075E54] p-4 flex items-center gap-3 text-white">
        <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white/20 flex items-center justify-center overflow-hidden">
          <img loading="lazy" width="48" height="48" src="https://picsum.photos/seed/apsilva/100/100" alt="APSILVA Assistant" />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-base leading-tight">APSILVA - Atendimento</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <p className="text-[11px] font-bold opacity-80 uppercase tracking-tighter">Online agora</p>
          </div>
        </div>
        <div className="flex gap-4">
           <svg className="w-5 h-5 opacity-70" fill="currentColor" viewBox="0 0 24 24"><path d="M11 5h2v2h-2V5zm0 4h2v10h-2V9z"/></svg>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar"
        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain' }}
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-md leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[#DCF8C6] rounded-tr-none text-slate-800' 
                  : 'bg-white rounded-tl-none text-slate-800'
              }`}
            >
              {msg.text}
              <p className="text-[10px] text-slate-400 mt-1 text-right">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 font-bold flex gap-1 items-center">
              APSILVA está digitando
              <span className="flex gap-0.5">
                <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce delay-75"></span>
                <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce delay-150"></span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Replies Area */}
      {messages.length < 3 && !isTyping && (
        <div className="p-2 flex gap-2 overflow-x-auto bg-transparent absolute bottom-20 w-full no-scrollbar">
          {quickReplies.map((reply, i) => (
            <button 
              key={i}
              onClick={() => handleSend(reply)}
              className="bg-white/90 backdrop-blur-sm border-2 border-emerald-500/30 text-emerald-700 px-4 py-2 rounded-full text-xs font-black whitespace-nowrap hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-[#F0F0F0] p-4 flex gap-3 items-center">
        <div className="flex-1 bg-white rounded-2xl px-4 py-3 shadow-inner flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite aqui sua mensagem..."
            className="w-full text-sm focus:outline-none border-none bg-transparent"
          />
        </div>
        <button 
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="bg-[#128C7E] text-white p-4 rounded-2xl hover:bg-[#075E54] transition-all shadow-lg active:scale-90 disabled:opacity-50 disabled:grayscale"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatSimulator;
