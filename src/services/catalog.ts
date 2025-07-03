// services/catalog.ts
// Catalog data service for hierarchical brand → collection → product structure

import { supabase } from './supabase'

export interface CatalogBrand {
	id: string
	name: string
	slug: string
	description?: string
	brand_color?: string
	collections: CatalogCollection[]
}

export interface CatalogCollection {
	id: string
	name: string
	slug: string
	description?: string
	brand_id: string
	products: CatalogProduct[]
}

export interface CatalogProduct {
	id: string
	sku: string
	name: string
	slug: string
	description?: string
	primary_image_url?: string
	swatch_image_url?: string
	brand_id: string
	collection_id?: string
}

// Fetch all brands with their collections and products
export const fetchCatalogData = async (): Promise<CatalogBrand[]> => {
	try {
		// First, fetch all brands
		const { data: brands, error: brandsError } = await supabase
			.from('brands')
			.select('id, name, slug, description, brand_color')
			.eq('is_active', true)
			.order('name')

		if (brandsError) {
			console.error('Error fetching brands:', brandsError)
			return []
		}

		if (!brands || brands.length === 0) {
			return []
		}

		// Fetch collections for all brands
		const { data: collections, error: collectionsError } = await supabase
			.from('product_collections')
			.select('id, name, slug, description, brand_id')
			.eq('is_active', true)
			.order('display_order')

		if (collectionsError) {
			console.error('Error fetching collections:', collectionsError)
			return []
		}

		// Fetch products for all collections
		const { data: products, error: productsError } = await supabase
			.from('products')
			.select(
				'id, sku, name, slug, description, primary_image_url, swatch_image_url, brand_id, collection_id'
			)
			.eq('is_active', true)
			.eq('is_available', true)
			.order('name')

		if (productsError) {
			console.error('Error fetching products:', productsError)
			return []
		}

		// Build hierarchical structure
		const catalogData: CatalogBrand[] = brands.map(brand => ({
			...brand,
			collections: (collections || [])
				.filter(collection => collection.brand_id === brand.id)
				.map(collection => ({
					...collection,
					products: (products || [])
						.filter(product => product.collection_id === collection.id)
						.map(product => ({
							...product,
						})),
				})),
		}))

		return catalogData
	} catch (error) {
		console.error('Failed to fetch catalog data:', error)
		return []
	}
}

// Fetch brands only
export const fetchBrands = async (): Promise<CatalogBrand[]> => {
	try {
		const { data: brands, error } = await supabase
			.from('brands')
			.select('id, name, slug, description, brand_color')
			.eq('is_active', true)
			.order('name')

		if (error) {
			console.error('Error fetching brands:', error)
			return []
		}

		return (brands || []).map(brand => ({
			...brand,
			collections: [],
		}))
	} catch (error) {
		console.error('Failed to fetch brands:', error)
		return []
	}
}

// Fetch collections for a specific brand
export const fetchCollectionsByBrand = async (brandId: string): Promise<CatalogCollection[]> => {
	try {
		const { data: collections, error } = await supabase
			.from('product_collections')
			.select('id, name, slug, description, brand_id')
			.eq('brand_id', brandId)
			.eq('is_active', true)
			.order('display_order')

		if (error) {
			console.error('Error fetching collections:', error)
			return []
		}

		return (collections || []).map(collection => ({
			...collection,
			products: [],
		}))
	} catch (error) {
		console.error('Failed to fetch collections:', error)
		return []
	}
}

// Fetch products for a specific collection
export const fetchProductsByCollection = async (
	collectionId: string
): Promise<CatalogProduct[]> => {
	try {
		const { data: products, error } = await supabase
			.from('products')
			.select(
				'id, sku, name, slug, description, primary_image_url, swatch_image_url, brand_id, collection_id'
			)
			.eq('collection_id', collectionId)
			.eq('is_active', true)
			.eq('is_available', true)
			.order('name')

		if (error) {
			console.error('Error fetching products:', error)
			return []
		}

		return products || []
	} catch (error) {
		console.error('Failed to fetch products:', error)
		return []
	}
}

// Search across all catalog data
export const searchCatalog = async (
	searchTerm: string
): Promise<{
	brands: CatalogBrand[]
	collections: CatalogCollection[]
	products: CatalogProduct[]
}> => {
	try {
		const [brandsResult, collectionsResult, productsResult] = await Promise.all([
			// Search brands
			supabase
				.from('brands')
				.select('id, name, slug, description, brand_color')
				.ilike('name', `%${searchTerm}%`)
				.eq('is_active', true),

			// Search collections
			supabase
				.from('product_collections')
				.select('id, name, slug, description, brand_id')
				.ilike('name', `%${searchTerm}%`)
				.eq('is_active', true),

			// Search products
			supabase
				.from('products')
				.select(
					'id, sku, name, slug, description, primary_image_url, swatch_image_url, brand_id, collection_id'
				)
				.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
				.eq('is_active', true)
				.eq('is_available', true),
		])

		return {
			brands: (brandsResult.data || []).map(brand => ({ ...brand, collections: [] })),
			collections: (collectionsResult.data || []).map(collection => ({
				...collection,
				products: [],
			})),
			products: productsResult.data || [],
		}
	} catch (error) {
		console.error('Failed to search catalog:', error)
		return {
			brands: [],
			collections: [],
			products: [],
		}
	}
}
