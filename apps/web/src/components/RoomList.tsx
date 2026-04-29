import { useEffect } from 'react';

import { socketService } from '@/services/socket';
import { useGameStore } from '@/store/gameStore';
import { RoomStatus } from '@/types/socket';
import { getRoomStatusColor } from '@/utils/getRoomStatusColor';


export default function RoomList() {
    const { availableRooms } = useGameStore();

    useEffect(() => {
        socketService.requestRoomList();
    }, []);

    const handleJoinRoom = (slug: string) => {
        socketService.joinRoom(slug);
    };

    return (
        <div className='rounded-lg bg-white p-6 shadow-lg'>
            <h2 className='mb-4 text-xl font-bold'>Available Rooms</h2>

            {availableRooms.length === 0 ? (
                <p className='py-8 text-center text-gray-500'>
                    No rooms available. Create one to get started!
                </p>
            ) : (
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {availableRooms.map(room => (
                        <div
                            key={room.id}
                            className='rounded-lg border border-gray-200 p-4 transition hover:shadow-md'
                        >
                            <div className='mb-2 flex items-start justify-between'>
                                <h3 className='text-lg font-semibold'>{room.name}</h3>
                                <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getRoomStatusColor(room)}`}
                                >
                                    {room.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className='mb-3 text-sm text-gray-600'>
                                <p>
                                    Players: {room.clients.length} / {room.capacity}
                                </p>
                                {room.owner && <p>Host: {room.owner.username}</p>}
                            </div>

                            {room.status === RoomStatus.Waiting ? (
                                <button
                                    onClick={() => handleJoinRoom(room.slug)}
                                    className='w-full rounded-md bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700'
                                >
                                    Join Room
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className='w-full cursor-not-allowed rounded-md bg-gray-300 px-4 py-2 text-gray-500'
                                >
                                    Game in Progress
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
