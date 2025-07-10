import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
// ... existing imports ...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        // ... existing routes ...
      </Routes>
    </Router>
  );
}

export default App; 