// hooks/useCatalog.ts
// Custom hook for managing catalog data

import { useState, useEffect, useCallback } from 'react'
import {
	fetchBrands,
	fetchCollectionsByBrand,
	fetchProductsByCollection,
	fetchCatalogData,
	searchCatalog,
	type CatalogBrand,
	type CatalogCollection,
	type CatalogProduct
} from '../services/catalog'

export interface UseCatalogReturn {
	// Data
	brands: CatalogBrand[]
	collections: CatalogCollection[]
	products: CatalogProduct[]

	// Loading states
	loading: boolean
	brandsLoading: boolean
	collectionsLoading: boolean
	productsLoading: boolean

	// Error states
	error: string | null

	// Actions
	loadBrands: () => Promise<void>
	loadCollections: (brandId: string) => Promise<void>
	loadProducts: (collectionId: string) => Promise<void>
	searchAll: (searchTerm: string) => Promise<void>
	reset: () => void
}

export const useCatalog = (): UseCatalogReturn => {
	const [brands, setBrands] = useState<CatalogBrand[]>([])
	const [collections, setCollections] = useState<CatalogCollection[]>([])
	const [products, setProducts] = useState<CatalogProduct[]>([])

	const [loading, setLoading] = useState(false)
	const [brandsLoading, setBrandsLoading] = useState(false)
	const [collectionsLoading, setCollectionsLoading] = useState(false)
	const [productsLoading, setProductsLoading] = useState(false)

	const [error, setError] = useState<string | null>(null)

	// Load brands
	const loadBrands = useCallback(async () => {
		try {
			setBrandsLoading(true)
			setError(null)
			const brandsData = await fetchBrands()
			setBrands(brandsData)
		} catch (err) {
			console.error('Failed to load brands:', err)
			setError('Failed to load brands')
		} finally {
			setBrandsLoading(false)
		}
	}, [])

	// Load collections for a brand
	const loadCollections = useCallback(async (brandId: string) => {
		try {
			setCollectionsLoading(true)
			setError(null)
			const collectionsData = await fetchCollectionsByBrand(brandId)
			setCollections(collectionsData)
			// Clear products when switching brands
			setProducts([])
		} catch (err) {
			console.error('Failed to load collections:', err)
			setError('Failed to load collections')
		} finally {
			setCollectionsLoading(false)
		}
	}, [])

	// Load products for a collection
	const loadProducts = useCallback(async (collectionId: string) => {
		try {
			setProductsLoading(true)
			setError(null)
			const productsData = await fetchProductsByCollection(collectionId)
			setProducts(productsData)
		} catch (err) {
			console.error('Failed to load products:', err)
			setError('Failed to load products')
		} finally {
			setProductsLoading(false)
		}
	}, [])

	// Search across all data
	const searchAll = useCallback(async (searchTerm: string) => {
		if (!searchTerm.trim()) {
			return
		}

		try {
			setLoading(true)
			setError(null)
			const searchResults = await searchCatalog(searchTerm)
			setBrands(searchResults.brands)
			setCollections(searchResults.collections)
			setProducts(searchResults.products)
		} catch (err) {
			console.error('Failed to search catalog:', err)
			setError('Failed to search catalog')
		} finally {
			setLoading(false)
		}
	}, [])

	// Reset all data
	const reset = useCallback(() => {
		setBrands([])
		setCollections([])
		setProducts([])
		setError(null)
	}, [])

	// Load brands on mount
	useEffect(() => {
		loadBrands()
	}, [loadBrands])

	return {
		// Data
		brands,
		collections,
		products,

		// Loading states
		loading: loading || brandsLoading || collectionsLoading || productsLoading,
		brandsLoading,
		collectionsLoading,
		productsLoading,

		// Error state
		error,

		// Actions
		loadBrands,
		loadCollections,
		loadProducts,
		searchAll,
		reset
	}
}