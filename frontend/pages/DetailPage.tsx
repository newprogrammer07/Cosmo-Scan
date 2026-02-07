import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Asteroid, RiskLevel } from '../types';
import { getAsteroidById } from '../services/asteroidService';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import MagneticButton from '../components/MagneticButton';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import RiskIndicator from '../components/RiskIndicator';


const OrbitalScene: React.FC<{ asteroid: Asteroid }> = ({ asteroid }) => {
  const [hovered, setHovered] = useState(false);
  const riskColor = asteroid.risk === RiskLevel.Critical ? '#ef4444' : '#f97316';
  const approach = asteroid.close_approach_data[0];

  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#facc15" />
      
      {/* Sun (Center) - Scale 0.8 */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={2} />
        </mesh>
      </Float>

      {/* Earth Path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.5, 3.53, 128]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Earth Model - Scaled Up to 0.35 */}
      <group position={[3.5, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Asteroid Path */}
      <mesh rotation={[Math.PI / 2.2, 0.2, 0]}>
        <ringGeometry args={[5, 5.04, 128]} />
        <meshBasicMaterial color={riskColor} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Asteroid Model - Rocky Sphere (Detail 2) + Interactive Hover */}
      <group 
        position={[5, 0.8, 0]} 
        onPointerOver={() => setHovered(true)} 
        onPointerOut={() => setHovered(false)}
      >
        <Float speed={5} rotationIntensity={2}>
          <mesh>
            <icosahedronGeometry args={[0.25, 2]} /> 
            <meshStandardMaterial 
              color={hovered ? '#ffffff' : riskColor} 
              flatShading 
              emissive={hovered ? '#ffffff' : riskColor}
              emissiveIntensity={hovered ? 0.5 : 0}
            />
          </mesh>
        </Float>

        {/* ENHANCED HOVER TOOLTIP */}
        {hovered && (
          <Html distanceFactor={10} position={[0, 0.7, 0]} center>
            <div className="bg-black/90 backdrop-blur-xl border-2 border-neon-cyan p-4 rounded-xl shadow-[0_0_30px_rgba(0,243,255,0.4)] w-64 pointer-events-none animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-ping" />
                <p className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.2em]">Target Locked</p>
              </div>
              
              <h3 className="text-white text-base font-black mb-2 border-b border-white/10 pb-1 truncate">
                {asteroid.name.replace(/[()]/g, '')}
              </h3>
              
              <div className="grid grid-cols-1 gap-2 text-[11px] text-gray-200 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500 uppercase">Velocity</span>
                  <span className="font-bold">{Number(approach.relative_velocity_km_s).toFixed(2)} km/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 uppercase">Miss Dist</span>
                  <span className="font-bold text-neon-cyan">{Number(approach.miss_distance_km).toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 uppercase">Hazard</span>
                  <span className={asteroid.is_potentially_hazardous_asteroid ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                    {asteroid.is_potentially_hazardous_asteroid ? "TRUE" : "FALSE"}
                  </span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>

      <OrbitControls enablePan={false} maxDistance={18} minDistance={4} makeDefault />
    </>
  );
};


const riskMeterColor = (risk: RiskLevel): string => {
  switch (risk) {
    case RiskLevel.None: return 'bg-slate-500';
    case RiskLevel.Low: return 'bg-emerald-500';
    case RiskLevel.Moderate: return 'bg-amber-500';
    case RiskLevel.High: return 'bg-orange-500';
    case RiskLevel.Critical: return 'bg-red-500';
    default: return 'bg-slate-700';
  }
};


const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asteroid, setAsteroid] = useState<Asteroid | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { user } = useAuthStore();

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      const data = await getAsteroidById(id);
      if (data) setAsteroid(data);
      else navigate('/dashboard');
      setLoading(false);
    };
    fetchData();
  }, [id, navigate]);

  
  const handleAddToWatchlist = async () => {
    if (!asteroid || !user) return alert("Please log in.");
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
        if (res.ok) alert(`✅ ${asteroid.name} added to Watchlist!`);
        else alert(`⚠️ ${data.message || "Failed to add"}`);
    } catch (error) {
        console.error(error);
        alert("Server error.");
    }
  };

  
  const handleCreateAlert = async () => {
    if (!asteroid || !user) return alert("Please log in.");
    try {
        const res = await fetch('http://localhost:5000/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `Proximity Alert: ${asteroid.name}`,
                threshold: 75,
                email: user.email
            })
        });
        
        if (res.ok) {
            alert(`🚨 Alert System Configured for ${asteroid.name}`);
            navigate('/alerts');
        } else {
            alert("Failed to create alert.");
        }
    } catch (error) {
        console.error(error);
        alert("Server error.");
    }
  };

  if (loading) return <Loader />;
  if (!asteroid) return null;

  const approach = asteroid.close_approach_data[0];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4 md:p-6 lg:pl-28 gap-6 bg-transparent text-slate-100 font-sans">
      
      {/* Left Panel: Detailed Telemetry */}
      <div className="w-full lg:w-2/5 xl:w-1/3 z-10 animate-fadeIn">
        <GlassCard className="h-full flex flex-col border-t-2 border-white/10">
          <button 
            onClick={() => navigate(-1)} 
            className="text-xs uppercase tracking-widest text-neon-cyan mb-6 flex items-center gap-2 hover:opacity-70 transition-opacity font-bold"
          >
            &larr; Return to Base
          </button>
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic mb-2 leading-none">
              {asteroid.name.replace(/[()]/g, '')}
            </h1>
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${asteroid.is_potentially_hazardous_asteroid ? 'bg-red-500 animate-pulse' : 'bg-neon-cyan'}`} />
                <p className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 font-bold">
                    Object Classification: {asteroid.is_potentially_hazardous_asteroid ? 'Hazardous Threat' : 'Non-Threatening NEO'}
                </p>
            </div>
          </div>
          
          {/* --- THREAT ASSESSMENT SECTION (NEW SCORE BAR) --- */}
          <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Threat Assessment</h2>
              <div className="flex items-center gap-2">
                 <span className={`text-xl font-black ${asteroid.risk === 'Critical' ? 'text-red-500' : 'text-white'}`}>
                    {asteroid.risk_score || 0}/100
                 </span>
                 <RiskIndicator risk={asteroid.risk} />
              </div>
            </div>
            
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden relative">
               <div className="absolute inset-0 flex justify-between px-1">
                   {[...Array(10)].map((_, i) => <div key={i} className="w-px h-full bg-black/20" />)}
               </div>
               
              <div 
                className={`h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.4)] ${
                    (asteroid.risk_score || 0) > 80 ? 'bg-red-500' : 
                    (asteroid.risk_score || 0) > 50 ? 'bg-orange-500' : 
                    (asteroid.risk_score || 0) > 20 ? 'bg-yellow-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${asteroid.risk_score || 5}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-right uppercase font-bold tracking-widest">
                Calculated via Multi-Variable Risk Engine
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-8">
            <DataBlock label="Min Diameter" value={`${asteroid.estimated_diameter_km.min.toFixed(3)} km`} />
            <DataBlock label="Max Diameter" value={`${asteroid.estimated_diameter_km.max.toFixed(3)} km`} />
            <DataBlock label="Velocity" value={`${Number(approach.relative_velocity_km_s).toFixed(2)} km/s`} />
            <DataBlock label="Approach Date" value={approach.close_approach_date_full} />
            <div className="col-span-1 sm:col-span-2">
                <DataBlock 
                    label="Miss Distance" 
                    value={`${Number(approach.miss_distance_km).toLocaleString()} km`} 
                    highlight 
                />
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <MagneticButton 
                onClick={handleAddToWatchlist} 
                variant="primary" 
                className="py-4 text-xs font-black uppercase tracking-widest"
            >
                Add to watchlist
            </MagneticButton>
            
            <MagneticButton 
                onClick={handleCreateAlert} 
                variant="secondary" 
                className="py-4 text-xs font-black uppercase tracking-widest border-white/10"
            >
                Configure Alert
            </MagneticButton>
          </div>
        </GlassCard>
      </div>

      {/* Right Panel: Immersive 3D Visualization */}
      <div className="w-full lg:w-3/5 xl:w-2/3 min-h-[500px] lg:h-auto animate-fadeIn" style={{animationDelay: '300ms'}}>
        <GlassCard className="h-full p-0 relative overflow-hidden bg-black/40 shadow-2xl">
            <div className="absolute top-6 left-6 z-20">
                <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">Orbital Simulation</h2>
                <p className="text-[10px] text-neon-cyan font-bold uppercase tracking-widest opacity-60">Hover target for Telemetry</p>
            </div>
            
            <div className="w-full h-full cursor-grab active:cursor-grabbing">
                <Canvas shadows>
                    <PerspectiveCamera makeDefault position={[0, 10, 15]} fov={50} />
                    <Suspense fallback={null}>
                        <OrbitalScene asteroid={asteroid} />
                    </Suspense>
                </Canvas>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end pointer-events-none">
                <div className="space-y-2">
                    <LegendItem color="bg-yellow-400" label="Sol (Sun)" />
                    <LegendItem color="bg-blue-500" label="Terra (Earth)" />
                    <LegendItem color={asteroid.risk === RiskLevel.Critical ? "bg-red-500" : "bg-orange-500"} label="Target NEO" />
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter max-w-[180px] text-right"> Orbit normalized for visualization.
                </p>
            </div>
        </GlassCard>
      </div>
    </div>
  );
};


const DataBlock: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
    <div className={`p-4 rounded-2xl border ${highlight ? 'border-neon-cyan/30 bg-neon-cyan/5' : 'border-white/5 bg-white/[0.02]'} transition-colors hover:border-white/10`}>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{label}</p>
        <p className="text-sm md:text-base font-bold text-white tabular-nums leading-none">{value}</p>
    </div>
);

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
    </div>
);

export default DetailPage;
