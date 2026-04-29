import { useEffect } from 'react';

import { socketService } from '@/services/socket';
import { useGameStore } from '@/store/gameStore';
import { RoomStatus } from '@/types/socket';

function statusBadgeClass(status: RoomStatus) {
  switch (status) {
    case RoomStatus.Waiting:
      return 'bg-success';
    case RoomStatus.Starting:
      return 'bg-info text-dark';
    case RoomStatus.InProgress:
      return 'bg-warning text-dark';
    case RoomStatus.Scoring:
      return 'bg-info text-dark';
    case RoomStatus.Results:
      return 'bg-secondary';
    default:
      return 'bg-secondary';
  }
}

export default function RoomList() {
  const { availableRooms } = useGameStore();

  useEffect(() => {
    socketService.requestRoomList();
  }, []);

  const handleJoinRoom = (slug: string) => {
    socketService.joinRoom(slug);
  };

  return (
    <div
      className='bg-white p-3 rounded shadow border border-black'
      style={{ maxWidth: '900px', margin: '0 auto' }}
    >
      <h3 className='mb-3'>Available Rooms</h3>

      {availableRooms.length === 0 ? (
        <p className='text-center text-muted py-4 mb-0'>
          No rooms available. Create one to get started!
        </p>
      ) : (
        <div className='row g-3'>
          {availableRooms.map(room => (
            <div key={room.id} className='col-md-6 col-lg-4'>
              <div className='card border-black h-100'>
                <div className='card-body'>
                  <div className='d-flex justify-content-between align-items-start mb-2'>
                    <h5 className='card-title mb-0'>{room.name}</h5>
                    <span className={`badge ${statusBadgeClass(room.status)}`}>
                      {room.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className='card-text small mb-1'>
                    Players: {room.clients.length} / {room.capacity}
                  </p>
                  {room.owner && (
                    <p className='card-text small text-muted mb-3'>Host: {room.owner.username}</p>
                  )}

                  {room.status === RoomStatus.Waiting ? (
                    <button
                      onClick={() => handleJoinRoom(room.slug)}
                      className='btn btn-sm btn-primary w-100'
                    >
                      Join Room
                    </button>
                  ) : (
                    <button disabled className='btn btn-sm btn-secondary w-100'>
                      Game in Progress
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
