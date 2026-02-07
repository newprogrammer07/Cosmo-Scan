import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MagneticButton from '../components/MagneticButton';
import GlassCard from '../components/GlassCard';
import { ChevronRightIcon } from '../components/icons';
import { getAsteroids } from '../services/geminiService';
import { Asteroid, RiskLevel } from '../types';

const EarthScroll = lazy(() => import('../components/EarthScroll'));

const riskColorMap: Record<RiskLevel, string> = {
  [RiskLevel.None]: 'border-gray-500',
  [RiskLevel.Low]: 'border-green-500',
  [RiskLevel.Moderate]: 'border-yellow-500',
  [RiskLevel.High]: 'border-orange-500',
  [RiskLevel.Critical]: 'border-red-500',
};

const riskTextColorMap: Record<RiskLevel, string> = {
  [RiskLevel.None]: 'text-gray-400',
  [RiskLevel.Low]: 'text-green-400',
  [RiskLevel.Moderate]: 'text-yellow-400',
  [RiskLevel.High]: 'text-orange-400',
  [RiskLevel.Critical]: 'text-red-400',
};


const Footer = () => (
  <footer className="relative z-50 py-12 px-4 md:px-8 border-t border-white/10 bg-black">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="md:col-span-2">
        <h3 className="text-2xl font-black tracking-tighter uppercase text-white">
          COSMOSCAN
        </h3>
        <p className="mt-4 text-gray-400 max-w-sm">
          Intelligent asteroid monitoring & risk analysis platform.
        </p>
      </div>
      <div>
        <h4 className="font-bold text-white mb-4">Navigation</h4>
        <ul className="space-y-2 text-gray-400">
          <li><a href="#" className="hover:text-neon-cyan transition-colors">Home</a></li>
          <li><a href="/dashboard" className="hover:text-neon-cyan transition-colors">Dashboard</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-white mb-4">Resources</h4>
        <ul className="space-y-2 text-gray-400">
          <li><a href="#" className="hover:text-neon-cyan transition-colors">API Docs</a></li>
          <li><a href="#" className="hover:text-neon-cyan transition-colors">Contact</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
      © 2026 CosmoScan. All rights reserved.
    </div>
  </footer>
);


const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [liveAsteroids, setLiveAsteroids] = useState<Asteroid[]>([]);

  useEffect(() => {
    getAsteroids().then(data => setLiveAsteroids(data.slice(0, 3)));
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-x-hidden text-white">
      
      {/* 1. BACKGROUND */}
      <Suspense fallback={<div className="fixed inset-0 bg-[#050505] -z-50" />}>
        <EarthScroll />
      </Suspense>

      {/* 2. INITIAL OVERLAY (Forced on top of the first screen) */}
      <div className="absolute inset-0 h-screen w-full z-40 flex flex-col items-center justify-end pb-32 pointer-events-none">
         <div className="flex flex-col items-center gap-4 animate-bounce pointer-events-auto cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
             onClick={() => scrollTo('hero-title')}>
            
            <p className="text-sm md:text-lg uppercase tracking-[0.3em] text-neon-cyan font-semibold drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] text-center px-4">
              Scroll down to explore the Space
            </p>
            
            <div className="w-6 h-10 border-2 border-neon-cyan/80 rounded-full flex justify-center pt-2 box-border shadow-[0_0_10px_rgba(0,255,255,0.3)] bg-black/20 backdrop-blur-sm">
                <div className="w-1 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
            </div>
        </div>
      </div>

      {/* 3. SPACER FOR FIRST SCREEN */}
      <div className="w-full h-screen relative z-0 pointer-events-none" />

      {/* 4. HERO TITLE SECTION */}
      <section id="hero-title" className="relative w-full min-h-screen flex flex-col items-center justify-center z-10">
        <div className="text-center animate-fadeIn px-4 mt-[-10vh]">
          <h1 className="text-5xl md:text-9xl font-black tracking-tighter uppercase drop-shadow-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-electric-purple">
              COSMO
            </span>{' '}
            SCAN
          </h1>

          <p className="mt-6 text-xl md:text-3xl max-w-3xl mx-auto font-light text-gray-200 drop-shadow-md">
            Intelligent Asteroid Monitoring Platform
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
            <MagneticButton onClick={() => navigate('/dashboard')} variant="primary">
              Enter Command Center
            </MagneticButton>
            <MagneticButton onClick={() => scrollTo('how-it-works')} variant="secondary">
              How It Works
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* 5. CONTENT SECTIONS */}
      <div className="relative z-20 bg-gradient-to-b from-transparent via-black/80 to-black backdrop-blur-[2px]">
        
        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">How We Track The Cosmos</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <GlassCard>
                <h3 className="text-2xl font-bold text-neon-cyan mb-2">1. Data Aggregation</h3>
                <p className="text-gray-300">Ingesting real-time telemetry from NASA & ESA observatories.</p>
              </GlassCard>
              <GlassCard>
                <h3 className="text-2xl font-bold text-neon-cyan mb-2">2. AI Analysis</h3>
                <p className="text-gray-300">Predicting trajectories and calculating impact risks with AI.</p>
              </GlassCard>
              <GlassCard>
                <h3 className="text-2xl font-bold text-neon-cyan mb-2">3. Instant Alerts</h3>
                <p className="text-gray-300">Real-time notifications for potential hazardous objects.</p>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* Live Asteroid Preview */}
        <section className="py-24 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Live Asteroid Preview</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {liveAsteroids.length > 0 ? liveAsteroids.map((asteroid) => (
                <GlassCard key={asteroid.id} className={`border-l-4 ${riskColorMap[asteroid.risk]}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{asteroid.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${riskTextColorMap[asteroid.risk]} bg-gray-800`}>
                      {asteroid.is_potentially_hazardous_asteroid ? 'PHA' : 'NEO'}
                    </span>
                  </div>
                  <div className="text-sm space-y-2 text-gray-300">
                    <p>Risk Level: <span className={riskTextColorMap[asteroid.risk]}>{asteroid.risk}</span></p>
                    <p>Diameter: {asteroid.estimated_diameter_km.min.toFixed(2)} - {asteroid.estimated_diameter_km.max.toFixed(2)} km</p>
                  </div>
                  <button onClick={() => navigate(`/object/${asteroid.id}`)} className="mt-4 text-neon-cyan text-sm font-bold flex items-center group">
                    VIEW ORBIT <ChevronRightIcon className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                  </button>
                </GlassCard>
              )) : (
                <p className="col-span-3 text-center text-gray-500 animate-pulse">Scanning deep space network...</p>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 text-center">
            <div className="max-w-3xl mx-auto glassmorphism p-12 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-electric-purple" />
                <h2 className="text-4xl font-bold mb-6">Enter Command Center</h2>
                <p className="text-gray-300 mb-8 text-lg">Access full monitoring tools and custom alerts.</p>
                <MagneticButton onClick={() => navigate('/auth/sign-up')} variant="primary">
                    Create Free Account
                </MagneticButton>
            </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
