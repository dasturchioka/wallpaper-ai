// services/products.ts
// Product data service using Supabase

import type { Product } from '../types/product'
import { supabase } from './supabase'

export interface ProductFilters {
	brand?: string
	category?: string
	finish_type?: string
	color_family?: string
	room_category?: string
	search?: string
}

// Fetch products with optional filters
export const fetchProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
	try {
		let query = supabase
			.from('products')
			.select(
				`
        *,
        brand:brands(*),
        category:product_categories(*),
        collection:product_collections(*),
        material_type:material_types(*),
        colors:product_colors(
          *,
          color:colors(*)
        ),
        room_mappings:room_product_mapping(
          *,
          room_category:room_categories(*)
        ),
        tags:product_tag_mapping(
          tag:product_tags(*)
        )
      `
			)
			.eq('is_active', true)
			.eq('is_available', true)

		// Apply filters
		if (filters.brand) {
			query = query.eq('brands.slug', filters.brand)
		}

		if (filters.category) {
			query = query.eq('product_categories.slug', filters.category)
		}

		if (filters.finish_type) {
			query = query.eq('finish_type', filters.finish_type)
		}

		if (filters.color_family) {
			query = query.eq('color_family', filters.color_family)
		}

		if (filters.room_category) {
			query = query.eq('room_product_mapping.room_categories.slug', filters.room_category)
		}

		if (filters.search) {
			query = query.textSearch('name,description', filters.search)
		}

		const { data, error } = await query.order('name')

		if (error) {
			console.error('Error fetching products:', error)
			return []
		}

		return data || []
	} catch (error) {
		console.error('Failed to fetch products:', error)
		return []
	}
}

// Fetch featured products for homepage
export const fetchFeaturedProducts = async (): Promise<Product[]> => {
	try {
		const { data, error } = await supabase
			.from('products')
			.select(
				`
        *,
        brand:brands(*),
        category:product_categories(*),
        colors:product_colors(
          *,
          color:colors(*)
        )
      `
			)
			.eq('is_featured', true)
			.eq('is_active', true)
			.eq('is_available', true)
			.order('name')
			.limit(12)

		if (error) {
			console.error('Error fetching featured products:', error)
			return []
		}

		return data || []
	} catch (error) {
		console.error('Failed to fetch featured products:', error)
		return []
	}
}

// Fetch products by room category
export const fetchProductsByRoom = async (roomSlug: string): Promise<Product[]> => {
	try {
		const { data, error } = await supabase
			.from('products')
			.select(
				`
        *,
        brand:brands(*),
        category:product_categories(*),
        colors:product_colors(
          *,
          color:colors(*)
        ),
        room_mappings:room_product_mapping!inner(
          suitability_score,
          is_recommended,
          room_category:room_categories!inner(slug)
        )
      `
			)
			.eq('is_active', true)
			.eq('is_available', true)
			.eq('room_product_mapping.room_categories.slug', roomSlug)
			.order('room_product_mapping.is_recommended', { ascending: false })
			.order('room_product_mapping.suitability_score', { ascending: false })
			.order('name')

		if (error) {
			console.error('Error fetching products by room:', error)
			return []
		}

		return data || []
	} catch (error) {
		console.error('Failed to fetch products by room:', error)
		return []
	}
}

// Fetch single product by ID
export const fetchProductById = async (id: string): Promise<Product | null> => {
	try {
		const { data, error } = await supabase
			.from('products')
			.select(
				`
        *,
        brand:brands(*),
        category:product_categories(*),
        collection:product_collections(*),
        material_type:material_types(*),
        colors:product_colors(
          *,
          color:colors(*)
        ),
        room_mappings:room_product_mapping(
          *,
          room_category:room_categories(*)
        ),
        tags:product_tag_mapping(
          tag:product_tags(*)
        )
      `
			)
			.eq('id', id)
			.eq('is_active', true)
			.single()

		if (error) {
			console.error('Error fetching product:', error)
			return null
		}

		return data
	} catch (error) {
		console.error('Failed to fetch product:', error)
		return null
	}
}

// Fetch filter options for UI
export const fetchFilterOptions = async () => {
	try {
		const [brandsResult, categoriesResult, finishTypesResult, colorFamiliesResult] =
			await Promise.all([
				// Brands
				supabase.from('brands').select('name, slug').eq('is_active', true).order('name'),

				// Categories
				supabase
					.from('product_categories')
					.select('name, slug')
					.eq('is_active', true)
					.order('display_order'),

				// Finish types (from enum)
				supabase
					.from('products')
					.select('finish_type')
					.not('finish_type', 'is', null)
					.eq('is_active', true)
					.eq('is_available', true),

				// Color families (from enum)
				supabase
					.from('products')
					.select('color_family')
					.not('color_family', 'is', null)
					.eq('is_active', true)
					.eq('is_available', true),
			])

		const filterOptions = {
			brands: brandsResult.data || [],
			categories: categoriesResult.data || [],
			finishTypes: [...new Set((finishTypesResult.data || []).map(p => p.finish_type))],
			colorFamilies: [...new Set((colorFamiliesResult.data || []).map(p => p.color_family))],
		}

		return filterOptions
	} catch (error) {
		console.error('Failed to fetch filter options:', error)
		return {
			brands: [],
			categories: [],
			finishTypes: [],
			colorFamilies: [],
		}
	}
}
