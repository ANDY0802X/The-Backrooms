import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { io } from 'socket.io-client';
import Landing from './components/Landing';
import Lobby from './components/Lobby';
import RoomView from './components/RoomView';
import { generateAnonymousIdentity } from './utils/identity';
import { sounds } from './utils/sound';

import { requestDeviceLocation, CAMPUS_PRESETS } from './utils/geolocation';
import NearbyGameAlert from './components/NearbyGameAlert';

const BACKEND_PROD_URL = 'https://the-backrooms-1.onrender.com';
const SERVER_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : BACKEND_PROD_URL);

const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true
});

const VIEW_ORDER = {
  landing: 0,
  lobby: 1,
  room: 2
};

const pageVariants = {
  initial: (direction) => ({
    x: direction > 0 ? 32 : -32,
    opacity: 0,
    scale: 0.992
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 340, damping: 32, mass: 0.8 },
      opacity: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
      scale: { duration: 0.24, ease: [0.16, 1, 0.3, 1] }
    }
  },
  exit: (direction) => ({
    x: direction > 0 ? -28 : 28,
    opacity: 0,
    scale: 0.992,
    transition: {
      x: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.18, ease: 'easeIn' }
    }
  })
};

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'lobby' | 'room'
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('soulnook_theme') || 'dark';
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

  // Geolocation & Proximity State
  const [campusPreset, setCampusPreset] = useState('library');
  const [coords, setCoords] = useState(() => {
    const defaultPreset = CAMPUS_PRESETS.find(p => p.id === 'library');
    return defaultPreset ? defaultPreset.coords : { lat: 28.545000, lon: 77.192600 };
  });
  const [locationStatus, setLocationStatus] = useState('active'); // 'active' | 'locating' | 'error'
  const [locationError, setLocationError] = useState(null);
  const [radarActive, setRadarActive] = useState(false);
  const [preferredRadarGames, setPreferredRadarGames] = useState([
    'scribble', 'trivia', 'wordchain', 'emojipop', 'truthvent'
  ]);
  const [nearbyRoomMap, setNearbyRoomMap] = useState({});
  const [activeMatchAlert, setActiveMatchAlert] = useState(null);

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

  // Query nearby rooms when coords change or room list updates
  useEffect(() => {
    if (!coords) return;
    const fetchNearby = () => {
      socket.emit('get_nearby_rooms', { coords }, (res) => {
        if (res && res.success && res.nearbyMap) {
          setNearbyRoomMap(res.nearbyMap);
        }
      });
    };

    fetchNearby();
    const interval = setInterval(fetchNearby, 6000);
    return () => clearInterval(interval);
  }, [coords, rooms]);

  // Proximity Radar: register / update candidate in server matchmaking pool
  useEffect(() => {
    if (radarActive && coords) {
      socket.emit('start_radar', {
        coords,
        preferredGames: preferredRadarGames,
        user: userProfile
      });
    } else {
      socket.emit('stop_radar');
    }
  }, [radarActive, coords, preferredRadarGames, userProfile]);

  // Update coordinates if user moves while radar is active
  useEffect(() => {
    if (radarActive && coords) {
      socket.emit('update_radar_location', { coords });
    }
  }, [coords, radarActive]);

  // Listen for Matchmaking Alert & Server Errors
  useEffect(() => {
    const handleMatchAlert = (matchData) => {
      setActiveMatchAlert(matchData);
    };

    const handleErrorMessage = (msg) => {
      alert(`⚠️ ${msg}`);
    };

    socket.on('game_nearby_alert', handleMatchAlert);
    socket.on('error_message', handleErrorMessage);

    return () => {
      socket.off('game_nearby_alert', handleMatchAlert);
      socket.off('error_message', handleErrorMessage);
    };
  }, []);

  const handleSelectCampusPreset = async (presetId) => {
    const preset = CAMPUS_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setCampusPreset(presetId);

    if (preset.id === 'device') {
      setLocationStatus('locating');
      try {
        const { coords: deviceCoords } = await requestDeviceLocation();
        setCoords(deviceCoords);
        setLocationStatus('active');
        setLocationError(null);
      } catch (err) {
        setLocationStatus('error');
        setLocationError(err.message);
        // Fallback to library
        const lib = CAMPUS_PRESETS.find(p => p.id === 'library');
        setCoords(lib.coords);
      }
    } else {
      setCoords(preset.coords);
      setLocationStatus('active');
      setLocationError(null);
    }
  };

  const handleToggleRadar = () => {
    sounds.playPop();
    setRadarActive(prev => !prev);
  };

  const handleToggleRadarGame = (gameId) => {
    setPreferredRadarGames(prev => {
      if (prev.includes(gameId)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter(g => g !== g && g !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  };

  const handleAcceptNearbyMatch = (matchData) => {
    socket.emit('accept_nearby_match', {
      matchId: matchData.matchId,
      user: userProfile,
      coords
    }, (res) => {
      if (res && res.success && res.roomId) {
        setActiveMatchAlert(null);
        setRadarActive(false);
        handleJoinRoom(res.roomId);
      } else {
        alert(res?.error || 'Unable to join match.');
      }
    });
  };

  const changeView = (nextView) => {
    const currentIdx = VIEW_ORDER[currentView] ?? 0;
    const nextIdx = VIEW_ORDER[nextView] ?? 0;
    setDirection(nextIdx >= currentIdx ? 1 : -1);
    setCurrentView(nextView);
  };

  const handleRerollProfile = () => {
    const newProfile = generateAnonymousIdentity();
    setUserProfile(newProfile);
  };

  const handleJoinRoom = (roomId) => {
    sounds.playBoing();
    setCurrentRoomId(roomId);
    changeView('room');
  };

  const handleJoinRoomByCode = (code) => {
    if (!code) return;
    socket.emit('join_room_by_code', { code, user: userProfile, coords }, (res) => {
      if (res && res.success && res.roomId) {
        handleJoinRoom(res.roomId);
      } else if (res && res.error) {
        alert(`❌ ${res.error}`);
      }
    });
  };

  const handleCreateRoom = (roomData) => {
    socket.emit('create_room', { ...roomData, coords }, (res) => {
      if (res && res.success && res.roomId) {
        handleJoinRoom(res.roomId);
      }
    });
  };

  const handleLeaveRoom = () => {
    sounds.playBoing();
    setCurrentRoomId(null);
    changeView('lobby');
  };

  const viewKey = currentView === 'room' ? `view-room-${currentRoomId}` : `view-${currentView}`;

  return (
    <div className="app-root-shell" style={{ overflow: 'hidden', minHeight: '100vh', width: '100%' }}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={viewKey}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ width: '100%', minHeight: '100vh' }}
        >
          {currentView === 'landing' && (
            <Landing
              onEnterLounge={() => changeView('lobby')}
              onCreateLoungeDirect={() => changeView('lobby')}
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
              onBackToLanding={() => changeView('landing')}
              theme={theme}
              onToggleTheme={toggleTheme}
              coords={coords}
              campusPreset={campusPreset}
              onSelectCampusPreset={handleSelectCampusPreset}
              locationStatus={locationStatus}
              locationError={locationError}
              radarActive={radarActive}
              onToggleRadar={handleToggleRadar}
              preferredRadarGames={preferredRadarGames}
              onToggleRadarGame={handleToggleRadarGame}
              nearbyRoomMap={nearbyRoomMap}
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
              coords={coords}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Phase 4 Nearby Game Proximity Alert Notification Modal */}
      {activeMatchAlert && (
        <NearbyGameAlert
          matchData={activeMatchAlert}
          onAccept={handleAcceptNearbyMatch}
          onDismiss={() => setActiveMatchAlert(null)}
        />
      )}
    </div>
  );
}
