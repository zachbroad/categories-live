import { useState } from 'react';
import Button from '@repo/ui/button';

export function Welcome({ message }: { message: string }) {
  const [username, setUsername] = useState('');

  const handleSinglePlayer = () => {
    console.log('Starting single player game');
  };

  const handleConnectToServer = () => {
    console.log('Connecting to server with username:', username);
  };

  return (
    <main className='flex items-center justify-center pb-8 pt-8'>
      <div className='flex min-h-0 flex-1 flex-col items-center gap-8 max-w-6xl px-4'>
        {/* Title Header */}
        <header className='w-full'>
          <div className='bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-md'>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Categories.LIVE</h1>
          </div>
        </header>

        {/* Play Section */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md w-full max-w-md'>
          <h2 className='text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white'>
            Play Categories.LIVE
          </h2>
          <p className='text-center mb-6 text-gray-600 dark:text-gray-300'>
            Choose a username to play online with others or start a Single Player game!
          </p>
          <div className='space-y-4'>
            <input
              type='text'
              placeholder='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
            />
            <div className='flex gap-4'>
              <Button 
                onClick={handleSinglePlayer}
                variant='secondary' 
                className='flex-1 bg-gray-700 hover:bg-gray-800 text-white'
              >
                Play Single Player
              </Button>
              <Button 
                onClick={handleConnectToServer}
                variant='default' 
                className='flex-1 bg-green-500 hover:bg-green-600 text-white'
              >
                Connect to Server
              </Button>
            </div>
          </div>
        </div>

        {/* Info Sections */}
        <div className='grid md:grid-cols-2 gap-6 w-full'>
          {/* What is Categories.LIVE */}
          <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md'>
            <h3 className='text-xl font-bold mb-4 text-center text-gray-900 dark:text-white flex items-center justify-center gap-2'>
              <span>🤔</span> What is Categories.LIVE? <span>🤔</span>
            </h3>
            <div className='space-y-3 text-gray-600 dark:text-gray-300'>
              <p>
                Categories.LIVE is a creative-thinking category-based party game.
              </p>
              <p className='flex items-start gap-2'>
                <span>🎯</span>
                <span>
                  The objective of the game is to quickly come up with unique words or phrases 
                  that fit into specific categories, given an initial letter within a time limit
                </span>
                <span>⏱️</span>
              </p>
            </div>
            <div className='mt-6 text-center'>
              <Button variant='secondary' className='bg-gray-700 hover:bg-gray-800 text-white'>
                Learn More!
              </Button>
            </div>
          </div>

          {/* How to Play */}
          <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md'>
            <h3 className='text-xl font-bold mb-4 text-center text-gray-900 dark:text-white flex items-center justify-center gap-2'>
              <span>🎮</span> How to Play <span>🎮</span>
            </h3>
            <ol className='space-y-3 text-gray-600 dark:text-gray-300'>
              <li className='flex items-start gap-2'>
                <span className='font-semibold'>1.</span>
                <span className='flex items-center gap-1'>
                  <span>📝</span> Each player receives a category list and a writing pad.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='font-semibold'>2.</span>
                <span className='flex items-center gap-1'>
                  <span>🔤</span> A letter is randomly chosen.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='font-semibold'>3.</span>
                <span className='flex items-center gap-1'>
                  <span>⏱️</span> Start the timer! You have a limited time to come up with 
                  words that fit the categories on your list, starting with the chosen letter.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='font-semibold'>4.</span>
                <span className='flex items-center gap-1'>
                  <span>⏰</span> When the time is up, your answers will be scored.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='font-semibold'>5.</span>
                <span className='flex items-center gap-1'>
                  <span>🏆</span> You will earn points for correct unique answers.
                </span>
              </li>
            </ol>
          </div>
        </div>

        {/* Optional message display */}
        {message && (
          <div className='text-center text-gray-600 dark:text-gray-300 mt-4'>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
