import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import RoomBanker from './pages/RoomBanker';
import RoomPlayer from './pages/RoomPlayer';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/join" element={<JoinRoom />} />

          {/* Separate routes for Banker and Player */}
          <Route path="/room/:id/banker" element={<RoomBanker />} />
          <Route path="/room/:id/player" element={<RoomPlayer />} />

          {/* Unknown routes fall back to Home instead of a blank page */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}