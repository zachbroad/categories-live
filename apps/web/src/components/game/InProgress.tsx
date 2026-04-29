import { useEffect, useState } from 'react';

import { socketService } from '../../services/socket';
import { useGameStore } from '../../store/gameStore';

export default function InProgress() {
  const { currentRoom } = useGameStore();
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
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
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
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
    <div className='board-item-container'>
      <div className='bg-white p-3 rounded shadow border border-black'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <div>
            <h2 className='mb-0'>Round {currentRoom.currentRound}</h2>
            <p className='mb-0'>
              Letter:{' '}
              <span className='display-5 fw-bold text-primary'>{currentRoom.game.letter}</span>
            </p>
          </div>
          <div className={`h2 mb-0 ${timeLeft < 30 ? 'text-danger' : ''}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {!submitted ? (
          <>
            <div className='mb-3'>
              {currentRoom.game.currentPrompts.map((prompt, index) => (
                <div key={index} className='row align-items-center mb-3'>
                  <label className='col-md-4 fw-semibold mb-0'>
                    {index + 1}. {prompt}
                  </label>
                  <div className='col-md-8'>
                    <input
                      type='text'
                      value={answers[index]}
                      onChange={e => handleAnswerChange(index, e.target.value)}
                      placeholder={`Answer starting with ${currentRoom.game?.letter}...`}
                      className='form-control'
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className='d-flex justify-content-center'>
              <button className='btn btn-success btn-lg' onClick={handleSubmit}>
                Submit Answers
              </button>
            </div>
          </>
        ) : (
          <div className='text-center py-5'>
            <h3 className='mb-2'>Answers Submitted!</h3>
            <p className='text-muted mb-0'>Waiting for other players to finish...</p>
          </div>
        )}
      </div>
    </div>
  );
}
