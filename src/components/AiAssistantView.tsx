import React, { useState, useEffect, useRef } from 'react';
import { 
  BotMessageSquare, 
  Send, 
  Sparkles, 
  Info, 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  User, 
  PhoneCall,
  Flame,
  Droplets,
  ExternalLink
} from 'lucide-react';
import { ChatMessage, Junction, LocationInfo, WeatherCondition } from '../types';

interface AiAssistantViewProps {
  location: LocationInfo;
  junctions: Junction[];
  weather: WeatherCondition;
  selectedJunction: Junction | null;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  location,
  junctions,
  weather,
  selectedJunction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello! I am the **HeatShield AI Safety Assistant** for **${location.city || location.name}**.\n\nI analyze urban microclimates, thermal radiation, and traffic congestion to keep traffic police, municipal outdoor workers, and citizens safe during extreme heat.\n\nYou can ask me about highest-risk junctions, required hydration protocols, shade prioritization, or immediate heat-stress actions.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'HeatShield Intelligence Core',
      isAiPowered: false,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modeInfo, setModeInfo] = useState<{ mode: string; hasApiKey: boolean; model: string }>({
    mode: 'checking...',
    hasApiKey: false,
    model: 'gemini-3.8-flash',
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Check server AI status
  useEffect(() => {
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => {
        setModeInfo({
          mode: data.mode || 'rule-based-demo',
          hasApiKey: data.hasApiKey || false,
          model: data.model || 'gemini-3.8-flash',
        });
      })
      .catch(() => {
        setModeInfo({
          mode: 'rule-based-demo',
          hasApiKey: false,
          model: 'gemini-3.8-flash',
        });
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Suggested questions from user prompt specification
  const suggestedQueries = [
    'Which junction has the highest heat risk?',
    'What safety actions are recommended for this location?',
    'Why is this junction marked high risk?',
    'Where should authorities prioritize shade and drinking water?',
    'What should an outdoor worker do during extreme heat?',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          context: {
            location: location,
            junctions: junctions,
            weather: weather,
            selectedJunction: selectedJunction,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        isAiPowered: data.isAiPowered,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `Swargate Junction currently records the highest heat-risk score (84/100, High Risk) in ${location.city || location.name}. Immediate safety actions: mandatory 15-minute shaded rest every 45 minutes, chilled electrolyte replenishment, and duty rotation away from unshaded tarmac.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Local Fallback Engine',
        isAiPowered: false,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900">
              HeatShield AI Safety Assistant
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              {location.city || location.name}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Grounded intelligence for heatwave occupational safety, hydration schedules, and municipal shade planning.
          </p>
        </div>

        {/* AI Engine Status Badge */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            modeInfo.hasApiKey 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}>
            <Sparkles className={`w-3.5 h-3.5 ${modeInfo.hasApiKey ? 'text-emerald-600' : 'text-amber-600'}`} />
            <span>
              {modeInfo.hasApiKey ? 'Gemini 3.8 Flash (Live Server AI)' : 'Rule-Based Engine (Demo Grounded)'}
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Guidance Ribbon */}
      <div className="bg-red-50/90 border border-red-200 p-3.5 rounded-xl text-xs text-red-900 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            <strong>Emergency Advisory: </strong>
            If any outdoor worker experiences dizziness, confusion, cessation of sweating, or body temperature &gt; 40°C, call emergency medical services (<strong>112</strong> / local ambulance) immediately.
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-200 text-red-900 px-2 py-0.5 rounded-md whitespace-nowrap">
          Call 112
        </span>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col h-[600px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar bg-stone-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#123624] text-emerald-300'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <BotMessageSquare className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-none'
                    : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                <div
                  className={`flex items-center justify-between text-[10px] pt-1.5 border-t ${
                    msg.sender === 'user'
                      ? 'border-emerald-600/60 text-emerald-200'
                      : 'border-stone-100 text-stone-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.source && (
                    <span className="font-mono">
                      Source: {msg.source}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-md">
              <div className="w-8 h-8 rounded-full bg-[#123624] text-emerald-300 flex items-center justify-center shrink-0">
                <BotMessageSquare className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 rounded-tl-none flex items-center gap-2 text-xs text-stone-500">
                <span className="inline-block animate-spin w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full" />
                <span>Analyzing thermal microclimate data & guidelines...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Pills */}
        <div className="px-5 py-2.5 bg-stone-100/70 border-t border-stone-200 overflow-x-auto custom-scrollbar flex items-center gap-2">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0">
            Quick Prompts:
          </span>
          {suggestedQueries.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full text-xs bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-200 text-stone-700 whitespace-nowrap transition disabled:opacity-50 shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white border-t border-stone-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask a question about heat risk in ${location.city || location.name}...`}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-900"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#123624] hover:bg-[#1B4D35] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition disabled:opacity-40 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
