import React from 'react'
import Button from './Button'

interface FloatingActionButtonsProps {
	onClear: () => void
	onClearAll: () => void
	onRedo: () => void
	onCompare: () => void
	canRedo: boolean
}

const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
	onClear,
	onClearAll,
	onRedo,
	onCompare,
	canRedo,
}) => {
	return (
		<div className='fixed bottom-6 right-6 flex flex-col gap-3'>
			<Button
				onClick={onCompare}
				className='bg-info hover:bg-blue-600 shadow-lg rounded-full w-12 h-12 p-0 flex items-center justify-center'
				title='Compare'
			>
				👁️
			</Button>
			<Button
				onClick={onRedo}
				disabled={!canRedo}
				className='bg-success hover:bg-green-600 shadow-lg rounded-full w-12 h-12 p-0 flex items-center justify-center'
				title='Redo'
			>
				↩️
			</Button>
			<Button
				onClick={onClear}
				className='bg-warning hover:bg-orange-600 shadow-lg rounded-full w-12 h-12 p-0 flex items-center justify-center'
				title='Clear Selected'
			>
				🗑️
			</Button>
			<Button
				onClick={onClearAll}
				className='bg-error hover:bg-red-600 shadow-lg rounded-full w-12 h-12 p-0 flex items-center justify-center'
				title='Clear All'
			>
				🧹
			</Button>
		</div>
	)
}

export default FloatingActionButtons
