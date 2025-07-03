import { useCallback, useState } from 'react'

export const useImageUpload = () => {
	const [imageUrl, setImageUrl] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const loadImageFromDataUrl = useCallback(async (dataUrl: string) => {
		setImageUrl(dataUrl)
		setLoading(false) // Just load the image, no processing needed
		setError(null)
	}, [])

	return { imageUrl, loading, error, loadImageFromDataUrl }
}
