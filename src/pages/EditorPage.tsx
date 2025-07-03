import {
	ArrowDownTrayIcon,
	ArrowLeftIcon,
	ArrowUturnLeftIcon,
	CheckIcon,
	EyeIcon,
	PencilIcon,
	PhotoIcon,
	ShareIcon,
	SparklesIcon,
	TrashIcon,
} from '@heroicons/react/24/outline'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import WallMaskingCanvas from '../components/canvas/WallMaskingCanvas'
import SidebarCatalog from '../components/catalog/SidebarCatalog'
import HeaderBar from '../components/shared/HeaderBar'
import { useImageUpload } from '../hooks/useImageUpload'

import { getActionHistory, getImageDataUrl, saveActionHistory } from '../services/localStorage'

interface ActionHistoryItem {
	type: 'apply' | 'clear' | 'clear_all'
	wallId?: string
	textureUrl?: string
	previousTexture?: string
	previousTextures?: Record<string, string>
}

const EditorPage: React.FC = () => {
	const {
		imageUrl,
		loading: imageLoading,
		error: imageError,
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
	} = useImageUpload()

	// Remove local selectedWallIds state since it's now in the hook
	const [isDrawingMode, setIsDrawingMode] = useState(false)
	const [currentDrawing, setCurrentDrawing] = useState<number[]>([])
	const [userDrawnWalls, setUserDrawnWalls] = useState<any[]>([])
	const [appliedTextures, setAppliedTextures] = useState<Record<string, string>>({})
	const [actionHistory, setActionHistory] = useState<ActionHistoryItem[]>(() => {
		const history = getActionHistory()
		if (!Array.isArray(history) || history.length === 0) {
			return []
		}
		const firstItem = history[0]
		if (typeof firstItem === 'object' && 'type' in firstItem) {
			return history as unknown as ActionHistoryItem[]
		}
		return []
	})

	const fileInputRef = useRef<HTMLInputElement>(null)

	// Load image from localStorage on mount
	useEffect(() => {
		const storedImageUrl = getImageDataUrl()
		if (storedImageUrl && !imageUrl) {
			loadImageFromDataUrl(storedImageUrl)
		}
	}, [imageUrl, loadImageFromDataUrl])

	// Auto-save action history
	useEffect(() => {
		saveActionHistory(actionHistory as any)
	}, [actionHistory])

	// Convert data URL to File object for AI detection
	const dataURLtoFile = useCallback((dataurl: string, filename: string): File => {
		const arr = dataurl.split(',')
		const mime = arr[0].match(/:(.*?);/)![1]
		const bstr = atob(arr[1])
		let n = bstr.length
		const u8arr = new Uint8Array(n)
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n)
		}
		return new File([u8arr], filename, { type: mime })
	}, [])

	// Handle AI wall detection
	const handleAIDetectWalls = useCallback(async () => {
		if (!imageUrl) {
			alert('Please upload an image first')
			return
		}

		try {
			// Convert current image URL to File for API
			const imageFile = dataURLtoFile(imageUrl, 'room-image.jpg')
			await detectWalls(imageFile)
		} catch (error) {
			console.error('AI detection failed:', error)
			alert('AI detection failed. Please try again.')
		}
	}, [imageUrl, detectWalls, dataURLtoFile])

	// Handle file input for re-uploading image for AI detection
	const handleFileSelect = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0]
			if (file) {
				detectWalls(file)
			}
		},
		[detectWalls]
	)

	// Enhanced wall selection handler using the hook's function
	const handleWallSelect = useCallback(
		(wallId: string) => {
			console.log('🎯 EditorPage: handleWallSelect called with wallId:', wallId)
			console.log('🎯 EditorPage: Current isDrawingMode:', isDrawingMode)

			// Skip if in drawing mode
			if (isDrawingMode) {
				console.log('🚫 EditorPage: IGNORING CLICK - In drawing mode')
				return
			}

			toggleWallSelection(wallId)
		},
		[isDrawingMode, toggleWallSelection]
	)

	// Get selection summary for display
	const selectionSummary = getSelectionSummary()

	const handleStartDrawing = useCallback(() => {
		console.log('🎨 Starting drawing mode')
		setIsDrawingMode(true)
		setCurrentDrawing([])
		clearAllSelections() // Clear selection when starting to draw
	}, [clearAllSelections])

	const handleCompleteWall = useCallback(() => {
		if (currentDrawing.length < 6) return
		setUserDrawnWalls(prev => {
			const wallId = `wall-${prev.length + 1}`
			const newWall = { id: wallId, points: [...currentDrawing] }
			return [...prev, newWall]
		})
		setCurrentDrawing([])
		setIsDrawingMode(false)
	}, [currentDrawing])

	const handleCanvasClick = useCallback(
		(point: { x: number; y: number }) => {
			if (!isDrawingMode) return

			const newPoints = [...currentDrawing, point.x, point.y]
			setCurrentDrawing(newPoints)
			console.log('📍 Added point:', point, 'Total points:', newPoints.length / 2)
		},
		[isDrawingMode, currentDrawing]
	)

	const handleProductSelect = useCallback(
		(product: any) => {
			console.log('🎨 PRODUCT SELECTION ATTEMPTED!')
			console.log('Selected product:', product)
			console.log('Current selectedWallIds:', selectedWallIds)

			if (selectedWallIds.length === 0) {
				console.log('⚠️ No walls selected')
				return
			}

			// Handle Supabase catalog product format
			const textureUrl =
				product.primary_image_url ||
				product.swatch_image_url ||
				product.image ||
				product.primary_image_storage_path

			console.log('Extracted textureUrl:', textureUrl)

			if (!textureUrl) {
				console.log('⚠️ No texture URL found')
				return
			}

			console.log(
				`✅ APPLYING TEXTURE TO ${selectedWallIds.length} SELECTED WALLS:`,
				selectedWallIds
			)

			setAppliedTextures(prev => {
				const updated = { ...prev }
				selectedWallIds.forEach(wallId => {
					updated[wallId] = textureUrl
				})
				console.log('🔄 Updated applied textures:', updated)
				return updated
			})

			setActionHistory(prev => [
				...prev,
				{
					type: 'apply',
					wallId: selectedWallIds.join(','),
					textureUrl,
					previousTexture: '',
				},
			])
		},
		[selectedWallIds]
	)

	const handleClear = useCallback(() => {
		console.log('🧹 CLEAR BUTTON CLICKED!')
		console.log('selectedWallIds:', selectedWallIds)

		if (selectedWallIds.length === 0) {
			console.log('⚠️ No walls selected')
			return
		}

		const wallsWithTextures = selectedWallIds.filter(wallId => appliedTextures[wallId])

		if (wallsWithTextures.length === 0) {
			console.log('⚠️ No selected walls have textures')
			return
		}

		console.log(`✅ CLEARING WALLPAPER FROM ${wallsWithTextures.length} WALLS:`, wallsWithTextures)

		setAppliedTextures(prev => {
			const updated = { ...prev }
			wallsWithTextures.forEach(wallId => {
				delete updated[wallId]
			})
			console.log('🔄 Updated textures after clear:', updated)
			return updated
		})

		setActionHistory(prev => [
			...prev,
			{
				type: 'clear',
				wallId: wallsWithTextures.join(','),
				previousTexture: wallsWithTextures.map(id => appliedTextures[id]).join(','),
			},
		])
	}, [selectedWallIds, appliedTextures])

	const handleClearAll = useCallback(() => {
		console.log('🧹 CLEAR ALL BUTTON CLICKED!')

		if (Object.keys(appliedTextures).length === 0) {
			console.log('⚠️ No textures to clear')
			return
		}

		console.log('✅ CLEARING ALL WALLPAPERS!')

		setActionHistory(prev => [
			...prev,
			{
				type: 'clear_all',
				previousTextures: { ...appliedTextures },
			},
		])

		setAppliedTextures({})
	}, [appliedTextures])

	const handleRedo = useCallback(() => {
		if (actionHistory.length === 0) return

		const lastAction = actionHistory[actionHistory.length - 1]

		if (lastAction.type === 'apply' && lastAction.wallId && lastAction.textureUrl) {
			setAppliedTextures(prev => ({
				...prev,
				[lastAction.wallId!]: lastAction.textureUrl!,
			}))
		} else if (lastAction.type === 'clear' && lastAction.wallId && lastAction.previousTexture) {
			setAppliedTextures(prev => ({
				...prev,
				[lastAction.wallId!]: lastAction.previousTexture!,
			}))
		} else if (lastAction.type === 'clear_all' && lastAction.previousTextures) {
			setAppliedTextures(lastAction.previousTextures)
		}

		setActionHistory(prev => prev.slice(0, -1))
	}, [actionHistory])

	const handleCompare = useCallback(() => {
		console.log('Compare functionality - toggle between original and applied textures')
	}, [])

	const handleRemoveWalls = useCallback(() => {
		console.log('🗑️ REMOVING SELECTED WALLS:', selectedWallIds)

		// Remove selected walls from userDrawnWalls
		setUserDrawnWalls(prev => prev.filter(wall => !selectedWallIds.includes(wall.id)))

		// Also clear any applied textures for these walls
		setAppliedTextures(prev => {
			const updated = { ...prev }
			selectedWallIds.forEach(wallId => {
				delete updated[wallId]
			})
			return updated
		})

		// Clear selections
		clearAllSelections()
	}, [selectedWallIds, clearAllSelections])

	if (!imageUrl) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-xl font-semibold text-gray-700 mb-2'>No image loaded</h2>
					<p className='text-gray-500'>Please upload an image from the home page to get started.</p>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-50 flex flex-col'>
			<HeaderBar />

			<div className='flex-1 flex'>
				{/* Main Canvas Area */}
				<div className='flex-1 flex flex-col p-6'>
					{/* Top Action Bar */}
					<div className='flex items-center justify-between mb-4'>
						<div className='flex items-center gap-2'>
							{!isDrawingMode ? (
								<>
									<button
										onClick={handleStartDrawing}
										className='px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-200'
									>
										<PencilIcon className='w-4 h-4' />
										<span>Draw Wall</span>
									</button>
									<button
										onClick={handleAIDetectWalls}
										disabled={aiDetectionLoading}
										className='px-3 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-200'
									>
										<SparklesIcon
											className={`w-4 h-4 ${aiDetectionLoading ? 'animate-spin' : ''}`}
										/>
										<span>{aiDetectionLoading ? 'Detecting...' : 'AI Detect Walls'}</span>
									</button>
									<input
										ref={fileInputRef}
										type='file'
										accept='image/*'
										onChange={handleFileSelect}
										className='hidden'
									/>
									<button
										onClick={() => fileInputRef.current?.click()}
										disabled={aiDetectionLoading}
										className='px-3 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-200'
									>
										<PhotoIcon className='w-4 h-4' />
										<span>Upload & Detect</span>
									</button>
								</>
							) : (
								<div className='flex items-center gap-2'>
									<button
										onClick={handleCompleteWall}
										className='px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-200'
									>
										<CheckIcon className='w-4 h-4' />
										<span>Complete Wall</span>
									</button>
									<span className='text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg'>
										Points: {currentDrawing.length / 2} | Click canvas to add points
									</span>
								</div>
							)}
							<button className='px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200'>
								<PhotoIcon className='w-4 h-4' />
								<span>
									Walls: {userDrawnWalls.length + wallContours.length} ({userDrawnWalls.length}{' '}
									drawn, {wallContours.length} AI)
								</span>
							</button>
							{wallContours.length > 0 && (
								<button
									onClick={clearWallContours}
									className='px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-200'
								>
									<SparklesIcon className='w-4 h-4' />
									<span>Clear AI Walls</span>
								</button>
							)}
						</div>
						<div className='flex items-center gap-2'>
							<button
								onClick={handleCompare}
								className='px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200'
							>
								<EyeIcon className='w-4 h-4' />
								<span>Compare Mode</span>
							</button>
							<button
								onClick={handleClear}
								className='px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-200'
							>
								<SparklesIcon className='w-4 h-4' />
								<span>Clear Surface</span>
							</button>
							{selectedWallIds.length > 0 && (
								<button
									onClick={handleRemoveWalls}
									className='px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-200'
								>
									<TrashIcon className='w-4 h-4' />
									<span>Remove Walls ({selectedWallIds.length})</span>
								</button>
							)}
							{Object.keys(appliedTextures).length > 0 && (
								<>
									<button className='px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200'>
										<ShareIcon className='w-4 h-4' />
										<span>Share</span>
									</button>
									<button className='px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200'>
										<ArrowDownTrayIcon className='w-4 h-4' />
										<span>Download</span>
									</button>
								</>
							)}
						</div>
					</div>

					{/* Selection Summary UI */}
					<div className='flex items-center gap-4 mb-2'>
						<span className='text-sm text-gray-700'>
							<b>{selectionSummary.total}</b> wall{selectionSummary.total === 1 ? '' : 's'} selected
							<span className='ml-2 text-purple-600'>
								({selectionSummary.aiWalls} AI, {selectionSummary.manualWalls} manual)
							</span>
						</span>
						<button
							onClick={selectAllAIWalls}
							className='px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-medium transition-colors duration-150'
						>
							Select All AI Walls
						</button>
						<button
							onClick={clearAllSelections}
							className='px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors duration-150'
						>
							Clear Selection
						</button>
					</div>

					{/* Canvas */}
					<div className='flex-1'>
						<WallMaskingCanvas
							imageUrl={imageUrl}
							walls={userDrawnWalls}
							selectedWallIds={selectedWallIds}
							appliedTextures={appliedTextures}
							onWallSelect={handleWallSelect}
							onStartDrawing={handleStartDrawing}
							onCompleteWall={handleCompleteWall}
							onCanvasClick={handleCanvasClick}
							isDrawingMode={isDrawingMode}
							currentDrawing={currentDrawing}
							loading={imageLoading || aiDetectionLoading}
							error={imageError}
							wallContours={wallContours}
						/>
					</div>

					{/* Bottom Action Area */}
					<div className='flex items-center justify-between mt-4'>
						<button className='px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200'>
							<ArrowLeftIcon className='w-4 h-4' />
							<span>Change interior</span>
						</button>
						<div className='flex items-center gap-2'>
							{actionHistory.length > 0 && (
								<button
									onClick={handleRedo}
									className='px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors duration-200'
								>
									<ArrowUturnLeftIcon className='w-4 h-4' />
									<span>Undo</span>
								</button>
							)}
							<button
								onClick={handleClearAll}
								className='px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2 transition-colors duration-200'
							>
								<SparklesIcon className='w-4 h-4' />
								<span>Clear All</span>
							</button>
						</div>
					</div>
				</div>

				{/* Sidebar Catalog */}
				<SidebarCatalog onSelect={handleProductSelect} />
			</div>
		</div>
	)
}

export default EditorPage
