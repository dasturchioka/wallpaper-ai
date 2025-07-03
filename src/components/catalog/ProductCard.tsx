import React from 'react'

interface ProductCardProps {
	product: any
	onSelect: (product: any) => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
	return (
		<div
			className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer'
			onClick={() => onSelect(product)}
		>
			<div className='aspect-square overflow-hidden rounded-t-lg'>
				<img
					src={product.primary_image_url}
					alt={product.name}
					className='w-full h-full object-cover hover:scale-105 transition-transform'
				/>
			</div>
			<div className='p-4'>
				<h3 className='font-semibold text-gray-900 mb-1'>{product.name}</h3>
				<p className='text-sm text-gray-500 mb-2'>{product.brand.name}</p>
				<div className='flex items-center justify-between'>
					<span className='text-xs px-2 py-1 bg-gray-100 rounded'>{product.finish_type}</span>
					<div className='flex gap-1'>
						{product.colors.slice(0, 3).map((color: any) => (
							<div
								key={color.id}
								className='w-6 h-6 rounded-full border-2 border-white shadow-sm'
								style={{ backgroundColor: color.color.hex_value }}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default ProductCard
