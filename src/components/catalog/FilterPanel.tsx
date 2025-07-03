import React from 'react'

const colorFamilies = [
	{ value: 'red', label: 'Red', color: '#F87171' },
	{ value: 'orange', label: 'Orange', color: '#F59E0B' },
	{ value: 'yellow', label: 'Yellow', color: '#FBBF24' },
	{ value: 'green', label: 'Green', color: '#34D399' },
	{ value: 'blue', label: 'Blue', color: '#60A5FA' },
	{ value: 'purple', label: 'Purple', color: '#A78BFA' },
	{ value: 'gray', label: 'Gray', color: '#9CA3AF' },
	{ value: 'black', label: 'Black', color: '#111827' },
	{ value: 'white', label: 'White', color: '#F9FAFB' },
]

const FilterPanel: React.FC = () => {
	// TODO: Connect to useCatalogStore for filters, brands, categories
	return (
		<div className='bg-white p-4 rounded-lg shadow-none'>
			<h3 className='font-semibold text-gray-900 mb-4'>Filters</h3>
			{/* Brand Filter */}
			<div className='mb-6'>
				<label className='block text-sm font-medium text-gray-700 mb-2'>Brand</label>
				<select className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent'>
					<option value=''>All Brands</option>
					{/* TODO: Map brands */}
				</select>
			</div>
			{/* Color Family Filter */}
			<div className='mb-6'>
				<label className='block text-sm font-medium text-gray-700 mb-2'>Color Family</label>
				<div className='grid grid-cols-4 gap-2'>
					{colorFamilies.map(family => (
						<button
							key={family.value}
							className={`p-2 rounded-md border border-gray-300 hover:border-primary`}
							style={{ backgroundColor: family.color }}
						>
							<span className='text-xs text-white drop-shadow-sm'>{family.label}</span>
						</button>
					))}
				</div>
			</div>
		</div>
	)
}

export default FilterPanel
