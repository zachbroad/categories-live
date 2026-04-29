import { useNavigate } from 'react-router';

import { socketService } from '../../services/socket';
import { useGameStore } from '../../store/gameStore';

function placeColor(idx: number) {
  if (idx === 0) return 'text-warning';
  if (idx === 1) return 'text-secondary';
  if (idx === 2) return 'text-danger';
  return 'text-muted';
}

export default function Results() {
  const navigate = useNavigate();
  const { currentRoom, clientId } = useGameStore();

  if (!currentRoom || !currentRoom.game) return null;

  const handleContinue = () => socketService.voteGoToLobby(currentRoom.slug);

  const handleLeave = () => {
    socketService.leaveRoom(currentRoom.slug);
    navigate('/home');
  };

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
    <div className='board-item-container' style={{ maxWidth: '900px' }}>
      <div className='bg-white p-4 rounded shadow border border-black'>
        <div className='text-center mb-4'>
          <h2 className='mb-2'>Round {currentRoom.currentRound} Results</h2>
          {winner && (
            <p className='lead mb-0'>
              Winner: <span className='fw-bold text-primary'>{winner.username}</span> with{' '}
              <span className='fw-bold text-primary'>{winner.totalScore} points!</span>
            </p>
          )}
        </div>

        {playerScores.map((player, index) => (
          <div
            key={player.playerId}
            className={`p-3 mb-3 rounded border ${
              player.isMe ? 'border-primary bg-light' : 'border-black'
            }`}
          >
            <div className='d-flex justify-content-between align-items-center mb-2'>
              <div className='d-flex align-items-center'>
                <span className={`h3 mb-0 me-3 ${placeColor(index)}`}>#{index + 1}</span>
                <div>
                  <h5 className='mb-0'>{player.username}</h5>
                  {player.isMe && <small className='text-primary'>You</small>}
                </div>
              </div>
              <span className='h4 mb-0 text-primary'>{player.totalScore} pts</span>
            </div>

            <div className='row g-2 small'>
              {currentRoom.game?.currentPrompts.map((prompt, i) => (
                <div key={i} className='col-md-6 d-flex justify-content-between'>
                  <span className='text-muted'>{prompt}:</span>
                  <span>
                    <span className={player.answers[i] ? 'fw-medium' : 'text-muted'}>
                      {player.answers[i] || 'No answer'}
                    </span>{' '}
                    <span
                      className={`fw-bold ${player.scores[i] > 0 ? 'text-success' : 'text-danger'}`}
                    >
                      ({player.scores[i] || 0})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className='d-flex justify-content-center gap-3 mt-4'>
          <button className='btn btn-success btn-lg' onClick={handleContinue}>
            Play Again
          </button>
          <button className='btn btn-outline-secondary btn-lg' onClick={handleLeave}>
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}
