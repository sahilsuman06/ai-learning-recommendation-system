import React, { useState, useEffect, useRef } from 'react';
import { Send, BrainCircuit, User, Loader2, Sparkles } from 'lucide-react';
import API from '../services/api';

const ChatTutor = () => {
  const userName = localStorage.getItem('user_name') || 'Student';
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'tutor',
      text: `Hello ${userName}! I am your AI Personalized Learning Tutor. Ask me any conceptual question about coding, algorithms, design patterns, or computer science, and I will explain it clearly!`,
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to history
    const userMsgObj = {
      id: Date.now(),
      sender: 'user',
      text: userMessage,
      time: new Date()
    };
    setMessages(prev => [...prev, userMsgObj]);
    setLoading(true);

    try {
      const response = await API.post('/chat', { message: userMessage });
      const tutorMsgObj = {
        id: Date.now() + 1,
        sender: 'tutor',
        text: response.data.reply,
        time: new Date()
      };
      setMessages(prev => [...prev, tutorMsgObj]);
    } catch (err) {
      console.error("Failed to chat with AI Tutor", err);
      const errorMsgObj = {
        id: Date.now() + 2,
        sender: 'tutor',
        text: "I encountered an error communicating with the tutor service. Please check your network connection and try again.",
        time: new Date()
      };
      setMessages(prev => [...prev, errorMsgObj]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse formatting (bold texts)
  const formatMessageText = (text) => {
    if (!text) return null;
    const paragraphs = text.split('\n');
    return paragraphs.map((para, pIdx) => {
      if (para.trim() === '') return <div key={pIdx} className="h-2"></div>;

      // Check lists
      if (para.trim().startsWith('* ') || para.trim().startsWith('- ')) {
        const itemText = para.trim().substring(2);
        return (
          <li key={pIdx} className="ml-4 list-disc mb-1 text-slate-300">
            {parseBoldText(itemText)}
          </li>
        );
      }

      return (
        <p key={pIdx} className="mb-2 leading-relaxed">
          {parseBoldText(para)}
        </p>
      );
    });
  };

  const parseBoldText = (text) => {
    if (!text.includes('**')) return text;
    const parts = text.split('**');
    return parts.map((part, i) => 
      i % 2 === 1 ? (
        <strong key={i} className="text-emerald-400 font-bold">{part}</strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-teal-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl w-full mx-auto px-4 pt-6 pb-4 flex flex-col flex-grow relative z-10">
        
        {/* Chat Header */}
        <div className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-4 rounded-2xl mb-4 shadow-lg">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-1.5">
              AI Personalized Tutor
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </h1>
            <p className="text-[10px] text-slate-400">Powered by Gemini AI • Always ready to help you learn</p>
          </div>
        </div>

        {/* Message Panel */}
        <div className="flex-grow bg-slate-900/20 border border-slate-800 rounded-3xl p-4 md:p-6 mb-4 overflow-y-auto max-h-[calc(100vh-21rem)] min-h-[300px] shadow-inner custom-scrollbar space-y-4">
          {messages.map((msg) => {
            const isTutor = msg.sender === 'tutor';
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isTutor ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-semibold ${
                  isTutor ? 'bg-slate-800 text-emerald-400 border border-slate-750' : 'bg-emerald-500 text-slate-950'
                }`}>
                  {isTutor ? <BrainCircuit className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div>
                  <div className={`rounded-2xl px-4 py-3 text-sm ${
                    isTutor 
                      ? 'bg-slate-900/70 border border-slate-850 text-slate-200' 
                      : 'bg-emerald-600/15 border border-emerald-500/20 text-emerald-100'
                  }`}>
                    {isTutor ? (
                      <div>{formatMessageText(msg.text)}</div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1 block px-1 text-right">
                    {msg.time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading bubble */}
          {loading && (
            <div className="flex gap-3 max-w-[80%] self-start">
              <div className="h-8 w-8 rounded-lg shrink-0 bg-slate-800 text-emerald-400 border border-slate-750 flex items-center justify-center">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <div className="bg-slate-900/70 border border-slate-850 rounded-2xl px-4 py-3 flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                <span>AI Tutor is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask a question (e.g. 'Explain binary search trees' or 'What is a loop?')..."
            className="flex-grow bg-slate-900/40 backdrop-blur-xl border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none transition-all duration-200 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold p-4 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChatTutor;
