import { useNavigate } from 'react-router';

import { socketService } from '../../services/socket';
import { useGameStore } from '../../store/gameStore';

export default function Results() {
  const navigate = useNavigate();
  const { currentRoom, clientId } = useGameStore();

  if (!currentRoom || !currentRoom.game) return null;

  const handleContinue = () => {
    socketService.voteGoToLobby(currentRoom.slug);
  };

  const handleLeave = () => {
    socketService.leaveRoom(currentRoom.slug);
    navigate('/home');
  };

  // Calculate scores
  const playerScores = Object.entries(currentRoom.game.results)
    .map(([playerId, result]) => {
      const client = currentRoom.clients.find(c => c.id === playerId);
      const totalScore = result.results?.reduce((sum, score) => sum + score, 0) || 0;
      return {
        playerId,
        username: client?.username || 'Unknown',
        answers: result.answers || [],
        scores: result.results || [],
        totalScore,
        isMe: playerId === clientId
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  const winner = playerScores[0];

  return (
    <div className='mx-auto max-w-6xl'>
      <div className='mb-6 rounded-lg bg-white p-6 shadow-lg'>
        <div className='mb-8 text-center'>
          <h2 className='mb-4 text-3xl font-bold'>Round {currentRoom.currentRound} Results</h2>
          {winner && (
            <div className='text-xl'>
              <span className='text-gray-600'>Winner: </span>
              <span className='font-bold text-purple-600'>{winner.username}</span>
              <span className='text-gray-600'> with </span>
              <span className='font-bold text-purple-600'>{winner.totalScore} points!</span>
            </div>
          )}
        </div>

        <div className='space-y-6'>
          {playerScores.map((player, index) => (
            <div
              key={player.playerId}
              className={`rounded-lg border p-4 ${player.isMe ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
            >
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div
                    className={`text-2xl font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-600'}`}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold'>{player.username}</h3>
                    {player.isMe && <span className='text-xs text-purple-600'>You</span>}
                  </div>
                </div>
                <div className='text-2xl font-bold text-purple-600'>{player.totalScore} pts</div>
              </div>

              <div className='grid grid-cols-1 gap-2 text-sm md:grid-cols-2'>
                {currentRoom.game?.currentPrompts.map((prompt, i) => (
                  <div key={i} className='flex justify-between'>
                    <span className='text-gray-600'>{prompt}:</span>
                    <div className='flex items-center space-x-2'>
                      <span className={player.answers[i] ? 'font-medium' : 'text-gray-400'}>
                        {player.answers[i] || 'No answer'}
                      </span>
                      <span
                        className={`font-bold ${player.scores[i] > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        ({player.scores[i] || 0})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='mt-8 flex justify-center space-x-4'>
          <button
            onClick={handleContinue}
            className='rounded-lg bg-green-500 px-8 py-3 font-semibold text-white transition hover:bg-green-600'
          >
            Play Again
          </button>
          <button
            onClick={handleLeave}
            className='rounded-lg border border-gray-300 px-8 py-3 font-semibold text-gray-700 transition hover:bg-gray-50'
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}
