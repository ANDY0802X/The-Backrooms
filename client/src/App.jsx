import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Landing from './components/Landing';
import Lobby from './components/Lobby';
import RoomView from './components/RoomView';
import { generateAnonymousIdentity } from './utils/identity';
import { sounds } from './utils/sound';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const socket = io(SERVER_URL);

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
  const [rooms, setRooms] = useState([]);

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

  // Connect to Socket.io & Listen for Rooms
  useEffect(() => {
    const handleRoomsUpdate = (updatedRooms) => {
      if (Array.isArray(updatedRooms)) {
        setRooms(updatedRooms);
      }
    };

    socket.on('rooms_update', handleRoomsUpdate);

    return () => {
      socket.off('rooms_update', handleRoomsUpdate);
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
    socket.emit('join_room_by_code', { code, user: userProfile }, (res) => {
      if (res && res.success && res.roomId) {
        handleJoinRoom(res.roomId);
      }
    });
  };

  const handleCreateRoom = (roomData) => {
    socket.emit('create_room', roomData, (res) => {
      if (res && res.success && res.roomId) {
        handleJoinRoom(res.roomId);
      }
    });
  };

  const handleLeaveRoom = () => {
    sounds.playBoing();
    setCurrentRoomId(null);
    setCurrentView('lobby');
  };

  return (
    <>
      {/* Main View Router */}
      {currentView === 'landing' && (
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
      )}

      {currentView === 'lobby' && (
        <Lobby
          socket={socket}
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
      )}

      {currentView === 'room' && currentRoomId && (
        <RoomView
          socket={socket}
          roomId={currentRoomId}
          userProfile={userProfile}
          onLeaveRoom={handleLeaveRoom}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </>
  );
}
