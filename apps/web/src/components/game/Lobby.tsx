import { useState } from 'react';
import { useNavigate } from 'react-router';

import { socketService } from '../../services/socket';
import { useGameStore } from '../../store/gameStore';

export default function Lobby() {
  const navigate = useNavigate();
  const { currentRoom, username } = useGameStore();
  const [chatMessage, setChatMessage] = useState('');

  if (!currentRoom) return null;

  const handleStartGame = () => {
    socketService.startGame(currentRoom.slug);
  };

  const handleLeaveRoom = () => {
    socketService.leaveRoom(currentRoom.slug);
    navigate('/home');
  };

  const handleSendChat = () => {
    if (chatMessage.trim()) {
      socketService.sendChatMessage(chatMessage.trim());
      setChatMessage('');
    }
  };

  const isOwner = currentRoom.owner?.username === username;
  const canStart = isOwner && currentRoom.clients.length >= 1;

  return (
    <div className='grid gap-6 md:grid-cols-3'>
      <div className='md:col-span-2'>
        <div className='rounded-lg bg-white p-6 shadow-lg'>
          <div className='mb-6 flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>Lobby</h2>
            <button
              onClick={handleLeaveRoom}
              className='rounded-md bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600'
            >
              Leave Room
            </button>
          </div>

          <div className='mb-6'>
            <h3 className='mb-3 text-lg font-semibold'>
              Players ({currentRoom.clients.length}/{currentRoom.capacity})
            </h3>
            <div className='grid grid-cols-2 gap-3'>
              {currentRoom.clients.map(client => (
                <div key={client.id} className='flex items-center rounded-lg bg-gray-50 p-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold text-white'>
                    {client.username[0].toUpperCase()}
                  </div>
                  <div className='ml-3'>
                    <p className='font-medium'>{client.username}</p>
                    {client.username === currentRoom.owner?.username && (
                      <p className='text-xs text-purple-600'>Host</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isOwner && (
            <div className='flex justify-center'>
              <button
                onClick={handleStartGame}
                disabled={!canStart}
                className='rounded-lg bg-green-500 px-8 py-3 font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300'
              >
                Start Game
              </button>
            </div>
          )}

          {!isOwner && (
            <div className='text-center text-gray-600'>Waiting for host to start the game...</div>
          )}
        </div>
      </div>

      <div className='md:col-span-1'>
        <div className='rounded-lg bg-white p-6 shadow-lg'>
          <h3 className='mb-4 text-lg font-semibold'>Chat</h3>

          <div className='mb-4 h-64 overflow-y-auto rounded-lg border border-gray-200 p-3'>
            {currentRoom.chat.length === 0 ? (
              <p className='text-center text-gray-500'>No messages yet...</p>
            ) : (
              <div className='space-y-2'>
                {currentRoom.chat.map((msg, index) => (
                  <div key={index} className='text-sm'>
                    <span className='font-semibold text-purple-600'>{msg.username}:</span>
                    <span className='ml-2'>{msg.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='flex space-x-2'>
            <input
              type='text'
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendChat()}
              placeholder='Type a message...'
              className='flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none'
            />
            <button
              onClick={handleSendChat}
              className='rounded-md bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700'
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
