import React from 'react';
import './App.css';
import Mint from './MintNFT'
import Staking from './StakingNFT'
import Nav from './Nav'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

function App() {
  return (
    <Router>
      <Nav />
      <Routes>
          <Route path="/mint" element={<Mint />} />
          <Route path="/" element={<Staking />} />  
      </Routes>     
    </Router>
  );
}

export default App;