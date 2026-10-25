import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  FlaskConical,
  BookOpen,
  Activity,
  HeartPulse,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'live-queue'
  | 'register'
  | 'records'
  | 'analytics'
  | 'simulation'
  | 'architecture';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  waitingCount: number;
  inTreatmentCount: number;
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  waitingCount,
  inTreatmentCount,
  isConnected,
}) => {
  const navItems: { tab: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
    {
      tab: 'live-queue',
      label: 'Live Priority Queue',
      icon: <Activity className="w-4 h-4 mr-2" />,
      badge: waitingCount,
    },
    { tab: 'register', label: 'Register Patient', icon: <UserPlus className="w-4 h-4 mr-2" /> },
    { tab: 'records', label: 'Patient Records', icon: <Users className="w-4 h-4 mr-2" /> },
    { tab: 'analytics', label: 'Waiting Analytics', icon: <BarChart3 className="w-4 h-4 mr-2" /> },
    { tab: 'simulation', label: 'Demo Simulator', icon: <FlaskConical className="w-4 h-4 mr-2" /> },
    { tab: 'architecture', label: 'Data Structures', icon: <BookOpen className="w-4 h-4 mr-2" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Educational Disclaimer Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-[11px] font-medium py-1 px-4 text-center tracking-wide flex items-center justify-center space-x-2">
        <span className="bg-white/20 px-1.5 py-0.2 rounded font-bold uppercase text-[10px]">
          Educational Project
        </span>
        <span>
          Simulation of Java Data Structures (PriorityQueue, FIFO Deque, HashMap). Not for actual clinical triage decisions.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  Smart Emergency Department
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                  Java & DS
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                PriorityQueue & FIFO Scheduling Engine
              </p>
            </div>
          </div>

          {/* Status Badges & Quick Indicators */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50">
              <span className="text-slate-500">Treatment Bed:</span>
              <span
                className={`font-semibold flex items-center ${
                  inTreatmentCount > 0 ? 'text-indigo-600' : 'text-emerald-600'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-1.5 ${
                    inTreatmentCount > 0 ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                {inTreatmentCount > 0 ? 'Occupied (1/1)' : 'Available (0/1)'}
              </span>
            </div>

            <div className="flex items-center text-xs space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="text-slate-600 font-medium">
                {isConnected ? 'Engine Online' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto scrollbar-none py-1 border-t border-slate-100">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectTab(item.tab)}
                className={`flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                {item.icon}
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
