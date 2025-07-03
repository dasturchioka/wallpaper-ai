// hooks/useProducts.ts
// Custom hook for product data management

import { useEffect, useState } from 'react'
import type { ProductFilters } from '../services/products'
import {
	fetchFeaturedProducts,
	fetchFilterOptions,
	fetchProductById,
	fetchProducts,
	fetchProductsByRoom,
} from '../services/products'
import type { Product } from '../types/product'

export const useProducts = (filters: ProductFilters = {}) => {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const loadProducts = async () => {
			setLoading(true)
			setError(null)

			try {
				const data = await fetchProducts(filters)
				setProducts(data)
			} catch (err: any) {
				setError(err.message || 'Failed to load products')
				console.error('Error loading products:', err)
			} finally {
				setLoading(false)
			}
		}

		loadProducts()
	}, [JSON.stringify(filters)])

	return { products, loading, error, refetch: () => setProducts([]) }
}

export const useFeaturedProducts = () => {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const loadFeaturedProducts = async () => {
			setLoading(true)
			setError(null)

			try {
				const data = await fetchFeaturedProducts()
				setProducts(data)
			} catch (err: any) {
				setError(err.message || 'Failed to load featured products')
				console.error('Error loading featured products:', err)
			} finally {
				setLoading(false)
			}
		}

		loadFeaturedProducts()
	}, [])

	return { products, loading, error }
}

export const useProductsByRoom = (roomSlug: string) => {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!roomSlug) return

		const loadProductsByRoom = async () => {
			setLoading(true)
			setError(null)

			try {
				const data = await fetchProductsByRoom(roomSlug)
				setProducts(data)
			} catch (err: any) {
				setError(err.message || 'Failed to load products for room')
				console.error('Error loading products by room:', err)
			} finally {
				setLoading(false)
			}
		}

		loadProductsByRoom()
	}, [roomSlug])

	return { products, loading, error }
}

export const useProduct = (id: string) => {
	const [product, setProduct] = useState<Product | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!id) return

		const loadProduct = async () => {
			setLoading(true)
			setError(null)

			try {
				const data = await fetchProductById(id)
				setProduct(data)
			} catch (err: any) {
				setError(err.message || 'Failed to load product')
				console.error('Error loading product:', err)
			} finally {
				setLoading(false)
			}
		}

		loadProduct()
	}, [id])

	return { product, loading, error }
}

export const useFilterOptions = () => {
	const [filterOptions, setFilterOptions] = useState<{
		brands: Array<{ name: string; slug: string }>
		categories: Array<{ name: string; slug: string }>
		finishTypes: string[]
		colorFamilies: string[]
	}>({
		brands: [],
		categories: [],
		finishTypes: [],
		colorFamilies: [],
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const loadFilterOptions = async () => {
			setLoading(true)
			setError(null)

			try {
				const data = await fetchFilterOptions()
				setFilterOptions(data)
			} catch (err: any) {
				setError(err.message || 'Failed to load filter options')
				console.error('Error loading filter options:', err)
			} finally {
				setLoading(false)
			}
		}

		loadFilterOptions()
	}, [])

	return { filterOptions, loading, error }
}
