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
    <div className='flex min-h-[60vh] items-center justify-center'>
      <div className='rounded-lg bg-white p-12 text-center shadow-lg'>
        <h2 className='mb-6 text-3xl font-bold'>Game Starting!</h2>

        <div className='mb-8'>
          <div className='animate-pulse text-6xl font-bold text-purple-600'>
            {countdown || 'GO!'}
          </div>
        </div>

        <div className='text-lg text-gray-600'>
          <p>Get ready to play Categories!</p>
          <p className='mt-2'>
            Round {currentRoom.currentRound} of {currentRoom.game?.rounds || 3}
          </p>
        </div>
      </div>
    </div>
  );
}
