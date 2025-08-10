import { useEffect, useState } from 'react';

import { socketService } from '../../services/socket';
import { useGameStore } from '../../store/gameStore';

export default function InProgress() {
  const { currentRoom } = useGameStore();
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (currentRoom?.game?.currentPrompts) {
      setAnswers(new Array(currentRoom.game.currentPrompts.length).fill(''));
    }
  }, [currentRoom?.game?.currentPrompts]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!currentRoom || !currentRoom.game) return null;

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (!submitted && currentRoom) {
      socketService.submitAnswers(currentRoom.slug, answers);
      setSubmitted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='mx-auto max-w-4xl'>
      <div className='rounded-lg bg-white p-6 shadow-lg'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold'>Round {currentRoom.currentRound}</h2>
            <p className='text-gray-600'>
              Letter:{' '}
              <span className='text-3xl font-bold text-purple-600'>{currentRoom.game.letter}</span>
            </p>
          </div>
          <div className={`text-2xl font-bold ${timeLeft < 30 ? 'text-red-500' : 'text-gray-700'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {!submitted ? (
          <>
            <div className='mb-6 space-y-4'>
              {currentRoom.game.currentPrompts.map((prompt, index) => (
                <div key={index} className='flex items-center space-x-4'>
                  <div className='w-1/3'>
                    <label className='font-medium text-gray-700'>
                      {index + 1}. {prompt}
                    </label>
                  </div>
                  <input
                    type='text'
                    value={answers[index]}
                    onChange={e => handleAnswerChange(index, e.target.value)}
                    placeholder={`Answer starting with ${currentRoom.game?.letter}...`}
                    className='flex-1 rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none'
                  />
                </div>
              ))}
            </div>

            <div className='flex justify-center'>
              <button
                onClick={handleSubmit}
                className='rounded-lg bg-green-500 px-8 py-3 font-semibold text-white transition hover:bg-green-600'
              >
                Submit Answers
              </button>
            </div>
          </>
        ) : (
          <div className='py-12 text-center'>
            <div className='mb-4 text-green-500'>
              <svg
                className='mx-auto h-16 w-16'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <h3 className='mb-2 text-xl font-semibold'>Answers Submitted!</h3>
            <p className='text-gray-600'>Waiting for other players to finish...</p>
          </div>
        )}
      </div>
    </div>
  );
}
