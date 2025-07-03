import { useCallback, useState } from 'react'

interface Segment {
	id: string
	mask_url: string
	class_name: string
	area: number
	bbox: number[]
	confidence: number
	stability_score: number
}

interface WallMask {
	id: string
	mask_url: string
	area: number
	bbox: number[]
	confidence: number
	stability_score: number
}

export const useImageUpload = () => {
	const [imageUrl, setImageUrl] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [wallMasks, setWallMasks] = useState<WallMask[]>([])
	const [aiDetectionLoading, setAiDetectionLoading] = useState(false)
	const [selectedWallIds, setSelectedWallIds] = useState<string[]>([])

	const loadImageFromDataUrl = useCallback(async (dataUrl: string) => {
		setImageUrl(dataUrl)
		setLoading(false) // Just load the image, no processing needed
		setError(null)
	}, [])

	const detectWalls = useCallback(async (imageFile: File) => {
		setAiDetectionLoading(true)
		setError(null)

		try {
			const formData = new FormData()
			formData.append('image', imageFile)

			const response = await fetch('http://localhost:3001/detect-walls', {
				method: 'POST',
				body: formData,
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					errorData.details || errorData.error || `AI detection failed: ${response.statusText}`
				)
			}

			const data = await response.json()
			const allSegments: Segment[] = data.segments || []

			// 🎯 Frontend filtering: Only use wall segments
			const wallSegments = allSegments.filter(
				segment => segment.class_name && segment.class_name.toLowerCase() === 'wall'
			)

			console.log(`📊 Total segments: ${allSegments.length}, Wall segments: ${wallSegments.length}`)

			// Convert to WallMask format (remove class_name since we know they're all walls)
			const wallMasks: WallMask[] = wallSegments.map(segment => ({
				id: segment.id,
				mask_url: segment.mask_url,
				area: segment.area,
				bbox: segment.bbox,
				confidence: segment.confidence,
				stability_score: segment.stability_score,
			}))

			setWallMasks(wallMasks)
			// Clear any existing selections when new walls are detected
			setSelectedWallIds([])
			return wallMasks
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to detect walls'
			setError(errorMessage)
			throw err
		} finally {
			setAiDetectionLoading(false)
		}
	}, [])

	const clearWallMasks = useCallback(() => {
		setWallMasks([])
		// Clear selections for AI walls when clearing masks
		setSelectedWallIds(prev => prev.filter(id => !wallMasks.some(mask => mask.id === id)))
	}, [wallMasks])

	// Multi-wall selection functions
	const toggleWallSelection = useCallback((wallId: string) => {
		setSelectedWallIds(prev =>
			prev.includes(wallId) ? prev.filter(id => id !== wallId) : [...prev, wallId]
		)
	}, [])

	const selectAllAIWalls = useCallback(() => {
		const aiWallIds = wallMasks.map(mask => mask.id)
		setSelectedWallIds(prev => {
			const nonAIWalls = prev.filter(id => !aiWallIds.includes(id))
			return [...nonAIWalls, ...aiWallIds]
		})
	}, [wallMasks])

	const clearAllSelections = useCallback(() => {
		setSelectedWallIds([])
	}, [])

	const selectMultipleWalls = useCallback((wallIds: string[]) => {
		setSelectedWallIds(wallIds)
	}, [])

	// Selection summary helpers
	const getSelectionSummary = useCallback(() => {
		const aiWallsSelected = selectedWallIds.filter(id =>
			wallMasks.some(mask => mask.id === id)
		).length
		const manualWallsSelected = selectedWallIds.length - aiWallsSelected

		return {
			total: selectedWallIds.length,
			aiWalls: aiWallsSelected,
			manualWalls: manualWallsSelected,
			isEmpty: selectedWallIds.length === 0,
		}
	}, [selectedWallIds, wallMasks])

	return {
		imageUrl,
		loading,
		error,
		wallMasks,
		aiDetectionLoading,
		selectedWallIds,
		loadImageFromDataUrl,
		detectWalls,
		clearWallMasks,
		// Multi-wall selection functions
		toggleWallSelection,
		selectAllAIWalls,
		clearAllSelections,
		selectMultipleWalls,
		getSelectionSummary,
	}
}
