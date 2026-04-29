import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import Navbar from '@/components/Navbar';
import { useClientOnly } from '@/hooks/useClientOnly';
import { socketService } from '@/services/socket';
import { useGameStore } from '@/store/gameStore';

const APP_TITLE = 'Categories.LIVE';

export default function Landing() {
  const navigate = useNavigate();
  const { setUsername } = useGameStore();
  const [name, setName] = useState('');
  const [connecting, setConnecting] = useState(false);
  const isClient = useClientOnly();

  useEffect(() => {
    const stored = localStorage.getItem('username');
    if (stored) setName(stored);
  }, []);

  const handleConnect = (e?: React.FormEvent) => {
    e?.preventDefault();
    const username = name.trim() || `Guest${Math.floor(Math.random() * 10000)}`;
    setUsername(username);
    setConnecting(true);
    localStorage.setItem('username', username);
    socketService.connect(username);
    setTimeout(() => navigate('/home'), 500);
  };

  const handleSinglePlayer = () => {
    const username = name.trim() || `Guest${Math.floor(Math.random() * 10000)}`;
    setUsername(username);
    localStorage.setItem('username', username);
    socketService.connect(username);
    setTimeout(() => {
      socketService.startSinglePlayer();
      navigate('/home');
    }, 500);
  };

  return (
    <>
      <Navbar center={APP_TITLE} />

      <div className='container'>
        <div
          className='bg-white p-3 mb-2 rounded shadow border border-black mx-auto'
          style={{ maxWidth: '460px' }}
        >
          <h2>Play {APP_TITLE}</h2>
          <p>Choose a username to play online with others or start a Single Player game!</p>

          <form onSubmit={handleConnect}>
            {isClient && (
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder='Username'
                id='username'
                type='text'
                className='form-control'
                disabled={connecting}
              />
            )}

            <div className='d-flex justify-content-around mt-3'>
              <button
                className='btn btn-primary'
                type='button'
                onClick={handleSinglePlayer}
                disabled={connecting}
              >
                Play Single Player
              </button>
              <button className='btn btn-success' type='submit' disabled={connecting}>
                {connecting ? 'Connecting...' : 'Connect to Server'}
              </button>
            </div>
          </form>
        </div>

        <div
          className='bg-white p-3 mt-4 rounded shadow border border-black mx-auto'
          style={{ maxWidth: '720px' }}
        >
          <h3>How to Play</h3>
          <p>
            <strong>Categories</strong> (a.k.a. Scattergories) is a word game where you race to
            come up with answers fitting a category — all starting with the same letter.
          </p>
          <ol>
            <li>Each round you get a random letter and a list of categories.</li>
            <li>Answer every category with a word that starts with that letter.</li>
            <li>An LLM scores answers — creative ones earn more.</li>
            <li>Highest total wins the round.</li>
          </ol>
        </div>
      </div>
    </>
  );
}
