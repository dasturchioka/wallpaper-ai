// hooks/useRooms.ts
// Custom hook for room categories data management

import { useState, useEffect } from 'react'
import type { RoomCategory } from '../services/rooms'
import { fetchRoomCategories, fetchRoomBySlug, fetchRoomCategoriesWithCounts } from '../services/rooms'

export const useRoomCategories = () => {
	const [rooms, setRooms] = useState<RoomCategory[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const loadRooms = async () => {
			setLoading(true)
			setError(null)

			try {
				const data = await fetchRoomCategories()
				setRooms(data)
			} catch (err: any) {
				setError(err.message || 'Failed to load room categories')
				console.error('Error loading room categories:', err)
			} finally {
				setLoading(false)
			}
		}

		loadRooms()
	}, [])

	return { rooms, loading, error }
}

export const useRoomCategoriesWithCounts = () => {
	const [rooms, setRooms] = useState<Array<RoomCategory & { product_count: number }>>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const loadRoomsWithCounts = async () => {
			setLoading(true)
			setError(null)

			try {
				const data = await fetchRoomCategoriesWithCounts()
				setRooms(data)
			} catch (err: any) {
				setError(err.message || 'Failed to load room categories with counts')
				console.error('Error loading room categories with counts:', err)
			} finally {
				setLoading(false)
			}
		}

		loadRoomsWithCounts()
	}, [])

	return { rooms, loading, error }
}

export const useRoomBySlug = (slug: string) => {
	const [room, setRoom] = useState<RoomCategory | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!slug) return

		const loadRoom = async () => {
			setLoading(true)
			setError(null)

			try {
				const data = await fetchRoomBySlug(slug)
				setRoom(data)
			} catch (err: any) {
				setError(err.message || 'Failed to load room category')
				console.error('Error loading room category:', err)
			} finally {
				setLoading(false)
			}
		}

		loadRoom()
	}, [slug])

	return { room, loading, error }
}
