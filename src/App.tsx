import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className='min-h-screen bg-gray-100 flex items-center justify-center'>
			<div className='max-w-md mx-auto text-center space-y-8'>
				<div className='flex justify-center space-x-8'>
					<a href='https://vite.dev' target='_blank' rel='noopener noreferrer'>
						<img
							src={viteLogo}
							className='h-24 w-24 transition-transform hover:scale-110 hover:drop-shadow-lg'
							alt='Vite logo'
						/>
					</a>
					<a href='https://react.dev' target='_blank' rel='noopener noreferrer'>
						<img
							src={reactLogo}
							className='h-24 w-24 transition-transform hover:scale-110 hover:drop-shadow-lg animate-spin-slow'
							alt='React logo'
						/>
					</a>
				</div>

				<h1 className='text-4xl font-bold text-gray-900'>
					Vite + React + Tailwind
				</h1>

				<div className='card'>
					<button
						className='btn-primary'
						onClick={() => setCount((count) => count + 1)}
					>
						Count is {count}
					</button>
					<p className='mt-4 text-gray-600'>
						Edit{' '}
						<code className='bg-gray-200 px-2 py-1 rounded text-sm'>
							src/App.tsx
						</code>{' '}
						and save to test HMR
					</p>
				</div>

				<p className='text-gray-500 text-sm'>
					Click on the Vite and React logos to learn more
				</p>
			</div>
		</div>
	);
}

export default App;
