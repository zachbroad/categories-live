import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useGameStore } from '../store/gameStore';
import { RoomStatus } from '../types/socket';

import InProgress from './game/InProgress';
import Lobby from './game/Lobby';
import Results from './game/Results';
import Scoring from './game/Scoring';
import Starting from './game/Starting';

export default function GamePage() {
  const navigate = useNavigate();
  const { currentRoom } = useGameStore();

  useEffect(() => {
    if (!currentRoom) {
      navigate('/home');
    }
  }, [currentRoom, navigate]);

  if (!currentRoom) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600'></div>
          <p className='text-gray-600'>Loading game...</p>
        </div>
      </div>
    );
  }

  const renderGameState = () => {
    switch (currentRoom.status) {
      case RoomStatus.Waiting:
        return <Lobby />;
      case RoomStatus.Starting:
        return <Starting />;
      case RoomStatus.InProgress:
        return <InProgress />;
      case RoomStatus.Scoring:
        return <Scoring />;
      case RoomStatus.Results:
        return <Results />;
      default:
        return <div>Unknown game state: {currentRoom.status}</div>;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50'>
      <nav className='bg-white shadow-md'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 justify-between'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-purple-600'>{currentRoom.name}</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>{renderGameState()}</div>
    </div>
  );
}
