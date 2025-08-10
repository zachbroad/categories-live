import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useClientOnly } from '../hooks/useClientOnly';
import { socketService } from '../services/socket';
import { useGameStore } from '../store/gameStore';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setUsername } = useGameStore();
  const [name, setName] = useState('');
  const [connecting, setConnecting] = useState(false);
  const isClient = useClientOnly();
  const [previousUsername, setPreviousUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setPreviousUsername(storedUsername || previousUsername);
    setName(storedUsername || previousUsername);
  }, []);

  const handleConnect = () => {
    const username = name.trim() || `Guest${Math.floor(Math.random() * 10000)}`;
    setUsername(username);
    setConnecting(true);

    localStorage.setItem('username', username);

    socketService.connect(username);

    // Wait a bit for connection then navigate
    setTimeout(() => {
      navigate('/home');
    }, 500);
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600'>
      <div className='mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-2xl'>
        <div className='mb-8 text-center'>
          <h1 className='mb-2 text-4xl font-bold text-purple-600'>Categories LIVE</h1>
          <p className='text-gray-600'>The classic game, now online!</p>
        </div>

        <div className='space-y-6'>
          <div>
            <label htmlFor='username' className='mb-2 block text-sm font-medium text-gray-700'>
              Enter your name
            </label>
            {isClient && (
              <input
                id='username'
                type='text'
                value={name || previousUsername || ''}
                onChange={e => setName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleConnect()}
                placeholder='Your name...'
                className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none'
                disabled={connecting}
              />
            )}
          </div>

          <button
            onClick={handleConnect}
            disabled={connecting}
            className='w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400'
          >
            {connecting ? (
              <span className='flex items-center justify-center'>
                <svg
                  className='mr-3 -ml-1 h-5 w-5 animate-spin text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Connecting...
              </span>
            ) : (
              'Play Now'
            )}
          </button>
        </div>

        <div className='mt-8 text-center text-sm text-gray-500'>
          <p>Play with friends or join random games!</p>
        </div>
      </div>
    </div>
  );
}
