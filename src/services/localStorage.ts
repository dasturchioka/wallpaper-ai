// services/localStorage.ts
// LocalStorage service for handling all user data persistence

export interface ProjectData {
	imageDataUrl: string
	appliedTextures: Record<string, string>
	selectedWallId: string | null
	walls: any[]
	actionHistory: Record<string, string>[]
	createdAt: string
	updatedAt: string
}

const KEYS = {
	CURRENT_PROJECT: 'palitra-current-project',
	PROJECTS_LIST: 'palitra-projects',
	USER_PREFERENCES: 'palitra-preferences',
}

export const saveProject = (projectData: ProjectData): void => {
	const dataToSave = {
		...projectData,
		updatedAt: new Date().toISOString(),
	}
	localStorage.setItem(KEYS.CURRENT_PROJECT, JSON.stringify(dataToSave))
}

export const loadProject = (): ProjectData | null => {
	const data = localStorage.getItem(KEYS.CURRENT_PROJECT)
	if (!data) return null
	try {
		return JSON.parse(data)
	} catch {
		return null
	}
}

export const saveImageDataUrl = (dataUrl: string): void => {
	const project = loadProject() || createNewProject()
	project.imageDataUrl = dataUrl
	saveProject(project)
}

export const getImageDataUrl = (): string | null => {
	const project = loadProject()
	return project?.imageDataUrl || null
}

export const saveAppliedTextures = (textures: Record<string, string>): void => {
	const project = loadProject() || createNewProject()
	project.appliedTextures = textures
	saveProject(project)
}

export const getAppliedTextures = (): Record<string, string> => {
	const project = loadProject()
	return project?.appliedTextures || {}
}

export const saveWalls = (walls: any[]): void => {
	const project = loadProject() || createNewProject()
	project.walls = walls
	saveProject(project)
}

export const getWalls = (): any[] => {
	const project = loadProject()
	return project?.walls || []
}

export const saveActionHistory = (history: Record<string, string>[]): void => {
	const project = loadProject() || createNewProject()
	project.actionHistory = history
	saveProject(project)
}

export const getActionHistory = (): Record<string, string>[] => {
	const project = loadProject()
	return project?.actionHistory || []
}

export const clearProject = (): void => {
	localStorage.removeItem(KEYS.CURRENT_PROJECT)
}

const createNewProject = (): ProjectData => ({
	imageDataUrl: '',
	appliedTextures: {},
	selectedWallId: null,
	walls: [],
	actionHistory: [],
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
})

// Helper function to convert data URL to File for API calls
export const dataUrlToFile = async (
	dataUrl: string,
	filename: string = 'image.png'
): Promise<File> => {
	const response = await fetch(dataUrl)
	const blob = await response.blob()
	return new File([blob], filename, { type: blob.type })
}

// Helper function to convert data URL to blob URL for API calls
export const dataUrlToBlobUrl = async (dataUrl: string): Promise<string> => {
	const response = await fetch(dataUrl)
	const blob = await response.blob()
	return URL.createObjectURL(blob)
}
