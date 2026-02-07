import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asteroid, RiskLevel } from '../types';
import { getAsteroids } from '../services/asteroidService';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import { ChevronRightIcon, CommandCenterIcon, PresentationIcon, HelpIcon, LogoutIcon } from '../components/icons';
import { useAppStore } from '../store/useAppStore';
import { useTourStore } from '../store/useTourStore';
import { useAuthStore } from '../store/useAuthStore';
import RiskIndicator from '../components/RiskIndicator';
import LivePulseIndicator from '../components/LivePulseIndicator';


const riskGlowMap: Record<RiskLevel, string> = {
    [RiskLevel.None]: 'shadow-sm border-gray-500/30',
    [RiskLevel.Low]: 'shadow-[0_0_10px_rgba(34,197,94,0.2)] border-green-500/40',
    [RiskLevel.Moderate]: 'shadow-[0_0_10px_rgba(234,179,8,0.2)] border-yellow-500/40',
    [RiskLevel.High]: 'shadow-[0_0_15px_rgba(249,115,22,0.3)] border-orange-500/50',
    [RiskLevel.Critical]: 'shadow-[0_0_20px_rgba(239,68,68,0.4)] border-red-500 animate-pulse',
};

const DashboardPage: React.FC = () => {
    
    const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [riskFilter, setRiskFilter] = useState<RiskLevel | 'All'>('All');

    const navigate = useNavigate();
    const { 
        isCommandCenterMode, 
        toggleCommandCenterMode, 
        setCommandCenterMode, 
        isDemoMode, 
        toggleDemoMode, 
        liveDataStatus, 
        setLiveDataStatus 
    } = useAppStore();
    
    const startTour = useTourStore((state) => state.startTour);
    const { user, logout } = useAuthStore();

    
    const filteredAsteroids = useMemo(() => {
        return asteroids.filter((asteroid) => {
            const matchesSearch = asteroid.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRisk = riskFilter === 'All' || asteroid.risk === riskFilter;
            return matchesSearch && matchesRisk;
        });
    }, [asteroids, searchQuery, riskFilter]);

    
    const addToWatchlist = async (asteroid: Asteroid) => {
        if (!user) return alert("Please log in to use features.");
        try {
            const res = await fetch('http://localhost:5000/watchlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asteroidId: asteroid.id,
                    name: asteroid.name,
                    risk: asteroid.risk,
                    date: asteroid.close_approach_data[0].close_approach_date_full,
                    email: user.email
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`✅ ${asteroid.name} added to Watchlist!`);
            } else {
                alert(`⚠️ ${data.message || "Could not add to watchlist"}`);
            }
        } catch (error) {
            console.error("Watchlist Error:", error);
            alert("Failed to connect to server.");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const fetchData = useCallback(async () => {
        setLiveDataStatus('live');
        try {
            const data = await getAsteroids();
            setAsteroids(data);
            setLiveDataStatus('idle');
        } catch (error) {
            console.error("Failed to fetch asteroid data:", error);
            setLiveDataStatus('error');
        }
    }, [setLiveDataStatus]);

    
    useEffect(() => {
        setLoading(true);
        fetchData().finally(() => setLoading(false));
        const intervalId = setInterval(fetchData, 30000);
        return () => clearInterval(intervalId);
    }, [fetchData, isDemoMode]);

    useEffect(() => {
        const handleFullscreenChange = () => { if (!document.fullscreenElement) setCommandCenterMode(false); };
        if (isCommandCenterMode) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else if (document.fullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen();
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [isCommandCenterMode, setCommandCenterMode]);

    if (loading) return <Loader />;

    return (
        <div className={`min-h-screen text-slate-100 font-sans transition-all duration-500 ${isCommandCenterMode ? 'p-2 bg-black' : 'p-4 md:p-8 lg:pl-24'}`}>
            
            {/* --- Header Section --- */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 animate-fadeInDown">
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Neo Command
                        </h1>
                        <LivePulseIndicator status={liveDataStatus} />
                    </div>
                    <p className="text-slate-400 font-medium text-sm md:text-base">
                        Welcome back, <span className="text-neon-cyan">{user?.name || 'Commander'}</span>. Live feed of Near-Earth Objects(NEOs).
                    </p>
                </div>

                <CosmicClock />

                <div className="flex items-center bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/50 shadow-xl">
                    <NavBtn icon={<HelpIcon />} onClick={startTour} label="Guide" />
                    <NavBtn icon={<PresentationIcon />} onClick={toggleDemoMode} active={isDemoMode} color="text-purple-400" label="Demo" />
                    <NavBtn icon={<CommandCenterIcon />} onClick={toggleCommandCenterMode} active={isCommandCenterMode} color="text-neon-cyan" label="Focus" />
                    <div className="w-px h-6 bg-slate-700 mx-2" />
                    <NavBtn icon={<LogoutIcon />} onClick={handleLogout} label="Exit" />
                </div>
            </header>

            {/* --- Search & Filter Toolbar --- */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fadeIn">
                <div className="relative flex-1 group">
                    <input 
                        type="text"
                        placeholder="Search object by name (e.g. 2024 BX)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all placeholder:text-slate-600"
                    />
                    <div className="absolute right-4 top-3.5 text-slate-500 pointer-events-none uppercase text-[10px] font-bold tracking-widest group-focus-within:text-neon-cyan transition-colors">
                        Search
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Filter Risk:</span>
                    <select 
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value as any)}
                        className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer text-neon-cyan"
                    >
                        <option value="All" className="bg-slate-900 text-white">All Levels</option>
                        {Object.values(RiskLevel).map(level => (
                            <option key={level} value={level} className="bg-slate-900 text-white">{level}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center px-6 bg-slate-800/40 rounded-xl border border-slate-700/30">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nodes Found: {filteredAsteroids.length}</span>
                </div>
            </div>

            {/* --- Asteroid Grid --- */}
            <div className={`grid gap-6 ${isCommandCenterMode ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'}`}>
                {filteredAsteroids.map((asteroid, index) => (
                    <div key={asteroid.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
                        <GlassCard className={`group relative flex flex-col h-full transition-all duration-300 hover:translate-y-[-4px] border-t-2 ${riskGlowMap[asteroid.risk]}`}>
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className="max-w-[70%]">
                                    <h2 className="text-xl font-bold truncate text-white group-hover:text-neon-cyan transition-colors">
                                        {asteroid.name.replace(/[()]/g, '')}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                            (asteroid.risk_score || 0) > 50 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                            SCORE: {asteroid.risk_score || 0}
                                        </div>
                                        <RiskIndicator risk={asteroid.risk} />
                                    </div>
                                </div>
                                <span className={`shrink-0 px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-wider ${asteroid.is_potentially_hazardous_asteroid ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                    {asteroid.is_potentially_hazardous_asteroid ? 'Hazard' : 'Secure'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-700/30 my-4">
                                <TelemetryItem 
                                    label="Velocity" 
                                    value={Number(asteroid.close_approach_data[0].relative_velocity_km_s).toFixed(1)} 
                                    unit="km/s" 
                                />
                                <TelemetryItem 
                                    label="Proximity" 
                                    value={(Number(asteroid.close_approach_data[0].miss_distance_km) / 1e6).toFixed(2)} 
                                    unit="m km" 
                                />
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-500 uppercase tracking-widest">Approach Date</span>
                                    <span className="text-slate-200">{asteroid.close_approach_data[0].close_approach_date_full}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/object/${asteroid.id}`)}
                                        className="flex-[3] bg-neon-cyan hover:bg-white text-black text-xs font-bold uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        Analysis <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => addToWatchlist(asteroid)}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all flex items-center justify-center text-lg active:scale-95 border border-slate-700"
                                        title="Add to Watchlist"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                ))}
            </div>

            {/* --- Empty State --- */}
            {filteredAsteroids.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-slate-500 animate-fadeIn">
                    <div className="text-4xl mb-4">🛰️</div>
                    <p className="text-xl font-bold italic text-slate-400">No signals detected in this sector.</p>
                    <p className="text-sm mt-2">Adjust your filters or search query to find other Near-Earth Objects.</p>
                    <button 
                        onClick={() => {setSearchQuery(''); setRiskFilter('All');}}
                        className="mt-6 text-neon-cyan text-xs font-black uppercase tracking-widest hover:underline"
                    >
                        Reset Search Parameters
                    </button>
                </div>
            )}
        </div>
    );
};



const NavBtn: React.FC<{ icon: React.ReactNode, onClick: () => void, active?: boolean, color?: string, label: string }> = ({ icon, onClick, active, color, label }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${active ? `${color} bg-white/5 shadow-inner` : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
    >
        <div className="w-5 h-5">{icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
);

const TelemetryItem: React.FC<{ label: string, value: string, unit: string }> = ({ label, value, unit }) => (
    <div>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{label}</p>
        <p className="text-xl font-bold text-slate-100 tabular-nums">
            {value}<span className="text-[11px] text-neon-cyan/80 ml-1 font-medium">{unit}</span>
        </p>
    </div>
);

const CosmicClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const utcTime = time.toUTCString().split(' ')[4];

    return (
        <div className="flex flex-col items-center justify-center px-4 py-2 rounded-xl 
                        bg-slate-900/60 backdrop-blur-md border border-neon-cyan/30 
                        shadow-[0_0_20px_rgba(34,211,238,0.25)]">
            <span className="text-[10px] tracking-widest uppercase text-neon-cyan font-bold">
                Mission Time (UTC)
            </span>
            <span className="text-2xl font-extrabold text-white tabular-nums">
                {utcTime}
            </span>
        </div>
    );
};

export default DashboardPage;
