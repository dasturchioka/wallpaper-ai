import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Circle, Group, Image as KonvaImage, Layer, Line, Stage } from 'react-konva'

interface Wall {
	id: string
	points: number[]
}

interface WallMaskingCanvasProps {
	imageUrl: string
	walls: Wall[]
	selectedWallIds: string[]
	onWallSelect: (wallId: string) => void
	onStartDrawing: () => void
	onCompleteWall: () => void
	onCanvasClick: (point: { x: number; y: number }) => void
	isDrawingMode: boolean
	currentDrawing: number[]
	appliedTextures: Record<string, string>
	loading?: boolean
	error?: string | null
}

const WallMaskingCanvas: React.FC<WallMaskingCanvasProps> = ({
	imageUrl,
	walls,
	selectedWallIds,
	onWallSelect,
	onStartDrawing,
	onCompleteWall,
	onCanvasClick,
	isDrawingMode,
	currentDrawing,
	appliedTextures,
	loading = false,
	error = null,
}) => {
	const [image, setImage] = useState<HTMLImageElement | null>(null)
	const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
	const [textureImages, setTextureImages] = useState<Record<string, HTMLImageElement>>({})
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
	const containerRef = useRef<HTMLDivElement>(null)

	// Measure container size
	const updateContainerSize = useCallback(() => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect()
			// Account for padding (32px total - 16px on each side)
			const padding = 32
			setContainerSize({
				width: Math.max(0, rect.width - padding),
				height: Math.max(0, rect.height - padding),
			})
		}
	}, [])

	// Set up resize observer
	useEffect(() => {
		updateContainerSize()

		const resizeObserver = new ResizeObserver(updateContainerSize)
		if (containerRef.current) {
			resizeObserver.observe(containerRef.current)
		}

		return () => {
			resizeObserver.disconnect()
		}
	}, [updateContainerSize])

	// Load image from URL
	useEffect(() => {
		if (!imageUrl) return

		const img = new window.Image()
		img.onload = () => {
			setImage(img)
		}
		img.onerror = () => {
			console.error('Failed to load image:', imageUrl)
		}
		img.crossOrigin = 'anonymous'
		img.src = imageUrl
	}, [imageUrl])

	// Calculate canvas size based on container and image dimensions
	useEffect(() => {
		if (!image || containerSize.width === 0 || containerSize.height === 0) return

		const containerAspectRatio = containerSize.width / containerSize.height
		const imageAspectRatio = image.width / image.height

		let width, height

		if (imageAspectRatio > containerAspectRatio) {
			// Image is wider than container - fit to width
			width = containerSize.width
			height = width / imageAspectRatio
		} else {
			// Image is taller than container - fit to height
			height = containerSize.height
			width = height * imageAspectRatio
		}

		setCanvasSize({ width, height })
	}, [image, containerSize])

	// Helper to calculate wall bounds from points
	const calculateWallBounds = (points: number[]) => {
		if (!points || points.length < 4) {
			return { x: 0, y: 0, width: 0, height: 0 }
		}

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

	// Helper to get center point of wall
	const getWallCenter = (points: number[]) => {
		const bounds = calculateWallBounds(points)
		return {
			x: bounds.x + bounds.width / 2,
			y: bounds.y + bounds.height / 2,
		}
	}

	// Load texture images when appliedTextures change
	useEffect(() => {
		const loadTextures = async () => {
			const newTextureImages: Record<string, HTMLImageElement> = {}

			for (const [wallId, textureUrl] of Object.entries(appliedTextures)) {
				if (textureUrl && !textureImages[textureUrl]) {
					try {
						const img = new window.Image()
						img.crossOrigin = 'anonymous'

						await new Promise<void>((resolve, reject) => {
							img.onload = () => resolve()
							img.onerror = () => reject(new Error(`Failed to load texture: ${textureUrl}`))
							img.src = textureUrl
						})

						newTextureImages[textureUrl] = img
					} catch (error) {
						console.error('Failed to load texture:', textureUrl, error)
					}
				}
			}

			if (Object.keys(newTextureImages).length > 0) {
				setTextureImages(prev => ({ ...prev, ...newTextureImages }))
			}
		}

		loadTextures()
	}, [appliedTextures, textureImages])

	// Memoized wall click handler with proper dependencies to prevent stale closures
	const handleWallClick = useCallback(
		(wallId: string) => {
			// Block if in drawing mode
			if (isDrawingMode) {
				return
			}

			onWallSelect(wallId)
		},
		[isDrawingMode, onWallSelect] // Proper dependencies to prevent stale closures
	)

	// FIXED: Stage click handler for drawing mode only
	const handleStageClick = useCallback(
		(e: any) => {
			// Only handle canvas clicks for drawing mode
			if (!isDrawingMode) return

			// Make sure we clicked on the stage itself, not a shape
			if (e.target === e.target.getStage()) {
				const stage = e.target.getStage()
				if (!stage) return

				const pos = stage.getPointerPosition()
				if (!pos) return

				onCanvasClick(pos)
			}
		},
		[isDrawingMode, onCanvasClick]
	)

	if (loading) {
		return (
			<div className='flex items-center justify-center h-96 bg-gray-100 rounded-lg'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4'></div>
					<p className='text-gray-600'>Detecting walls...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='flex items-center justify-center h-96 bg-gray-100 rounded-lg'>
				<div className='text-center'>
					<div className='text-red-500 mb-2'>⚠️</div>
					<p className='text-gray-600'>{error}</p>
				</div>
			</div>
		)
	}

	if (!image) {
		return (
			<div className='flex items-center justify-center h-96 bg-gray-100 rounded-lg'>
				<div className='text-center'>
					<p className='text-gray-600'>Loading image...</p>
				</div>
			</div>
		)
	}

	return (
		<div
			ref={containerRef}
			className='w-full h-full flex justify-center items-center bg-white rounded-lg shadow-lg p-4'
		>
			<Stage width={canvasSize.width} height={canvasSize.height} onClick={handleStageClick}>
				{/* Layer 1: Background image only */}
				<Layer>
					<KonvaImage
						image={image}
						width={canvasSize.width}
						height={canvasSize.height}
						listening={false}
					/>
				</Layer>

				{/* Layer 2: Applied texture overlays */}
				<Layer>
					{walls
						.filter(wall => appliedTextures[wall.id])
						.map(wall => {
							const textureUrl = appliedTextures[wall.id]
							const textureImg = textureImages[textureUrl]

							// Only render if texture image is loaded
							if (!textureImg) return null

							return (
								<Line
									key={`texture-${wall.id}`}
									points={wall.points}
									fillPatternImage={textureImg}
									fillPatternRepeat='repeat'
									fillPatternScaleX={0.5}
									fillPatternScaleY={0.5}
									closed={true}
									listening={false}
								/>
							)
						})}
				</Layer>

				{/* Layer 3: Wall selection areas and icons */}
				<Layer>
					{walls.map(wall => {
						const bounds = calculateWallBounds(wall.points)
						const center = getWallCenter(wall.points)
						const isSelected = selectedWallIds.includes(wall.id)
						const hasTexture = !!appliedTextures[wall.id]

						// Skip walls with insufficient points
						if (!wall.points || wall.points.length < 6) {
							return null
						}

						return (
							<Group key={wall.id}>
								{/* FIXED: ALWAYS LISTENING - Force clickable regardless of drawing mode */}
								<Line
									points={wall.points}
									fill='rgba(255, 255, 255, 0.01)'
									stroke='transparent'
									strokeWidth={0}
									closed={true}
									listening={true}
									perfectDrawEnabled={false}
									onClick={e => {
										// Skip selection if in drawing mode
										if (isDrawingMode) {
											return
										}

										// Handle event propagation here to prevent conflicts
										e.cancelBubble = true
										if (e.evt) {
											e.evt.preventDefault()
											e.evt.stopPropagation()
										}
										handleWallClick(wall.id)
									}}
									onMouseEnter={e => {
										if (!isDrawingMode) {
											e.target.getStage()!.container().style.cursor = 'pointer'
										}
									}}
									onMouseLeave={e => {
										e.target.getStage()!.container().style.cursor = 'default'
									}}
								/>

								{/* Visual indicator at calculated center */}
								<Group x={center.x} y={center.y} listening={false} perfectDrawEnabled={false}>
									<Circle
										x={0}
										y={0}
										radius={12}
										fill={isSelected ? '#F59E0B' : hasTexture ? '#10B981' : '#FFFFFF'}
										stroke={isSelected ? '#D97706' : '#E5E7EB'}
										strokeWidth={isSelected ? 2 : 1}
										shadowColor='rgba(0, 0, 0, 0.3)'
										shadowBlur={isSelected ? 3 : 2}
										shadowOffset={{ x: 0, y: isSelected ? 2 : 1 }}
										listening={false}
										perfectDrawEnabled={false}
									/>

									<Circle
										x={0}
										y={0}
										radius={6}
										fill={isSelected ? '#FFFFFF' : hasTexture ? '#FFFFFF' : '#6B7280'}
										listening={false}
										perfectDrawEnabled={false}
									/>
								</Group>
							</Group>
						)
					})}
				</Layer>

				{/* Layer 4: Current drawing in progress (TOP LAYER) */}
				<Layer>
					{isDrawingMode && currentDrawing.length > 0 && (
						<Group>
							{/* Draw points */}
							{Array.from({ length: currentDrawing.length / 2 }, (_, i) => (
								<Circle
									key={i}
									x={currentDrawing[i * 2]}
									y={currentDrawing[i * 2 + 1]}
									radius={4}
									fill='#F59E0B'
									stroke='#D97706'
									strokeWidth={2}
									listening={false}
								/>
							))}

							{/* Draw lines between points */}
							{currentDrawing.length > 2 && (
								<Line
									points={currentDrawing}
									stroke='#F59E0B'
									strokeWidth={2}
									lineCap='round'
									lineJoin='round'
									dash={[5, 5]}
									listening={false}
								/>
							)}
						</Group>
					)}
				</Layer>
			</Stage>
		</div>
	)
}

export default WallMaskingCanvas
