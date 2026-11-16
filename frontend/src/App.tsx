import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { Story } from './pages/Story';
import { Research } from './pages/Research';
import { Dashboard } from './pages/Dashboard';
import { ScenarioLab } from './pages/ScenarioLab';
import { Alerts } from './pages/Alerts';
import { DataQuality } from './pages/DataQuality';
import { Impact } from './pages/Impact';
import { Validation } from './pages/Validation';
import { About } from './pages/About';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-ink">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/story" element={<Story />} />
          <Route path="/research" element={<Research />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lab" element={<ScenarioLab />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/data-quality" element={<DataQuality />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/validation" element={<Validation />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;

