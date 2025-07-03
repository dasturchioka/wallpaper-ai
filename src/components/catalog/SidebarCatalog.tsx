import {
	ChevronLeftIcon,
	CubeIcon,
	ExclamationTriangleIcon,
	MagnifyingGlassIcon,
	PaintBrushIcon,
	PhotoIcon,
	SparklesIcon,
	SwatchIcon,
} from '@heroicons/react/24/outline'
import React, { useMemo, useState } from 'react'
import { useCatalog } from '../../hooks/useCatalog'
import type { CatalogBrand, CatalogCollection, CatalogProduct } from '../../services/catalog'

interface SidebarCatalogProps {
	onSelect: (product: CatalogProduct) => void
}

type NavigationLevel = 'brands' | 'collections' | 'products'

interface NavigationState {
	level: NavigationLevel
	selectedBrand?: CatalogBrand
	selectedCollection?: CatalogCollection
}

const SidebarCatalog: React.FC<SidebarCatalogProps> = ({ onSelect }) => {
	const {
		brands,
		collections,
		products,
		loading,
		brandsLoading,
		collectionsLoading,
		productsLoading,
		error,
		loadCollections,
		loadProducts,
		reset,
	} = useCatalog()

	const [navigation, setNavigation] = useState<NavigationState>({ level: 'brands' })
	const [searchTerm, setSearchTerm] = useState('')

	// Frontend-only search - no API calls
	const currentItems = useMemo(() => {
		const filterBySearch = (items: any[], searchFields: string[]) => {
			if (!searchTerm.trim()) return items

			const lowerSearch = searchTerm.toLowerCase()
			return items.filter(item =>
				searchFields.some(field => item[field]?.toLowerCase().includes(lowerSearch))
			)
		}

		if (navigation.level === 'brands') {
			return filterBySearch(brands, ['name', 'description'])
		} else if (navigation.level === 'collections') {
			return filterBySearch(collections, ['name', 'description'])
		} else if (navigation.level === 'products') {
			return filterBySearch(products, ['name', 'sku', 'description'])
		}
		return []
	}, [navigation.level, brands, collections, products, searchTerm])

	const handleBack = () => {
		if (navigation.level === 'collections') {
			setNavigation({ level: 'brands' })
		} else if (navigation.level === 'products') {
			setNavigation({
				level: 'collections',
				selectedBrand: navigation.selectedBrand,
			})
		}
		setSearchTerm('')
	}

	const handleBrandSelect = async (brand: CatalogBrand) => {
		setNavigation({
			level: 'collections',
			selectedBrand: brand,
		})
		setSearchTerm('')
		await loadCollections(brand.id)
	}

	const handleCollectionSelect = async (collection: CatalogCollection) => {
		setNavigation({
			level: 'products',
			selectedBrand: navigation.selectedBrand,
			selectedCollection: collection,
		})
		setSearchTerm('')
		await loadProducts(collection.id)
	}

	const handleProductSelect = (product: CatalogProduct) => {
		onSelect(product)
	}

	const getTitle = () => {
		if (navigation.level === 'brands') return 'Design Catalog'
		if (navigation.level === 'collections') return navigation.selectedBrand?.name || 'Collections'
		if (navigation.level === 'products') return navigation.selectedCollection?.name || 'Products'
		return 'Catalog'
	}

	const renderBrandCard = (brand: CatalogBrand) => (
		<div
			key={brand.id}
			onClick={() => handleBrandSelect(brand)}
			className='cursor-pointer group transform transition-all duration-200 hover:scale-105'
		>
			<div
				className='relative aspect-[4/3] mb-3 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-200'
				style={{ backgroundColor: brand.brand_color || '#F59E0B' }}
			>
				<div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/20 to-black/20'>
					<div className='text-center p-4'>
						<SwatchIcon className='w-8 h-8 text-white mx-auto mb-2' />
						<span className='text-white font-bold text-sm'>{brand.name}</span>
					</div>
				</div>
				<div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200' />
				<div className='absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
					<p className='font-semibold text-sm truncate'>{brand.name}</p>
				</div>
			</div>
		</div>
	)

	const renderCollectionCard = (collection: CatalogCollection) => (
		<div
			key={collection.id}
			onClick={() => handleCollectionSelect(collection)}
			className='cursor-pointer group transform transition-all duration-200 hover:scale-105'
		>
			<div className='relative aspect-[4/3] mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-md group-hover:shadow-lg transition-shadow duration-200'>
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='text-center p-4'>
						<PhotoIcon className='w-8 h-8 text-gray-400 mx-auto mb-2' />
						<span className='text-gray-600 font-medium text-sm text-center'>{collection.name}</span>
					</div>
				</div>
				<div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200' />
				<div className='absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
					<p className='font-semibold text-sm truncate'>{collection.name}</p>
				</div>
			</div>
		</div>
	)

	const renderProductCard = (product: CatalogProduct) => (
		<div
			key={product.id}
			onClick={() => handleProductSelect(product)}
			className='cursor-pointer group transform transition-all duration-200 hover:scale-105'
		>
			<div className='relative aspect-square mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-md group-hover:shadow-lg transition-shadow duration-200'>
				{product.primary_image_url || product.swatch_image_url ? (
					<img
						src={product.primary_image_url || product.swatch_image_url}
						alt={product.name}
						className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
						onError={e => {
							e.currentTarget.style.display = 'none'
						}}
					/>
				) : (
					<div className='absolute inset-0 flex items-center justify-center'>
						<div className='text-center p-3'>
							<PaintBrushIcon className='w-6 h-6 text-gray-400 mx-auto mb-2' />
							<span className='text-gray-500 font-medium text-xs text-center'>{product.sku}</span>
						</div>
					</div>
				)}
				<div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200' />
				<div className='absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
					<p className='font-semibold text-xs truncate'>{product.name}</p>
				</div>
			</div>
			<div className='space-y-1'>
				<p className='text-sm font-semibold text-gray-900 truncate'>{product.sku}</p>
				<button className='text-xs text-orange-600 hover:text-orange-800 font-medium transition-colors duration-200 flex items-center gap-1'>
					<SparklesIcon className='w-3 h-3' />
					Apply to Wall
				</button>
			</div>
		</div>
	)

	const renderContent = () => {
		if (error) {
			return (
				<div className='flex items-center justify-center h-48'>
					<div className='text-center p-6'>
						<ExclamationTriangleIcon className='w-12 h-12 text-red-500 mx-auto mb-3' />
						<p className='text-gray-700 font-medium mb-2'>Unable to Load Catalog</p>
						<p className='text-gray-500 text-sm mb-4'>{error}</p>
						<button
							onClick={() => window.location.reload()}
							className='px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200'
						>
							Try Again
						</button>
					</div>
				</div>
			)
		}

		if (loading) {
			return (
				<div className='flex items-center justify-center h-48'>
					<div className='text-center'>
						<div className='relative'>
							<div className='w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4'></div>
							<CubeIcon className='w-6 h-6 text-orange-500 absolute top-3 left-1/2 transform -translate-x-1/2' />
						</div>
						<p className='text-gray-600 font-medium'>Loading catalog...</p>
					</div>
				</div>
			)
		}

		if (currentItems.length === 0) {
			return (
				<div className='flex items-center justify-center h-48'>
					<div className='text-center p-6'>
						<MagnifyingGlassIcon className='w-12 h-12 text-gray-400 mx-auto mb-3' />
						<p className='text-gray-600 font-medium mb-1'>No items found</p>
						{searchTerm && (
							<p className='text-gray-500 text-sm'>Try adjusting your search for "{searchTerm}"</p>
						)}
					</div>
				</div>
			)
		}

		return (
			<div className='grid grid-cols-2 gap-4 pb-6'>
				{navigation.level === 'brands' && (currentItems as CatalogBrand[]).map(renderBrandCard)}
				{navigation.level === 'collections' &&
					(currentItems as CatalogCollection[]).map(renderCollectionCard)}
				{navigation.level === 'products' &&
					(currentItems as CatalogProduct[]).map(renderProductCard)}
			</div>
		)
	}

	return (
		<aside className='w-80 bg-white border-r border-gray-200 border-t h-screen flex flex-col shadow-lg'>
			{/* Header */}
			<div className='p-6 border-b border-gray-200 '>
				<div className='flex items-center justify-between mb-4'>
					{navigation.level !== 'brands' && (
						<button
							onClick={handleBack}
							className='p-2 hover:bg-orange-100 rounded-full transition-colors duration-200 group'
							disabled={loading}
						>
							<ChevronLeftIcon className='w-5 h-5 text-gray-600 group-hover:text-orange-600' />
						</button>
					)}
					<h2 className='text-xl font-bold text-gray-900 flex-1 text-center'>{getTitle()}</h2>
					<div className='flex items-center'>
						<span className='text-sm font-semibold text-white bg-orange-500 px-3 py-1 rounded-full shadow-sm'>
							{currentItems.length}
						</span>
					</div>
				</div>

				{/* Search */}
				<div className='relative'>
					<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
						<MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
					</div>
					<input
						type='text'
						placeholder={`Search ${navigation.level}...`}
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						disabled={loading}
						className='block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white shadow-sm'
					/>
				</div>
			</div>

			{/* Content */}
			<div className='flex-1 overflow-y-auto p-6 sidebar-scroll bg-gradient-to-b from-white to-gray-50'>
				{renderContent()}
			</div>
		</aside>
	)
}

export default SidebarCatalog
