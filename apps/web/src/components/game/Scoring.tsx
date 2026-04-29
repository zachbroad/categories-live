import { useGameStore } from '../../store/gameStore';

export default function Scoring() {
  const { currentRoom } = useGameStore();
  if (!currentRoom) return null;

  return (
    <div className='d-flex justify-content-center'>
      <div
        className='bg-white p-5 rounded shadow border border-black text-center'
        style={{ minWidth: '380px' }}
      >
        <div className='spinner-border text-primary mb-4' role='status' style={{ width: '4rem', height: '4rem' }}>
          <span className='visually-hidden'>Loading...</span>
        </div>
        <h2 className='mb-3'>Scoring Answers...</h2>
        <p className='lead mb-1'>Our AI is reviewing all answers</p>
        <p className='text-muted mb-0'>This will just take a moment</p>
      </div>
    </div>
  );
}
