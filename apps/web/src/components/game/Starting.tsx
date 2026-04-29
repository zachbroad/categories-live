import { useEffect, useState } from 'react';

import { useGameStore } from '../../store/gameStore';

export default function Starting() {
  const { currentRoom } = useGameStore();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentRoom) return null;

  return (
    <div className='d-flex justify-content-center'>
      <div
        className='bg-white p-5 rounded shadow border border-black text-center'
        style={{ minWidth: '380px' }}
      >
        <h2 className='mb-4'>Game Starting!</h2>
        <div
          className='display-1 fw-bold text-primary mb-4'
          style={{ animation: 'pulse 1s ease-in-out infinite' }}
        >
          {countdown || 'GO!'}
        </div>
        <p className='lead mb-1'>Get ready to play Categories!</p>
        <p className='text-muted mb-0'>
          Round {currentRoom.currentRound} of {currentRoom.game?.rounds || 3}
        </p>
      </div>
    </div>
  );
}
