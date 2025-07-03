// services/rooms.ts
// Room categories service using Supabase

import { supabase } from './supabase'

export interface RoomCategory {
	id: string
	name: string
	slug: string
	description: string
	image_url?: string
	display_order: number
	is_active: boolean
	meta_title?: string
	meta_description?: string
}

// Fetch all active room categories
export const fetchRoomCategories = async (): Promise<RoomCategory[]> => {
	try {
		const { data, error } = await supabase
			.from('room_categories')
			.select('*')
			.eq('is_active', true)
			.order('display_order')

		if (error) {
			console.error('Error fetching room categories:', error)
			return []
		}

		return data || []
	} catch (error) {
		console.error('Failed to fetch room categories:', error)
		return []
	}
}

// Fetch room category by slug
export const fetchRoomBySlug = async (slug: string): Promise<RoomCategory | null> => {
	try {
		const { data, error } = await supabase
			.from('room_categories')
			.select('*')
			.eq('slug', slug)
			.eq('is_active', true)
			.single()

		if (error) {
			console.error('Error fetching room category:', error)
			return null
		}

		return data
	} catch (error) {
		console.error('Failed to fetch room category:', error)
		return null
	}
}

// Fetch room categories with product counts
export const fetchRoomCategoriesWithCounts = async (): Promise<
	Array<RoomCategory & { product_count: number }>
> => {
	try {
		const { data, error } = await supabase
			.from('room_categories')
			.select(
				`
        *,
        room_product_mapping(
          product:products!inner(
            id
          )
        )
      `
			)
			.eq('is_active', true)
			.eq('room_product_mapping.products.is_active', true)
			.eq('room_product_mapping.products.is_available', true)
			.order('display_order')

		if (error) {
			console.error('Error fetching room categories with counts:', error)
			return []
		}

		// Calculate product counts
		const roomsWithCounts = (data || []).map(room => ({
			...room,
			product_count: room.room_product_mapping?.length || 0,
		}))

		return roomsWithCounts
	} catch (error) {
		console.error('Failed to fetch room categories with counts:', error)
		return []
	}
}
