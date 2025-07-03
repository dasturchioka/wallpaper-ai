// If you see a module error, run: npm install zustand
import { create } from 'zustand'

type Wall = {
	id: string
	points: number[]
	// Add more wall properties as needed
}

type Action = {
	type: string
	wallId?: string
	textureUrl?: string
	previousTexture?: string
}

type WallStore = {
	walls: Wall[]
	selectedWallId: string | null
	appliedTextures: Map<string, string>
	originalImage: HTMLImageElement | null
	processedImage: HTMLImageElement | null
	isProcessing: boolean
	actionHistory: Action[]
	setWalls: (walls: Wall[]) => void
	selectWall: (wallId: string) => void
	applyTexture: (wallId: string, textureUrl: string) => void
	clearWall: (wallId: string) => void
	clearAllWalls: () => void
	redo: () => void
	setOriginalImage: (img: HTMLImageElement) => void
}

export const useWallStore = create<WallStore>((set, get) => ({
	walls: [],
	selectedWallId: null,
	appliedTextures: new Map(),
	originalImage: null,
	processedImage: null,
	isProcessing: false,
	actionHistory: [],
	setWalls: (walls: Wall[]) => set({ walls }),
	selectWall: (wallId: string) => set({ selectedWallId: wallId }),
	applyTexture: (wallId: string, textureUrl: string) => {
		const { appliedTextures, actionHistory } = get()
		const newTextures = new Map(appliedTextures)
		const previousTexture = newTextures.get(wallId)
		newTextures.set(wallId, textureUrl)
		set({
			appliedTextures: newTextures,
			actionHistory: [...actionHistory, { type: 'apply', wallId, textureUrl, previousTexture }],
		})
	},
	clearWall: (wallId: string) => {
		// TODO: Implement clear wall logic
	},
	clearAllWalls: () => {
		// TODO: Implement clear all walls logic
	},
	redo: () => {
		// TODO: Implement redo logic
	},
	setOriginalImage: (img: HTMLImageElement) => set({ originalImage: img }),
}))
