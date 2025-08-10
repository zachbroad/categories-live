import { type Room, RoomStatus } from "@/types/socket";

export const getRoomStatusColor = (room: Room) => {
    switch (room.status) {
        case RoomStatus.Waiting:
            return 'bg-green-100 text-green-800';
        case RoomStatus.Starting:
            return 'bg-yellow-100 text-yellow-800';
        case RoomStatus.InProgress:
            return 'bg-blue-100 text-blue-800';
        case RoomStatus.Scoring:
            return 'bg-purple-100 text-purple-800';
        case RoomStatus.Results:
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};
