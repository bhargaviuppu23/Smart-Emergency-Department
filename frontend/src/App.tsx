import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { LiveQueuePage } from './pages/LiveQueuePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { PatientRecordsPage } from './pages/PatientRecordsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SimulationPage } from './pages/SimulationPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { api } from './api/client';
import { HeartPulse, Github, ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [waitingCount, setWaitingCount] = useState<number>(0);
  const [inTreatmentCount, setInTreatmentCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const refreshCounts = async () => {
    try {
      const summary = await api.getSummary();
      setWaitingCount(summary.waitingCount);
      setInTreatmentCount(summary.inTreatmentCount);
      setIsConnected(true);
    } catch (err) {
      console.error('Connection health check failed:', err);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    refreshCounts();
    const interval = setInterval(refreshCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Navbar with header tabs and disclaimer */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        waitingCount={waitingCount}
        inTreatmentCount={inTreatmentCount}
        isConnected={isConnected}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardPage
            onNavigate={setCurrentTab}
            onRefreshQueue={refreshCounts}
          />
        )}

        {currentTab === 'live-queue' && (
          <LiveQueuePage onQueueUpdated={refreshCounts} />
        )}

        {currentTab === 'register' && (
          <RegistrationPage
            onSuccessNavigate={setCurrentTab}
            onPatientAdded={refreshCounts}
          />
        )}

        {currentTab === 'records' && (
          <PatientRecordsPage onQueueUpdated={refreshCounts} />
        )}

        {currentTab === 'analytics' && <AnalyticsPage />}

        {currentTab === 'simulation' && (
          <SimulationPage
            onSimulationUpdated={refreshCounts}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'architecture' && <ArchitecturePage />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-sky-600" />
            <span className="font-semibold text-slate-700">
              Smart Emergency Department Queue Optimization
            </span>
            <span>• College Project Implementation</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            <span>Powered by Java 21, Spring Boot 3, PriorityQueue, React, TypeScript & Tailwind CSS.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
