import React from 'react'
import { Link } from 'react-router-dom'

const HeaderBar: React.FC = () => {
	return (
		<header className='w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between'>
			<Link to='/' className='flex items-center gap-2'>
				<span className='text-xl font-bold text-primary'>Palitra Visualizer</span>
			</Link>
			<nav className='flex gap-4'>
				<Link
					to='/editor'
					className='text-gray-700 hover:text-primary font-medium transition-colors'
				>
					Editor
				</Link>
				{/* Add more nav links as needed */}
			</nav>
		</header>
	)
}

export default HeaderBar
