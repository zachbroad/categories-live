import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import Navbar from '@/components/Navbar';
import RoomList from '@/components/RoomList';
import { socketService } from '@/services/socket';
import { useGameStore } from '@/store/gameStore';

const APP_TITLE = 'Categories.LIVE';

export default function Home() {
  const navigate = useNavigate();
  const { connected, username, currentRoom, setUsername, clientId } = useGameStore();
  const isDebug = import.meta.env.VITE_DEBUG === 'true';
  const connectionAttempts = useRef(0);
  const connectionStartTime = useRef(Date.now());

  const [roomName, setRoomName] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  useEffect(() => {
    if (currentRoom) navigate('/game');
  }, [currentRoom, navigate]);

  useEffect(() => {
    if (connected) {
      socketService.requestRoomList();
      const interval = setInterval(() => socketService.requestRoomList(), 2000);
      return () => clearInterval(interval);
    } else {
      connectionAttempts.current++;
    }
  }, [connected]);

  const handleChangeName = () => {
    const newName = prompt('Enter your new name:', username);
    if (newName && newName.trim()) {
      setUsername(newName.trim());
      socketService.changeName(newName.trim());
    }
  };

  const handleCreateRoom = () => {
    if (roomName.trim()) {
      socketService.createRoom(roomName.trim());
      setRoomName('');
      setShowCreateRoom(false);
    }
  };

  const handleJoinRandomRoom = () => socketService.joinRandomRoom();
  const handleSinglePlayer = () => socketService.startSinglePlayer();
  const handleDisconnect = () => {
    socketService.disconnect();
    navigate('/');
  };

  if (!connected) {
    const elapsedTime = Math.floor((Date.now() - connectionStartTime.current) / 1000);
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

    return (
      <>
        <Navbar center={APP_TITLE} />
        <div className='container'>
          <div
            className='bg-white p-4 mt-3 rounded shadow border border-black mx-auto text-center'
            style={{ maxWidth: '480px' }}
          >
            <div className='spinner-border text-primary mb-3' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
            <p>Connecting to server...</p>
            {isDebug && (
              <div className='text-start small mt-3 p-3 border border-secondary rounded'>
                <h5>Debug Info</h5>
                <p className='mb-1'>Socket URL: <code>{socketUrl}</code></p>
                <p className='mb-1'>Username: <code>{username}</code></p>
                <p className='mb-1'>Attempts: <code>{connectionAttempts.current}</code></p>
                <p className='mb-0'>Elapsed: <code>{elapsedTime}s</code></p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar center={APP_TITLE} />

      <div className='container mt-3'>
        <div
          className='bg-white p-3 mb-4 rounded shadow border border-black'
          style={{ maxWidth: '580px', margin: '0 auto' }}
        >
          <div className='d-flex mb-3 align-items-center'>
            <p className='mb-0'>
              Connected as <strong>{username}</strong>
              {isDebug && clientId && (
                <span className='text-muted small ms-2'>(ID: {clientId.slice(0, 8)}...)</span>
              )}
            </p>
            <button
              className='btn btn-sm btn-outline-primary ms-auto me-2'
              onClick={handleChangeName}
            >
              Change Name
            </button>
            <button className='btn btn-sm btn-danger' onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
          <div className='d-flex flex-row justify-content-end flex-wrap gap-2'>
            <button className='btn btn-sm btn-outline-primary' onClick={handleSinglePlayer}>
              Single Player Game
            </button>
            <button className='btn btn-sm btn-outline-success' onClick={handleJoinRandomRoom}>
              Join Random Room
            </button>
            <button className='btn btn-sm btn-success' onClick={() => setShowCreateRoom(true)}>
              Create Room
            </button>
          </div>
        </div>

        {showCreateRoom && (
          <div
            className='bg-white p-3 mb-4 rounded shadow border border-black'
            style={{ maxWidth: '580px', margin: '0 auto' }}
          >
            <h5 className='mb-3'>Create New Room</h5>
            <div className='input-group'>
              <input
                type='text'
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateRoom()}
                placeholder='Enter room name...'
                className='form-control'
              />
              <button
                className='btn btn-success'
                onClick={handleCreateRoom}
                disabled={!roomName.trim()}
              >
                Create
              </button>
              <button
                className='btn btn-outline-secondary'
                onClick={() => {
                  setShowCreateRoom(false);
                  setRoomName('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <RoomList />
      </div>
    </>
  );
}
