
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface AssistantScreenProps {
  onBack: () => void;
}

const AssistantScreen: React.FC<AssistantScreenProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your Hospitonet AI Assistant powered by Gemini. How can I support your health journey today?',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: inputValue,
        config: {
          systemInstruction: 'You are a professional and empathetic healthcare assistant for the Hospitonet app. Provide helpful, accurate health information but always include a disclaimer that you are an AI and users should consult a real doctor for medical emergencies or formal diagnoses. Your tone is modern, tech-forward, and supportive.',
        },
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || "I'm sorry, I couldn't process that. Please try again.",
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Gemini Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I encountered an error while connecting to my knowledge base. Please check your connection and try again.",
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-500 to-blue-600 pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/20 rounded-2xl backdrop-blur-md text-white">
            <span className="material-icons-round">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white leading-none tracking-tight">Hospitonet AI</h1>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Active • Gemini 3</span>
            </div>
          </div>
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white">
          <span className="material-icons-round">bolt</span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 hide-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
              }`}
            >
              {msg.text}
              <div className={`text-[9px] mt-2 font-medium opacity-50 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl rounded-tl-none border border-gray-100 dark:border-gray-700 flex gap-1">
              <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="How are you feeling today?"
              className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary dark:text-white transition-all"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <span className="material-icons-round text-xl">camera_alt</span>
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              inputValue.trim() && !isTyping ? 'bg-primary text-white shadow-lg shadow-cyan-500/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="material-icons-round">send</span>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-4 uppercase tracking-tighter font-bold">
          Hospitonet AI - Professional Health Support
        </p>
      </div>
    </div>
  );
};

export default AssistantScreen;
