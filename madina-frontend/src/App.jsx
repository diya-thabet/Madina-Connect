import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Send, 
  MapPin, 
  Wind, 
  Calendar, 
  Bus, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Cpu,
  Bot
} from 'lucide-react';

// --- Components ---

const ServiceCard = ({ icon: Icon, title, status, details, color }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getStatusColor = (s) => {
    if (s === 'Fetched') return 'text-green-400';
    if (s === 'Error') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className={`border border-gray-800 bg-gray-900/50 rounded-xl p-4 transition-all duration-300 ${expanded ? 'bg-gray-800/80 ring-1 ring-blue-500/30' : 'hover:bg-gray-800/50'}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gray-950 ${color}`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-200 text-sm">{title}</h3>
            <p className={`text-xs ${getStatusColor(status)} flex items-center gap-1`}>
              {status === 'Fetched' && <CheckCircle2 size={10} />}
              {status === 'Error' && <XCircle size={10} />}
              {status}
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-500 bg-gray-950 px-2 py-1 rounded">
          {expanded ? 'Hide Data' : 'View Data'}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-700/50 text-xs font-mono overflow-x-auto">
          <pre className="text-gray-400 whitespace-pre-wrap">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const ChatMessage = ({ role, content, isLoading }) => {
  return (
    <div className={`flex gap-4 ${role === 'user' ? 'flex-row-reverse' : ''} mb-6`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${role === 'ai' ? 'bg-blue-600' : 'bg-gray-600'}`}>
        {role === 'ai' ? <Bot size={18} /> : <div className="text-xs font-bold">You</div>}
      </div>
      
      <div className={`max-w-[80%] rounded-2xl p-4 ${role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800/80 text-gray-100 border border-gray-700'}`}>
        {isLoading ? (
          <div className="flex gap-2 items-center text-gray-400 text-sm">
            <Cpu className="animate-spin" size={16} />
            <span>Consulting Mobility, Air Quality & Event Services...</span>
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <Markdown>{content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I am your **Madina Smart Assistant**. I can orchestrate our Mobility, Air Quality, and Event services to plan your perfect day. What are you in the mood for?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [serviceData, setServiceData] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // FIX: Added /api prefix to trigger the proxy rule in vite.config.js
      // /api/plan-day (Frontend) -> rewrites to -> /plan-day (Backend port 8001)
      const response = await fetch('/api/plan-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_preferences: userMsg })
      });

      // Check if response is OK before parsing JSON to catch 404/500 errors gracefully
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();

      if (data.planner_status === 'Success') {
        setMessages(prev => [...prev, { role: 'ai', content: data.generated_plan }]);
        setServiceData(data.raw_data_summary);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "**System Error:** Could not orchestrate services." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: `**Network Error:** Is the Python Orchestrator running on port 8001? \n\nDetails: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract specific service data for the UI sidebar
  const getServiceStatus = (name) => {
    if (!serviceData) return { status: 'Waiting', data: null };
    const service = serviceData.find(s => s.service_name.includes(name));
    return service ? { status: 'Fetched', data: service.data } : { status: 'Unknown', data: null };
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- LEFT SIDEBAR: SERVICE MONITOR --- */}
      <div className="w-80 border-r border-gray-800 bg-gray-950/50 p-4 flex flex-col gap-6 hidden md:flex">
        <div className="flex items-center gap-2 px-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h1 className="font-bold text-lg tracking-tight text-white">Madina Connect <span className="text-xs text-blue-400 font-normal px-1.5 py-0.5 border border-blue-400/30 rounded">v1.0</span></h1>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Active Services</div>
          
          <ServiceCard 
            icon={Bus} 
            title="Smart Mobility" 
            color="text-yellow-400"
            status={getServiceStatus('Mobility').status} 
            details={getServiceStatus('Mobility').data || "Waiting for requests..."} 
          />
          
          <ServiceCard 
            icon={Wind} 
            title="Air Quality" 
            color="text-cyan-400"
            status={getServiceStatus('Air Quality').status} 
            details={getServiceStatus('Air Quality').data || "Waiting for requests..."} 
          />
          
          <ServiceCard 
            icon={Calendar} 
            title="City Events" 
            color="text-purple-400"
            status={getServiceStatus('Events').status} 
            details={getServiceStatus('Events').data || "Waiting for requests..."} 
          />
        </div>

        <div className="mt-auto bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-blue-500" />
            <span className="text-xs font-bold text-gray-300">System Status</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Orchestrator</span>
              <span className="text-green-400">Online</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Latency</span>
              <span className="text-gray-400">24ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT: CHAT INTERFACE --- */}
      <div className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
        
        {/* Header (Mobile only) */}
        <div className="md:hidden p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/80 backdrop-blur">
          <span className="font-bold">Madina Smart City</span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            {messages.map((msg, idx) => (
              <ChatMessage 
                key={idx} 
                role={msg.role} 
                content={msg.content} 
              />
            ))}
            {loading && <ChatMessage role="ai" isLoading={true} />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t border-gray-800 bg-gray-950/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={handleSubmit} className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for a plan (e.g., 'I want a spicy dinner and to see some art...')"
                className="w-full bg-gray-900 text-gray-100 rounded-2xl pl-4 pr-14 py-4 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-lg placeholder:text-gray-600"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                <Send size={20} />
              </button>
            </form>
            <div className="text-center mt-3 text-xs text-gray-600">
              Powered by Madina Microservices: SOAP • REST • GraphQL • Gemini AI
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}