import React from 'react';
import { Home, Dumbbell, User } from 'lucide-react';
import { Screen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeScreen, onNavigate }) => {
  return (
    <div className="flex flex-col h-screen bg-neon-dark text-gray-200 overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
        <div className="max-w-md mx-auto min-h-full">
            {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 pb-safe z-50">
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4">
          <button
            onClick={() => onNavigate('HOME')}
            className={`flex flex-col items-center justify-center space-y-1 w-16 transition-all duration-300 ${
              activeScreen === 'HOME' ? 'text-neon-bright scale-110' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Home size={24} />
            <span className="text-[10px] font-medium tracking-wide">INÍCIO</span>
          </button>
          
          <button
            onClick={() => onNavigate('WORKOUT')}
            className={`flex flex-col items-center justify-center space-y-1 w-16 transition-all duration-300 ${
              activeScreen === 'WORKOUT' ? 'text-neon-bright scale-110' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className={`p-2 rounded-full ${activeScreen === 'WORKOUT' ? 'bg-neon-purple/20' : ''}`}>
                <Dumbbell size={24} />
            </div>
            <span className="text-[10px] font-medium tracking-wide">TREINO</span>
          </button>

          <button
            onClick={() => onNavigate('PROFILE')}
            className={`flex flex-col items-center justify-center space-y-1 w-16 transition-all duration-300 ${
              activeScreen === 'PROFILE' ? 'text-neon-bright scale-110' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <User size={24} />
            <span className="text-[10px] font-medium tracking-wide">PERFIL</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;