import { useState } from 'react';
import { useNavigate } from 'react-router';

import { socketService } from '../../services/socket';
import { useGameStore } from '../../store/gameStore';

export default function Lobby() {
  const navigate = useNavigate();
  const { currentRoom, username } = useGameStore();
  const [chatMessage, setChatMessage] = useState('');

  if (!currentRoom) return null;

  const handleStartGame = () => socketService.startGame(currentRoom.slug);

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
    <div className='row g-3'>
      <div className='col-lg-8'>
        <div className='bg-white p-3 rounded shadow border border-black h-100'>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <h2 className='mb-0'>Lobby</h2>
            <button className='btn btn-sm btn-danger' onClick={handleLeaveRoom}>
              Leave Room
            </button>
          </div>

          <h4 className='mb-3'>
            Players ({currentRoom.clients.length}/{currentRoom.capacity})
          </h4>
          <div className='row g-2 mb-4'>
            {currentRoom.clients.map(client => (
              <div key={client.id} className='col-sm-6'>
                <div className='d-flex align-items-center p-2 border border-black rounded bg-light'>
                  <div
                    className='d-flex align-items-center justify-content-center bg-primary text-white rounded-circle fw-bold'
                    style={{ width: '40px', height: '40px' }}
                  >
                    {client.username[0].toUpperCase()}
                  </div>
                  <div className='ms-3'>
                    <p className='mb-0 fw-semibold'>{client.username}</p>
                    {client.username === currentRoom.owner?.username && (
                      <small className='text-primary'>Host</small>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isOwner ? (
            <div className='d-flex justify-content-center'>
              <button
                className='btn btn-success btn-lg'
                onClick={handleStartGame}
                disabled={!canStart}
              >
                Start Game
              </button>
            </div>
          ) : (
            <p className='text-center text-muted mb-0'>Waiting for host to start the game...</p>
          )}
        </div>
      </div>

      <div className='col-lg-4'>
        <div className='bg-white p-3 rounded shadow border border-black h-100'>
          <h4 className='mb-3'>Chat</h4>

          <div
            className='border border-black rounded p-2 mb-3 overflow-auto'
            style={{ height: '260px' }}
          >
            {currentRoom.chat.length === 0 ? (
              <p className='text-center text-muted mb-0'>No messages yet...</p>
            ) : (
              currentRoom.chat.map((msg, index) => (
                <div key={index} className='small mb-1'>
                  <span className='fw-semibold text-primary'>{msg.username}:</span>{' '}
                  <span>{msg.message}</span>
                </div>
              ))
            )}
          </div>

          <div className='input-group'>
            <input
              type='text'
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              placeholder='Type a message...'
              className='form-control'
            />
            <button className='btn btn-primary' onClick={handleSendChat}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
