import React, { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { DashboardIcon, AlertIcon, CommunityIcon } from './icons'; // Ensure icons are imported
import { useAppStore } from '../store/useAppStore';
import { useAlertStore } from '../store/useAlertStore'; // <--- NEW STORE

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { isCommandCenterMode, isDemoMode } = useAppStore();
  const { alerts, fetchAlerts } = useAlertStore(); // <--- Get alerts

  // Fetch alerts when layout loads so the badge is accurate
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Calculate active alerts count
  const activeAlertsCount = alerts.filter(a => a.enabled).length;

  const showNav = !(isCommandCenterMode && location.pathname === '/dashboard');

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    // --- NEW WATCHLIST ITEM ---
  { path: '/watchlist', label: 'Watchlist', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ) 
  },
  // --------------------------
    { 
      path: '/alerts', 
      label: 'Alerts', 
      icon: (
        <div className="relative">
          <AlertIcon />
          {/* NOTIFICATION BADGE */}
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] items-center justify-center text-white font-bold">
                {activeAlertsCount}
              </span>
            </span>
          )}
        </div>
      ) 
    },
    { path: '/community', label: 'Community', icon: <CommunityIcon /> },
  ];

  return (
    <>
      <main className="relative z-10 pb-20 md:pb-0 flex-grow">
        <Outlet />
      </main>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 md:left-4 md:bottom-1/2 md:transform md:translate-y-1/2 md:right-auto z-50 glassmorphism rounded-t-2xl md:rounded-full p-2 md:p-4">
          <ul className="flex justify-around items-center md:flex-col md:space-y-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center w-16 h-16 md:w-12 md:h-12 rounded-full transition-all duration-300 group ${
                      isActive ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <span className="w-6 h-6">{item.icon}</span>
                  <span className="text-xs mt-1 md:hidden">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
};

export default AppLayout;