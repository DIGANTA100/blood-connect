import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, HelpCircle, RefreshCw } from 'lucide-react';
import { getHealthAdvice } from '../services/geminiService';

interface MythsAssistantProps {
  language: 'en' | 'bn';
}

interface Message {
  role: 'user' | 'bot' | 'error';
  text: string;
}

const MythsAssistant: React.FC<MythsAssistantProps> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      text: language === 'en' 
        ? "Hello! I am your BloodConnect health assistant. Ask me anything about blood donation, myths, or health safety in Bangladesh." 
        : "হ্যালো! আমি আপনার ব্লাডকানেক্ট স্বাস্থ্য সহকারী। রক্তদান, ভুল ধারণা বা স্বাস্থ্য নিরাপত্তা সম্পর্কে আমাকে যেকোনো প্রশ্ন করুন।"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      const response = await getHealthAdvice(textToSend, language);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'error', 
        text: language === 'en' ? "Failed to get response. Please try again." : "তথ্য পেতে সমস্যা হয়েছে। আবার চেষ্টা করুন।" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = language === 'en' 
    ? ["Does blood donation make you weak?", "Who can donate blood?", "Can I donate while fasting?", "Is there a risk of infection?"]
    : ["রক্ত দিলে কি শরীর দুর্বল হয়?", "কারা রক্ত দিতে পারে?", "রোজা রেখে কি রক্ত দেওয়া যায়?", "সংক্রমণের কোনো ঝুঁকি আছে কি?"];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-red-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-red-200">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 leading-tight">
              {language === 'en' ? 'Health & Myth Buster' : 'স্বাস্থ্য এবং ভ্রান্ত ধারণা নিরসন'}
            </h3>
            <p className="text-xs text-red-600 font-medium">AI Assistant • Powered by Gemini</p>
          </div>
        </div>
        <HelpCircle className="text-gray-400 cursor-pointer hover:text-red-500 transition-colors" size={20} />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center shadow-sm ${
                msg.role === 'user' ? 'bg-gray-800 text-white' : 
                msg.role === 'error' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-red-600 text-white rounded-tr-none' 
                  : msg.role === 'error'
                  ? 'bg-orange-50 text-orange-800 border border-orange-200 rounded-tl-none'
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-3">
              <RefreshCw size={14} className="animate-spin text-red-500" />
              <span className="text-xs text-gray-500 font-medium italic">
                {language === 'en' ? 'Gemini is thinking...' : 'জেমিনি চিন্তা করছে...'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => handleSend(s)}
              disabled={isLoading}
              className="whitespace-nowrap px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={language === 'en' ? "Ask about donation safety..." : "রক্তদান সম্পর্কিত তথ্য জানতে প্রশ্ন করুন..."}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none transition-all placeholder:text-gray-400"
            disabled={isLoading}
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-red-100"
          >
            {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MythsAssistant;