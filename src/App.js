import React from 'react';
import './App.css';
import Mint from './MintNFT'
import Staking from './StakingNFT'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

function App() {
  return (
    <Router>
      <Routes>
          <Route path="/mint" element={<Mint />} />
          <Route path="/staking" element={<Staking />} />  
      </Routes>     
    </Router>
  );
}

export default App;