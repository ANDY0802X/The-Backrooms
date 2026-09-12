import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Landing from './components/Landing';
import Lobby from './components/Lobby';
import RoomView from './components/RoomView';
import { generateAnonymousIdentity } from './utils/identity';
import { sounds } from './utils/sound';

import { realtimeMesh } from './services/realtimeMesh';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'lobby' | 'room'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('soulnook_theme') || 'light';
  });

  const [userProfile, setUserProfile] = useState(() => {
    const saved = sessionStorage.getItem('soulnook_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return generateAnonymousIdentity();
  });

  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [rooms, setRooms] = useState(() => realtimeMesh.getRooms());
  const socketRef = useRef(realtimeMesh);

  // Sync theme with HTML root attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('soulnook_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Save profile to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('soulnook_user', JSON.stringify(userProfile));
  }, [userProfile]);

  // Connect to Realtime Mesh & Listen for Rooms
  useEffect(() => {
    const handleRoomsUpdate = (updatedRooms) => {
      setRooms(updatedRooms);
    };

    realtimeMesh.on('rooms_update', handleRoomsUpdate);

    // Initial sync
    setRooms(realtimeMesh.getRooms());

    return () => {
      realtimeMesh.off('rooms_update', handleRoomsUpdate);
    };
  }, []);

  const handleRerollProfile = () => {
    const newProfile = generateAnonymousIdentity();
    setUserProfile(newProfile);
  };

  const handleJoinRoom = (roomId) => {
    sounds.playBoing();
    setCurrentRoomId(roomId);
    setCurrentView('room');
  };

  const handleJoinRoomByCode = (code) => {
    if (!code) return;
    realtimeMesh.emit('join_room_by_code', { code, user: userProfile }, ({ success, roomId }) => {
      if (success && roomId) {
        handleJoinRoom(roomId);
      }
    });
  };

  const handleCreateRoom = (roomData) => {
    realtimeMesh.emit('create_room', roomData, ({ success, roomId }) => {
      if (success && roomId) {
        handleJoinRoom(roomId);
      }
    });
  };

  const handleLeaveRoom = () => {
    sounds.playBoing();
    setCurrentRoomId(null);
    setCurrentView('lobby');
  };

  return (
    <div className="app-root-shell">
      {/* Main View Router with Fluid Transitions */}
      {currentView === 'landing' && (
        <div key="view-landing" className="view-stage-wrapper">
          <Landing
            onEnterLounge={() => setCurrentView('lobby')}
            onCreateLoungeDirect={() => setCurrentView('lobby')}
            onJoinByCode={handleJoinRoomByCode}
            userProfile={userProfile}
            onUpdateUserProfile={setUserProfile}
            onRerollProfile={handleRerollProfile}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </div>
      )}

      {currentView === 'lobby' && (
        <div key="view-lobby" className="view-stage-wrapper">
          <Lobby
            rooms={rooms}
            userProfile={userProfile}
            onUpdateUserProfile={setUserProfile}
            onRerollProfile={handleRerollProfile}
            onJoinRoom={handleJoinRoom}
            onJoinRoomByCode={handleJoinRoomByCode}
            onCreateRoom={handleCreateRoom}
            onBackToLanding={() => setCurrentView('landing')}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </div>
      )}

      {currentView === 'room' && currentRoomId && (
        <div key={`view-room-${currentRoomId}`} className="view-stage-wrapper">
          <RoomView
            socket={socketRef.current}
            roomId={currentRoomId}
            userProfile={userProfile}
            onLeaveRoom={handleLeaveRoom}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </div>
      )}
    </div>
  );
}
