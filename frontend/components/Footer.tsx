
import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from './icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/30 border-t border-white/10 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <h2 className="text-xl font-bold text-white tracking-tighter">
              COSMIC WATCH
            </h2>
            <p className="mt-2 max-w-sm">
              An Intelligent Asteroid Monitoring, Risk Analysis & Space Awareness Platform.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase">Navigate</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="hover:text-neon-cyan transition-colors">Home</Link></li>
              <li><Link to="/dashboard" className="hover:text-neon-cyan transition-colors">Dashboard</Link></li>
              <li><Link to="/alerts" className="hover:text-neon-cyan transition-colors">Alerts</Link></li>
              <li><Link to="/community" className="hover:text-neon-cyan transition-colors">Community</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-neon-cyan transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Data Sources</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Contact</a></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <h3 className="font-semibold text-white tracking-wider uppercase">Follow Us</h3>
            <div className="flex mt-4 space-x-4">
              <a href="#" className="hover:text-white transition-colors"><TwitterIcon /></a>
              <a href="#" className="hover:text-white transition-colors"><FacebookIcon /></a>
              <a href="#" className="hover:text-white transition-colors"><InstagramIcon /></a>
              <a href="#" className="hover:text-white transition-colors"><YoutubeIcon /></a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Cosmic Watch. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
