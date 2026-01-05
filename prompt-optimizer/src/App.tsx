// ============================================================================
// Prompt Optimizer App - Main Entry Point
// ============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { HomePage } from '@/pages/HomePage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
