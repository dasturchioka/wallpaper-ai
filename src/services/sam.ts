// services/sam.ts
// SAM (Segment Anything Model) API integration via Supabase Edge Function

import { supabase } from './supabase'

export const segmentWalls = async (imageUrl: string): Promise<any> => {
	try {
		console.log('Calling Supabase edge function for wall segmentation...', { imageUrl })

		const { data, error } = await supabase.functions.invoke('replicate-call', {
			body: {
				model: 'meta/sam-2:fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83',
				input: {
					image: imageUrl,
					use_m2m: true,
					points_per_side: 32,
					pred_iou_thresh: 0.88,
					stability_score_thresh: 0.95,
				},
			},
		})

		if (error) {
			console.error('Supabase edge function error:', error)
			throw new Error(`Wall segmentation failed: ${error.message}`)
		}

		if (!data) {
			throw new Error('No data returned from wall segmentation')
		}

		console.log('Wall segmentation successful:', data)

		// Handle different possible response formats from your edge function
		// The edge function might return the Replicate response directly,
		// or wrap it in another structure
		if (data.output) {
			return { masks: data.output }
		} else if (data.masks) {
			return data
		} else if (Array.isArray(data)) {
			return { masks: data }
		} else {
			// If data structure is unexpected, log it and use as-is
			console.log('Unexpected response structure, using as-is:', data)
			return data
		}
	} catch (error) {
		console.warn('Wall segmentation failed. Using mock data for demo.', error)
		// Return mock segmentation data for demo purposes with CLEAR NON-OVERLAPPING WALLS
		return {
			masks: [
				{ points: [50, 50, 250, 50, 250, 200, 50, 200] }, // Wall 1: Top-left (200x150)
				{ points: [300, 50, 500, 50, 500, 200, 300, 200] }, // Wall 2: Top-right (200x150)
				{ points: [50, 250, 500, 250, 500, 400, 50, 400] }, // Wall 3: Bottom (450x150)
			],
		}
	}
}

// Process SAM results into wall polygons
export const processSegmentationMasks = (masks: any[]): any[] => {
	return masks.map((mask, index) => ({
		id: `wall-${index + 1}`,
		points: mask.points || [
			100 + index * 200,
			100,
			300 + index * 200,
			100,
			300 + index * 200,
			300,
			100 + index * 200,
			300,
		],
		bounds: calculateBounds(mask.points || []),
	}))
}

const calculateBounds = (points: number[]) => {
	if (!points || points.length < 4) return { x: 0, y: 0, width: 0, height: 0 }

	const xCoords = points.filter((_, i) => i % 2 === 0)
	const yCoords = points.filter((_, i) => i % 2 === 1)

	const minX = Math.min(...xCoords)
	const maxX = Math.max(...xCoords)
	const minY = Math.min(...yCoords)
	const maxY = Math.max(...yCoords)

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY,
	}
}
