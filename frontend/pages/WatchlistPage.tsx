import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import { TrashIcon, ChevronRightIcon } from '../components/icons'; 
import { useAuthStore } from '../store/useAuthStore';
import RiskIndicator from '../components/RiskIndicator';
import { RiskLevel } from '../types';


const riskGlowMap: Record<string, string> = {
    "None": 'shadow-sm border-gray-500/30',
    "Low": 'shadow-[0_0_10px_rgba(34,197,94,0.2)] border-green-500/40',
    "Moderate": 'shadow-[0_0_10px_rgba(234,179,8,0.2)] border-yellow-500/40',
    "High": 'shadow-[0_0_15px_rgba(249,115,22,0.3)] border-orange-500/50',
    "Critical": 'shadow-[0_0_20px_rgba(239,68,68,0.4)] border-red-500 animate-pulse',
};

interface WatchlistItem {
    id: number;
    asteroidId: string;
    name: string;
    risk: string;
    date: string;
}

const WatchlistPage: React.FC = () => {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // 1. Fetch Watchlist on Load
    useEffect(() => {
        if (!user) return;
        const fetchWatchlist = async () => {
            try {
                const res = await fetch(`http://localhost:5000/watchlist?email=${user.email}`);
                const data = await res.json();
                setWatchlist(data);
            } catch (error) {
                console.error("Failed to load watchlist", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWatchlist();
    }, [user]);

    
    const removeFromWatchlist = async (id: number) => {
        if (!confirm("Stop tracking this object?")) return;
        try {
            await fetch(`http://localhost:5000/watchlist/${id}`, { method: 'DELETE' });
            setWatchlist(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to remove", error);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-4 md:p-8 lg:pl-32 min-h-screen text-slate-100 font-sans">
            <header className="mb-12 animate-fadeInDown">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Mission Watchlist
                </h1>
                <p className="text-slate-400 font-medium mt-2">
                    Tracking <span className="text-neon-cyan font-bold">{watchlist.length}</span> priority targets.
                </p>
            </header>

            {watchlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500">
                    <p className="uppercase tracking-widest font-bold">No Targets Designated</p>
                    <button onClick={() => navigate('/dashboard')} className="mt-4 text-neon-cyan hover:underline text-sm uppercase font-bold">
                        Return to Dashboard
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {watchlist.map((item) => (
                        <div key={item.id} className="animate-fadeInUp">
                            <GlassCard className={`relative flex flex-col h-full border-t-2 ${riskGlowMap[item.risk] || riskGlowMap['None']}`}>
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{item.name.replace(/[()]/g, '')}</h2>
                                        <RiskIndicator risk={item.risk as RiskLevel} className="mt-1" />
                                    </div>
                                    <button 
                                        onClick={() => removeFromWatchlist(item.id)}
                                        className="text-slate-600 hover:text-red-500 transition-colors p-2"
                                        title="Remove from Watchlist"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mt-auto pt-4 border-t border-white/5">
                                    <div className="flex justify-between text-xs font-medium mb-4">
                                        <span className="text-slate-500 uppercase tracking-widest">Impact / Approach</span>
                                        <span className="text-slate-200">{item.date}</span>
                                    </div>
                                    
                                    <button
                                        onClick={() => navigate(`/object/${item.asteroidId}`)}
                                        className="w-full bg-slate-800 hover:bg-neon-cyan hover:text-black text-slate-300 text-xs font-bold uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        View Telemetry <ChevronRightIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            </GlassCard>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatchlistPage;