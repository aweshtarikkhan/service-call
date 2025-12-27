
import React from 'react';
import { Home, Search, ClipboardList, User } from 'lucide-react';
import type { ViewState } from '../types';

interface MobileBottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isLoggedIn: boolean;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, onNavigate, isLoggedIn }) => {
  const navItems = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'SEARCH_RESULTS', label: 'Search', icon: Search },
    { id: 'DASHBOARD', label: isLoggedIn ? 'Account' : 'Login', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 flex justify-between items-center z-50 pb-[env(safe-area-inset-bottom)] h-[calc(64px+env(safe-area-inset-bottom))] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id || (item.id === 'DASHBOARD' && currentView === 'DASHBOARD');
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as ViewState)}
            className={`flex flex-col items-center justify-center gap-1 h-16 transition-colors ${
              isActive ? 'text-accent' : 'text-slate-400'
            }`}
          >
            <Icon size={20} fill={isActive ? 'currentColor' : 'none'} fillOpacity={isActive ? 0.2 : 1} />
            <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;