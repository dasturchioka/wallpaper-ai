import { useCallback, useState } from 'react'
import axios from 'axios'

interface WallContour {
	id: string
	points: number[][] // Each contour is an array of [x, y] pairs
}

export const useImageUpload = () => {
	const [imageUrl, setImageUrl] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [wallContours, setWallContours] = useState<WallContour[]>([])
	const [aiDetectionLoading, setAiDetectionLoading] = useState(false)
	const [selectedWallIds, setSelectedWallIds] = useState<string[]>([])

	const loadImageFromDataUrl = useCallback(async (dataUrl: string) => {
		setImageUrl(dataUrl)
		setLoading(false)
		setError(null)
	}, [])

	const detectWalls = useCallback(async (imageFile: File) => {
		setAiDetectionLoading(true)
		setError(null)
		try {
			// Validate file type before upload
			const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml']
			const forbidden = ['image/heic', 'image/gif', 'image/webp']
			if (forbidden.includes(imageFile.type)) {
				throw new Error('Unsupported image format. Please upload a JPG, PNG, or SVG.')
			}
			if (!allowed.includes(imageFile.type)) {
				throw new Error('Unsupported image format. Please upload a JPG, PNG, or SVG.')
			}
			const formData = new FormData()
			formData.append('room_image', imageFile)
			const response = await axios.post(
				'https://vision-api.p.rapidapi.com/segmentation/walls',
				formData,
				{
					headers: {
						'x-rapidapi-key': 'cc493c1a46msh57c0cd2bf14e2f2p1596e7jsn224007c4a617',
						'x-rapidapi-host': 'vision-api.p.rapidapi.com',
						Accept: 'application/json',
					},
				}
			)
			if (response.status !== 200) {
				const errorData = response.data
				throw new Error(
					errorData.details || errorData.error || `AI detection failed: ${response.statusText}`
				)
			}
			const data = response.data
			const contours: number[][][] = data.contours || []
			// Each contour is an array of [ [x1, y1], [x2, y2], ... ]
			const wallContours: WallContour[] = contours.map((contour, i) => ({
				id: `contour-${i + 1}`,
				points: contour,
			}))
			setWallContours(wallContours)
			setSelectedWallIds([])
			return wallContours
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to detect walls'
			setError(errorMessage)
			throw err
		} finally {
			setAiDetectionLoading(false)
		}
	}, [])

	const clearWallContours = useCallback(() => {
		setWallContours([])
		setSelectedWallIds([])
	}, [])

	// Multi-wall selection functions
	const toggleWallSelection = useCallback((wallId: string) => {
		setSelectedWallIds(prev =>
			prev.includes(wallId) ? prev.filter(id => id !== wallId) : [...prev, wallId]
		)
	}, [])

	const selectAllAIWalls = useCallback(() => {
		const aiWallIds = wallContours.map(mask => mask.id)
		setSelectedWallIds(prev => {
			const nonAIWalls = prev.filter(id => !aiWallIds.includes(id))
			return [...nonAIWalls, ...aiWallIds]
		})
	}, [wallContours])

	const clearAllSelections = useCallback(() => {
		setSelectedWallIds([])
	}, [])

	const selectMultipleWalls = useCallback((wallIds: string[]) => {
		setSelectedWallIds(wallIds)
	}, [])

	// Selection summary helpers
	const getSelectionSummary = useCallback(() => {
		const aiWallsSelected = selectedWallIds.filter(id =>
			wallContours.some(mask => mask.id === id)
		).length
		const manualWallsSelected = selectedWallIds.length - aiWallsSelected
		return {
			total: selectedWallIds.length,
			aiWalls: aiWallsSelected,
			manualWalls: manualWallsSelected,
			isEmpty: selectedWallIds.length === 0,
		}
	}, [selectedWallIds, wallContours])

	return {
		imageUrl,
		loading,
		error,
		wallContours,
		aiDetectionLoading,
		selectedWallIds,
		loadImageFromDataUrl,
		detectWalls,
		clearWallContours,
		// Multi-wall selection functions
		toggleWallSelection,
		selectAllAIWalls,
		clearAllSelections,
		selectMultipleWalls,
		getSelectionSummary,
	}
}
