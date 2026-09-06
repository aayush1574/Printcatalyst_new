import React, { useState, useEffect } from 'react';
import { X, Send, Paperclip, MessageSquare, Bot, Sparkles, CheckCheck, Clock, User } from 'lucide-react';
import { API_BASE } from '../config';

export default function WhatsAppSimulatorModal({ botConfig, isOpen, onClose, onOrderCreated }) {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'bot', text: botConfig?.greetingMessage || '👋 Welcome to Print Support Hub! Send your PDF or image for instant prints.', timestamp: '10:00 AM' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const sendMessage = async (text, fileData = null) => {
    if (!text && !fileData) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: fileData ? `📎 ${fileData.name} (${fileData.pages} pages, ${fileData.color})` : text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/whatsapp/simulate-incoming`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone: '+91 97410 88219',
          customerName: 'Simulated WhatsApp Customer',
          messageText: text,
          fileName: fileData?.name || null,
          filePages: fileData?.pages || 5,
          colorMode: fileData?.color === 'Color' ? 'COLOR' : 'BLACK_AND_WHITE'
        })
      });

      const data = await res.json();
      if (data.success) {
        const botMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
        if (data.createdOrder && onOrderCreated) {
          onOrderCreated(data.createdOrder);
        }
      }
    } catch (e) {
      console.error('Bot simulator error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateAttachment = (type) => {
    if (type === 'college_report') {
      sendMessage('', { name: 'College_Seminar_Presentation.pdf', pages: 18, color: 'Black & White' });
    } else if (type === 'color_brochure') {
      sendMessage('', { name: 'Company_Profile_Brochure.pdf', pages: 8, color: 'Color' });
    } else if (type === 'id_card') {
      sendMessage('', { name: 'Driving_License_Copy.pdf', pages: 2, color: 'Black & White' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* WhatsApp Chat Header */}
        <div className="px-5 py-3.5 bg-emerald-900/80 border-b border-emerald-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Bot className="w-6 h-6" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                Print Support WhatsApp Bot Engine
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ONLINE
                </span>
              </h3>
              <p className="text-xs text-emerald-200">Auto-intake & pricing enabled for +91 98765 43210</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Simulation Triggers */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold flex-shrink-0">Quick Test:</span>
          <button
            onClick={() => handleSimulateAttachment('college_report')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 whitespace-nowrap transition-colors"
          >
            📎 Send 18-page B&W Report
          </button>
          <button
            onClick={() => handleSimulateAttachment('color_brochure')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 whitespace-nowrap transition-colors"
          >
            📎 Send 8-page Color Doc
          </button>
          <button
            onClick={() => sendMessage('What are your shop timings?')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition-colors"
          >
            💬 Ask Timings
          </button>
          <button
            onClick={() => sendMessage('Do you do spiral binding?')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition-colors"
          >
            💬 Ask Binding Rates
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0d1418] font-sans text-sm">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 shadow-md ${
                  m.sender === 'user'
                    ? 'bg-[#005c4b] text-white rounded-br-none'
                    : 'bg-[#202c33] text-slate-100 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line text-xs leading-relaxed">{m.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                  <span>{m.timestamp}</span>
                  {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#202c33] text-slate-300 rounded-xl px-3.5 py-2 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Print Support Bot is typing auto-quote...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={() => handleSimulateAttachment('id_card')}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Attach simulated PDF"
          >
            <Paperclip className="w-5 h-5 text-indigo-400" />
          </button>

          <input
            type="text"
            placeholder="Type a message or question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
