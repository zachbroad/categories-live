import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import InProgress from '@/components/game/InProgress';
import Lobby from '@/components/game/Lobby';
import Results from '@/components/game/Results';
import Scoring from '@/components/game/Scoring';
import Starting from '@/components/game/Starting';
import Navbar from '@/components/Navbar';
import { useGameStore } from '@/store/gameStore';
import { RoomStatus } from '@/types/socket';

export default function Game() {
  const navigate = useNavigate();
  const { currentRoom } = useGameStore();

  useEffect(() => {
    if (!currentRoom) navigate('/home');
  }, [currentRoom, navigate]);

  if (!currentRoom) {
    return (
      <>
        <Navbar />
        <div className='container'>
          <div
            className='bg-white p-4 mt-3 rounded shadow border border-black mx-auto text-center'
            style={{ maxWidth: '420px' }}
          >
            <div className='spinner-border text-primary mb-3' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
            <p className='mb-0'>Loading game...</p>
          </div>
        </div>
      </>
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
        return (
          <div className='alert alert-warning'>Unknown game state: {currentRoom.status}</div>
        );
    }
  };

  return (
    <>
      <Navbar center={currentRoom.name} />
      <div className='container mt-3'>{renderGameState()}</div>
    </>
  );
}
