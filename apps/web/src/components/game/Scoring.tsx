import { useGameStore } from '../../store/gameStore';

export default function Scoring() {
  const { currentRoom } = useGameStore();

  if (!currentRoom) return null;

  return (
    <div className='flex min-h-[60vh] items-center justify-center'>
      <div className='rounded-lg bg-white p-12 text-center shadow-lg'>
        <div className='mb-6'>
          <div className='animate-pulse'>
            <svg
              className='mx-auto h-24 w-24 text-purple-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
              />
            </svg>
          </div>
        </div>

        <h2 className='mb-4 text-3xl font-bold'>Scoring Answers...</h2>

        <div className='text-lg text-gray-600'>
          <p>Our AI is reviewing all answers</p>
          <p className='mt-2'>This will just take a moment</p>
        </div>

        <div className='mt-6'>
          <div className='inline-flex space-x-2'>
            <div
              className='h-3 w-3 animate-bounce rounded-full bg-purple-600'
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className='h-3 w-3 animate-bounce rounded-full bg-purple-600'
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className='h-3 w-3 animate-bounce rounded-full bg-purple-600'
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
