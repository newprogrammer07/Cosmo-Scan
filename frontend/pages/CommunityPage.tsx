import React, { useState, useEffect, useRef, useMemo } from 'react';
import GlassCard from '../components/GlassCard';
import MagneticButton from '../components/MagneticButton';
import { useAuthStore } from '../store/useAuthStore'; 
import { useAppStore } from '../store/useAppStore'; 
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config'; 
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';

interface Message {
  id: number;
  user: string;
  text: string;
  timestamp: string;
}

const CommunityPage: React.FC = () => {
  
  const { user } = useAuthStore(); 
  const { communityChartData, addChartPoint } = useAppStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const socket = useMemo(() => io(API_BASE_URL), []);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/messages`);
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
            setMessages(data);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const randomValue = Math.floor(Math.random() * (100 - 40 + 1)) + 40;
      
      addChartPoint({ time: timeString, value: randomValue });
    }, 2000);

    return () => clearInterval(interval);
  }, [addChartPoint]);

  useEffect(() => {
    socket.on('receive_message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    if (!user) return alert("Please log in to transmit messages.");

    const messageData = {
      user: user.name, 
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit('send_message', messageData);
    
    setMessages((prev) => [...prev, { ...messageData, id: Date.now() }]);
    setNewMessage('');
  };

  return (
    <div className="p-4 md:p-8 md:pl-28 min-h-screen flex flex-col bg-transparent font-mono selection:bg-neon-cyan/30">
      
      {/* HEADER */}
      <header className="mb-6 animate-fadeInDown border-b border-white/5 pb-4">
          <div className="flex items-center gap-3 text-neon-cyan mb-1">
              <span className="w-2 h-2 bg-neon-cyan rounded-full animate-ping" />
              <span className="text-xs font-bold tracking-[0.4em] uppercase">Live Uplink Established</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white">
              Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white">Nexus</span>
          </h1>
      </header>

      {/* MAIN GRID LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* LEFT COLUMN: LIVE CHART & STATS */}
        <div className="lg:col-span-1 flex flex-col gap-6">
            <GlassCard className="p-6 relative overflow-hidden flex flex-col h-full min-h-[300px] animate-fadeInLeft">
                <h3 className="text-neon-cyan font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full" />
                   Signal Intensity
                </h3>
                
                {/* THE LIVE CHART (Using Global Data) */}
                <div className="flex-1 w-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={communityChartData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="time" 
                                stroke="rgba(255,255,255,0.3)" 
                                tick={{fontSize: 10}} 
                                tickLine={false}
                            />
                            <YAxis 
                                stroke="rgba(255,255,255,0.3)" 
                                tick={{fontSize: 10}} 
                                domain={[0, 100]}
                                tickLine={false}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#00f3ff', color: '#fff' }}
                                itemStyle={{ color: '#00f3ff' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#00f3ff" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorValue)" 
                                isAnimationActive={false} 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 flex justify-between text-xs text-gray-400 border-t border-white/10 pt-4">
                    <span>Status: <span className="text-green-400">Stable</span></span>
                    <span>Source: Global Network</span>
                </div>
            </GlassCard>
        </div>

        {/* RIGHT COLUMN: CHAT INTERFACE */}
        <GlassCard className="lg:col-span-2 flex flex-col overflow-hidden border-t-2 border-white/10 shadow-2xl relative animate-fadeInUp">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20 animate-scan z-20 pointer-events-none" />

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin scrollbar-thumb-neon-cyan/20">
            {isLoading ? (
                <div className="text-center text-white/30 text-sm mt-10">Initializing Uplink...</div>
            ) : messages.length === 0 ? (
                <div className="text-center text-white/30 text-sm mt-10">Channel Quiet. Begin Transmission.</div>
            ) : (
                messages.map((msg, index) => {
                  const isMe = msg.user === user?.name; 
                  const isAdmin = msg.user === 'Mission Control';
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`flex items-center gap-2 mb-1 px-1`}>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isMe ? 'text-neon-cyan' : 'text-white/50'}`}>
                          {msg.user}
                        </span>
                        <span className="text-[10px] text-white/30">{msg.timestamp}</span>
                      </div>

                      <div className={`relative px-4 py-3 rounded-2xl max-w-[85%] border transition-all duration-300
                        ${isMe 
                          ? 'bg-neon-cyan/10 border-neon-cyan/30 rounded-tr-none text-white shadow-[0_0_15px_rgba(0,243,255,0.1)]' 
                          : isAdmin 
                          ? 'bg-white/5 border-white/20 rounded-tl-none italic text-neon-cyan/80'
                          : 'bg-white/5 border-white/10 rounded-tl-none text-white/90 hover:border-white/20'
                        }`}
                      >
                        <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  );
                })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form 
              onSubmit={handleSendMessage} 
              className="p-4 bg-black/40 border-t border-white/5 flex gap-3 items-center"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={user ? `Transmit signal as ${user.name}...` : "Login required to transmit"}
                disabled={!user}
                className="w-full bg-white/5 text-white placeholder-white/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <MagneticButton 
              type="submit" 
              variant="primary" 
              className="px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest disabled:opacity-50"
              disabled={!user || !newMessage.trim()}
            >
              Send
            </MagneticButton>
          </form>
        </GlassCard>

      </div>
    </div>
  );
};

export default CommunityPage;