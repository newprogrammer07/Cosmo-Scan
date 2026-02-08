import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import MagneticButton from '../components/MagneticButton';
import { useAlertStore } from '../store/useAlertStore'; 
import { TrashIcon, BellIcon, ShieldAlertIcon } from '../components/icons';

const AlertsPage: React.FC = () => {
    
    const { alerts, fetchAlerts, addAlert, toggleAlert, deleteAlert } = useAlertStore();
    const [threshold, setThreshold] = useState(50);

    
    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleCreateAlert = () => {
        addAlert(`Alert Signal: THRESHOLD > ${threshold}%`, threshold);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 lg:pl-32 min-h-screen text-slate-100 font-mono selection:bg-neon-cyan/30">
            <header className="mb-8 md:mb-12 animate-fadeInDown flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6">
                <div className="w-full">
                    <div className="flex items-center gap-3 text-neon-cyan mb-2">
                        <BellIcon className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                        <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">Security Protocol</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                        Alert <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white">Perimeter</span>
                    </h1>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 md:gap-8">
                {/* CREATE ALERT FORM */}
                <div className="xl:col-span-2 animate-fadeInLeft order-2 xl:order-1">
                    <GlassCard className="border-l-2 border-neon-cyan relative overflow-hidden h-full">
                        <div className="space-y-6 md:space-y-8">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <label className="block mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                    Risk Sensitivity: <span className="text-neon-cyan text-lg ml-2">{threshold}%</span>
                                </label>
                                <input
                                    type="range" min="0" max="100" value={threshold}
                                    onChange={(e) => setThreshold(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
                                />
                            </div>
                            <MagneticButton onClick={handleCreateAlert} variant="primary" className="w-full py-4 uppercase font-black tracking-widest text-xs shadow-lg">
                                Initialize Alert
                            </MagneticButton>
                        </div>
                    </GlassCard>
                </div>

                {/* ALERT LIST */}
                <div className="xl:col-span-3 animate-fadeInRight order-1 xl:order-2">
                    <GlassCard className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold uppercase italic">Active Sentinel Feed</h2>
                            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-500 font-bold uppercase">
                                Nodes: {alerts.length}
                            </span>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {alerts.map((alert) => (
                                <div key={alert.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${alert.enabled ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-50'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-1 h-8 rounded-full ${alert.enabled ? 'bg-neon-cyan shadow-[0_0_10px_#00f3ff]' : 'bg-slate-700'}`} />
                                        <div>
                                            <p className="font-bold uppercase text-sm tracking-tight">{alert.name}</p>
                                            <p className="text-[10px] font-bold text-neon-cyan/60 uppercase">Trigger: {alert.threshold}% Risk</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => deleteAlert(alert.id)} className="text-slate-600 hover:text-red-500">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                        <input type="checkbox" checked={alert.enabled} onChange={() => toggleAlert(alert.id, alert.enabled)} className="accent-neon-cyan w-5 h-5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default AlertsPage;
