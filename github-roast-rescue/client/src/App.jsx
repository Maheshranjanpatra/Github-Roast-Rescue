import React from 'react';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import InteractiveGridBackground from './components/InteractiveGridBackground';

export default function App() {
  return (
    <div className="app-shell">
      <InteractiveGridBackground />

      <Navbar />

      <main className="app-content">
        <Home />
      </main>
    </div>
  );
}
