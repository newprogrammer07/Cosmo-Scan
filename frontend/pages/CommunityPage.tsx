import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../components/GlassCard';
import MagneticButton from '../components/MagneticButton';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { io, Socket } from 'socket.io-client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

/* ===================== TYPES ===================== */
interface Message {
  id?: number;
  user: string;
  text: string;
  timestamp: string;
}

const BACKEND_URL = 'https://cosmic-backend-fibq.onrender.com';

const CommunityPage: React.FC = () => {
  const { user } = useAuthStore();
  const { communityChartData, addChartPoint } = useAppStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  /* ===================== INIT SOCKET (ONCE) ===================== */
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      path: '/socket.io',
     
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🟢 Socket connected:', socket.id);
    });

    socket.on('receive_message', (msg: Message) => {
      setMessages(prev => {
        // prevent duplicates
        if (msg.id && prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  /* ===================== FETCH HISTORY ===================== */
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/messages`);
        const contentType = res.headers.get('content-type');

        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid JSON response');
        }

        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  /* ===================== AUTO SCROLL ===================== */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ===================== LIVE CHART ===================== */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString('en-IN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      addChartPoint({
        time: now,
        value: Math.floor(Math.random() * 60) + 40,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [addChartPoint]);

  /* ===================== SEND MESSAGE ===================== */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      user: user.name,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    setNewMessage('');
  };

  /* ===================== UI ===================== */
  return (
    <div className="p-4 md:p-8 md:pl-28 min-h-screen flex flex-col bg-transparent font-mono">

      {/* HEADER */}
      <header className="mb-6 border-b border-white/10 pb-4">
        <h1 className="text-3xl md:text-5xl font-black uppercase italic text-white">
          Community <span className="text-neon-cyan">Nexus</span>
        </h1>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">

        {/* LEFT: LIVE CHART */}
        <GlassCard className="p-6 flex flex-col min-h-[300px]">
          <h3 className="text-neon-cyan text-sm font-bold uppercase tracking-widest mb-4">
            Signal Intensity
          </h3>

          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={communityChartData}>
                <defs>
                  <linearGradient id="signal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#00f3ff"
                  fill="url(#signal)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* RIGHT: CHAT */}
        <GlassCard className="lg:col-span-2 flex flex-col overflow-hidden">

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <p className="text-white/40 text-center mt-10">Loading channel...</p>
            ) : messages.length === 0 ? (
              <p className="text-white/40 text-center mt-10">No messages yet</p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.user === user?.name;
                return (
                  <div
                    key={msg.id ?? `${msg.user}-${msg.timestamp}`}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-xl text-sm
                        ${isMe
                          ? 'bg-neon-cyan/20 text-white'
                          : 'bg-white/10 text-white/90'
                        }`}
                    >
                      <div className="text-[10px] opacity-60 mb-1">
                        {msg.user} • {msg.timestamp}
                      </div>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-white/10 flex gap-3"
          >
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={user ? `Message as ${user.name}` : 'Login to chat'}
              disabled={!user}
              className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl outline-none"
            />
            <MagneticButton
              type="submit"
              disabled={!user || !newMessage.trim()}
              className="px-6 py-3 rounded-xl"
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
