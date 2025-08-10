import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import RoomList from '@/components/RoomList';
import { socketService } from '@/services/socket';
import { useGameStore } from '@/store/gameStore';

export default function Home() {
  const navigate = useNavigate();
  const { connected, username, currentRoom, setUsername, clientId } = useGameStore();
  const isDebug = import.meta.env.VITE_DEBUG === 'true';
  const connectionAttempts = useRef(0);
  const connectionStartTime = useRef(Date.now());

  const [roomName, setRoomName] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  useEffect(() => {
    // Redirect to game page if we have a room
    if (currentRoom) {
      navigate('/game');
    }
  }, [currentRoom, navigate]);

  useEffect(() => {
    // Request room list periodically
    if (connected) {
      socketService.requestRoomList();
      const interval = setInterval(() => {
        socketService.requestRoomList();
      }, 2000);
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

  const handleJoinRandomRoom = () => {
    socketService.joinRandomRoom();
  };

  const handleSinglePlayer = () => {
    socketService.startSinglePlayer();
  };

  const handleDisconnect = () => {
    socketService.disconnect();
    navigate('/');
  };

  if (!connected) {
    const elapsedTime = Math.floor((Date.now() - connectionStartTime.current) / 1000);
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600'></div>
          <p className='text-gray-600'>Connecting to server...</p>
          {isDebug && (
            <div className='mt-4 rounded-lg bg-gray-100 p-4 text-left text-sm'>
              <h3 className='mb-2 font-semibold text-gray-700'>Debug Information</h3>
              <div className='space-y-1 text-gray-600'>
                <p>Socket URL: <span className='font-mono'>{socketUrl}</span></p>
                <p>Username: <span className='font-mono'>{username}</span></p>
                <p>Connection Attempts: <span className='font-mono'>{connectionAttempts.current}</span></p>
                <p>Elapsed Time: <span className='font-mono'>{elapsedTime}s</span></p>
                <p>Transport: <span className='font-mono'>websocket</span></p>
                {connectionAttempts.current > 3 && (
                  <p className='mt-2 text-red-600'>
                    Multiple connection attempts detected. Check if the server is running on port 3001.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50'>
      <nav className='bg-white shadow-md'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 justify-between'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-purple-600'>Categories LIVE</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mb-6 rounded-lg bg-white p-6 shadow-lg'>
          <div className='mb-6 flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <span className='text-gray-700'>Connected as</span>
              <span className='font-semibold text-purple-600'>{username}</span>
              {isDebug && clientId && (
                <span className='text-xs text-gray-500'>(ID: {clientId.slice(0, 8)}...)</span>
              )}
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={handleChangeName}
                className='rounded-md border border-purple-600 px-4 py-2 text-sm text-purple-600 transition hover:bg-purple-50'
              >
                Change Name
              </button>
              <button
                onClick={handleDisconnect}
                className='rounded-md bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600'
              >
                Disconnect
              </button>
            </div>
          </div>

          <div className='flex justify-end space-x-2'>
            <button
              onClick={handleSinglePlayer}
              className='rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50'
            >
              Single Player
            </button>
            <button
              onClick={handleJoinRandomRoom}
              className='rounded-md border border-green-500 px-4 py-2 text-sm text-green-600 transition hover:bg-green-50'
            >
              Join Random Room
            </button>
            <button
              onClick={() => setShowCreateRoom(true)}
              className='rounded-md bg-green-500 px-4 py-2 text-sm text-white transition hover:bg-green-600'
            >
              Create Room
            </button>
          </div>
        </div>

        {showCreateRoom && (
          <div className='mb-6 rounded-lg bg-white p-6 shadow-lg'>
            <h3 className='mb-4 text-lg font-semibold'>Create New Room</h3>
            <div className='flex space-x-2'>
              <input
                type='text'
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleCreateRoom()}
                placeholder='Enter room name...'
                className='flex-1 rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none'
              />
              <button
                onClick={handleCreateRoom}
                disabled={!roomName.trim()}
                className='rounded-md bg-purple-600 px-6 py-2 text-white transition hover:bg-purple-700 disabled:bg-gray-300'
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateRoom(false);
                  setRoomName('');
                }}
                className='rounded-md border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-50'
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <RoomList />
      </div>
    </div>
  );

}
