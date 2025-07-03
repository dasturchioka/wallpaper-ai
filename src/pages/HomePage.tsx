import {
	ArrowUpTrayIcon,
	BuildingOfficeIcon,
	CubeIcon,
	HomeIcon,
	PhotoIcon,
	SparklesIcon,
} from '@heroicons/react/24/outline'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderBar from '../components/shared/HeaderBar'
import { saveImageDataUrl } from '../services/localStorage'

// Expanded room images collection for a richer grid
const roomImages = [
	{
		url: 'https://images.wizart.ai/images/interiors/reserved/images/2ecd72e3-5986-4bec-86e8-57ee14078eee.jpg?resize=thumbnail&type=interior',
		category: 'Work Room',
		style: 'Modern Elegance',
	},
	{
		url: 'https://images.wizart.ai/images/interiors/reserved/images/f9078040-d3df-4a52-87cb-3266049b710d.jpg?resize=thumbnail&type=interior',
		category: 'Kitchen',
		style: 'Contemporary',
	},
	{
		url: 'https://images.wizart.ai/images/interiors/reserved/images/6dba8bfd-dfa8-4a43-9ac2-c56ee6e81212.jpg?resize=thumbnail&type=interior',
		category: 'Living Room',
		style: 'Minimalist',
	},
	{
		url: 'https://images.wizart.ai/images/interiors/reserved/images/98ef3023-be3d-4754-a2f2-4ac6b3e26fc4.jpg?resize=thumbnail&type=interior',
		category: 'Bedroom',
		style: 'Scandinavian',
	},
]

const HomePage: React.FC = () => {
	const [loading, setLoading] = useState(false)
	const [loadingImageIndex, setLoadingImageIndex] = useState<number | null>(null)
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()

	const handleUpload = async (file: File) => {
		setLoading(true)
		setError(null)
		try {
			if (file.size > 10 * 1024 * 1024) {
				setError('File size exceeds 10MB.')
				setLoading(false)
				return
			}

			const reader = new FileReader()
			reader.onload = () => {
				if (typeof reader.result === 'string') {
					saveImageDataUrl(reader.result)
					setLoading(false)
					navigate('/editor')
				}
			}
			reader.onerror = () => {
				setError('Failed to read file.')
				setLoading(false)
			}
			reader.readAsDataURL(file)
		} catch (err: any) {
			setError(err.message || 'Upload failed.')
			setLoading(false)
		}
	}

	const handleSampleImageClick = async (imageUrl: string, index: number) => {
		setLoadingImageIndex(index)
		setError(null)
		try {
			const response = await fetch(imageUrl)
			const blob = await response.blob()
			const reader = new FileReader()
			reader.onload = () => {
				if (typeof reader.result === 'string') {
					saveImageDataUrl(reader.result)
					setLoadingImageIndex(null)
					navigate('/editor')
				}
			}
			reader.onerror = () => {
				setError('Failed to load sample image.')
				setLoadingImageIndex(null)
			}
			reader.readAsDataURL(blob)
		} catch (err: any) {
			setError(err.message || 'Failed to load sample image.')
			setLoadingImageIndex(null)
		}
	}

	const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			handleUpload(file)
		}
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100'>
			<HeaderBar />

			{/* Main Container */}
			<div className='max-w-7xl mx-auto px-6 py-12'>
				{/* Hero Section */}
				<div className='text-center mb-16'>
					<h1 className='text-5xl font-bold text-gray-900 mb-4'>
						Transform Your Space with{' '}
						<span className='bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent'>
							AI-Powered Design
						</span>
					</h1>
					<p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
						Choose a room to start your design journey. Our advanced visualization technology helps
						you preview wallpaper designs instantly.
					</p>
				</div>

				{/* Stats Bar */}
				<div className='flex justify-center items-center gap-8 mb-12'>
					<div className='flex items-center gap-2 text-gray-600'>
						<SparklesIcon className='w-5 h-5 text-orange-500' />
						<span className='font-medium'>AI-Powered</span>
					</div>
					<div className='w-px h-4 bg-gray-300'></div>
					<div className='flex items-center gap-2 text-gray-600'>
						<PhotoIcon className='w-5 h-5 text-orange-500' />
						<span className='font-medium'>Instant Preview</span>
					</div>
					<div className='w-px h-4 bg-gray-300'></div>
					<div className='flex items-center gap-2 text-gray-600'>
						<CubeIcon className='w-5 h-5 text-orange-500' />
						<span className='font-medium'>3D Visualization</span>
					</div>
				</div>

				{/* Wizart.ai Style Compact Grid Layout */}
				<div className='grid grid-cols-4 gap-8 auto-rows-[180px]'>
					{/* Upload Card - Top Left Position (Wizart.ai style) */}
					<div className='col-span-1 row-span-1'>
						<div className='relative h-full group'>
							<input
								type='file'
								accept='image/*'
								onChange={handleFileInput}
								className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
								disabled={loading}
							/>
							<div className='h-full bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 relative overflow-hidden'>
								{/* Background Pattern */}
								<div className='absolute inset-0 opacity-10'>
									<div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent'></div>
									<div className='absolute top-2 right-2 w-16 h-16 border border-white/20 rounded-full'></div>
									<div className='absolute bottom-2 left-2 w-10 h-10 border border-white/20 rounded-full'></div>
								</div>

								<div className='relative z-10 text-center'>
									<div className='w-12 h-12 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-300'>
										<ArrowUpTrayIcon className='w-6 h-6' />
									</div>
									<h3 className='font-bold text-sm mb-1'>Upload Your Room</h3>
									{loading && (
										<div className='mt-2 flex items-center justify-center gap-1'>
											<div className='w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
											<span className='text-xs'>Uploading...</span>
										</div>
									)}
									{error && (
										<div className='mt-2 text-xs text-red-200 bg-red-500/20 backdrop-blur-sm rounded-lg px-2 py-1'>
											{error}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Room Images - Wizart.ai Pattern */}
					{/* Row 1 - Remaining 3 columns */}
					<div className='col-span-1 row-span-2 group cursor-pointer'>
						<div
							className='relative h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105'
							onClick={() => handleSampleImageClick(roomImages[0].url, 0)}
						>
							<div className='relative h-full overflow-hidden'>
								<img
									src={roomImages[0].url}
									alt={roomImages[0].category}
									className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
								{loadingImageIndex === 0 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<div className='text-center text-white'>
											<div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2'></div>
											<span className='text-sm font-medium'>Loading...</span>
										</div>
									</div>
								)}
							</div>
							<div className='absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
								<div className='flex items-center gap-2 mb-1'>
									<HomeIcon className='w-4 h-4' />
									<span className='text-sm font-medium opacity-90'>{roomImages[0].category}</span>
								</div>
								<h3 className='font-bold text-lg mb-1'>{roomImages[0].style}</h3>
								<p className='text-sm opacity-90'>Click to start designing</p>
							</div>
							<div className='absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								<span className='text-xs font-semibold text-gray-800'>
									{roomImages[0].category}
								</span>
							</div>
						</div>
					</div>

					<div className='col-span-1 row-span-1 group cursor-pointer'>
						<div
							className='relative h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105'
							onClick={() => handleSampleImageClick(roomImages[1].url, 1)}
						>
							<div className='relative h-full overflow-hidden'>
								<img
									src={roomImages[1].url}
									alt={roomImages[1].category}
									className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
								{loadingImageIndex === 1 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<div className='text-center text-white'>
											<div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2'></div>
											<span className='text-sm font-medium'>Loading...</span>
										</div>
									</div>
								)}
							</div>
							<div className='absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
								<div className='flex items-center gap-1 mb-1'>
									<HomeIcon className='w-3 h-3' />
									<span className='text-xs font-medium opacity-90'>{roomImages[1].category}</span>
								</div>
								<h3 className='font-bold text-sm'>{roomImages[1].style}</h3>
							</div>
							<div className='absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								<span className='text-xs font-semibold text-gray-800'>
									{roomImages[1].category}
								</span>
							</div>
						</div>
					</div>

					<div className='col-span-1 row-span-1 group cursor-pointer'>
						<div
							className='relative h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105'
							onClick={() => handleSampleImageClick(roomImages[2].url, 2)}
						>
							<div className='relative h-full overflow-hidden'>
								<img
									src={roomImages[2].url}
									alt={roomImages[2].category}
									className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
								{loadingImageIndex === 2 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<div className='text-center text-white'>
											<div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2'></div>
											<span className='text-sm font-medium'>Loading...</span>
										</div>
									</div>
								)}
							</div>
							<div className='absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
								<div className='flex items-center gap-1 mb-1'>
									<HomeIcon className='w-3 h-3' />
									<span className='text-xs font-medium opacity-90'>{roomImages[2].category}</span>
								</div>
								<h3 className='font-bold text-sm'>{roomImages[2].style}</h3>
							</div>
							<div className='absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								<span className='text-xs font-semibold text-gray-800'>
									{roomImages[2].category}
								</span>
							</div>
						</div>
					</div>

					{/* Row 2 */}
					<div className='col-span-1 row-span-1 group cursor-pointer'>
						<div
							className='relative h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105'
							onClick={() => handleSampleImageClick(roomImages[3].url, 3)}
						>
							<div className='relative h-full overflow-hidden'>
								<img
									src={roomImages[3].url}
									alt={roomImages[3].category}
									className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
								{loadingImageIndex === 3 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<div className='text-center text-white'>
											<div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2'></div>
											<span className='text-sm font-medium'>Loading...</span>
										</div>
									</div>
								)}
							</div>
							<div className='absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
								<div className='flex items-center gap-1 mb-1'>
									<HomeIcon className='w-3 h-3' />
									<span className='text-xs font-medium opacity-90'>{roomImages[3].category}</span>
								</div>
								<h3 className='font-bold text-sm'>{roomImages[3].style}</h3>
							</div>
							<div className='absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								<span className='text-xs font-semibold text-gray-800'>
									{roomImages[3].category}
								</span>
							</div>
						</div>
					</div>

					<div className='col-span-1 row-span-1 group cursor-pointer'>
						<div
							className='relative h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105'
							onClick={() => handleSampleImageClick(roomImages[0].url, 4)}
						>
							<div className='relative h-full overflow-hidden'>
								<img
									src={roomImages[0].url}
									alt='Modern Interior'
									className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
									style={{ objectPosition: '30% center' }}
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
								{loadingImageIndex === 4 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<div className='text-center text-white'>
											<div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2'></div>
											<span className='text-sm font-medium'>Loading...</span>
										</div>
									</div>
								)}
							</div>
							<div className='absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
								<div className='flex items-center gap-1 mb-1'>
									<BuildingOfficeIcon className='w-3 h-3' />
									<span className='text-xs font-medium opacity-90'>Modern Interior</span>
								</div>
								<h3 className='font-bold text-sm'>Contemporary Style</h3>
							</div>
							<div className='absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								<span className='text-xs font-semibold text-gray-800'>Modern</span>
							</div>
						</div>
					</div>
					<div className='col-span-1 row-span-1 group cursor-pointer'>
						<div
							className='relative h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105'
							onClick={() => handleSampleImageClick(roomImages[0].url, 4)}
						>
							<div className='relative h-full overflow-hidden'>
								<img
									src={roomImages[0].url}
									alt='Modern Interior'
									className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
									style={{ objectPosition: '30% center' }}
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
								{loadingImageIndex === 4 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<div className='text-center text-white'>
											<div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2'></div>
											<span className='text-sm font-medium'>Loading...</span>
										</div>
									</div>
								)}
							</div>
							<div className='absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
								<div className='flex items-center gap-1 mb-1'>
									<BuildingOfficeIcon className='w-3 h-3' />
									<span className='text-xs font-medium opacity-90'>Modern Interior</span>
								</div>
								<h3 className='font-bold text-sm'>Contemporary Style</h3>
							</div>
							<div className='absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								<span className='text-xs font-semibold text-gray-800'>Modern</span>
							</div>
						</div>
					</div>

					{/* Row 3 */}
					<div className='col-span-2 row-span-1 group cursor-pointer'>
						<div
							className='relative h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105'
							onClick={() => handleSampleImageClick(roomImages[1].url, 5)}
						>
							<div className='relative h-full overflow-hidden'>
								<img
									src={roomImages[1].url}
									alt='Luxury Bedroom'
									className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
									style={{ objectPosition: 'center 40%' }}
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
								{loadingImageIndex === 5 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<div className='text-center text-white'>
											<div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2'></div>
											<span className='text-sm font-medium'>Loading...</span>
										</div>
									</div>
								)}
							</div>
							<div className='absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
								<div className='flex items-center gap-2 mb-1'>
									<HomeIcon className='w-4 h-4' />
									<span className='text-sm font-medium opacity-90'>Luxury Bedroom</span>
								</div>
								<h3 className='font-bold text-lg'>Premium Design</h3>
								<p className='text-sm opacity-90'>Click to start designing</p>
							</div>
							<div className='absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								<span className='text-xs font-semibold text-gray-800'>Luxury</span>
							</div>
						</div>
					</div>

					<div className='col-span-1 row-span-1 group cursor-pointer'>
						<div
							className='relative h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105'
							onClick={() => handleSampleImageClick(roomImages[2].url, 6)}
						>
							<div className='relative h-full overflow-hidden'>
								<img
									src={roomImages[2].url}
									alt='Kitchen Design'
									className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
									style={{ objectPosition: '60% center' }}
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
								{loadingImageIndex === 6 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<div className='text-center text-white'>
											<div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2'></div>
											<span className='text-sm font-medium'>Loading...</span>
										</div>
									</div>
								)}
							</div>
							<div className='absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
								<div className='flex items-center gap-1 mb-1'>
									<CubeIcon className='w-3 h-3' />
									<span className='text-xs font-medium opacity-90'>Kitchen</span>
								</div>
								<h3 className='font-bold text-sm'>Modern Kitchen</h3>
							</div>
							<div className='absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								<span className='text-xs font-semibold text-gray-800'>Kitchen</span>
							</div>
						</div>
					</div>

					{/* Row 4 */}
					<div className='col-span-1 row-span-1 group cursor-pointer'>
						<div
							className='relative h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105'
							onClick={() => handleSampleImageClick(roomImages[3].url, 7)}
						>
							<div className='relative h-full overflow-hidden'>
								<img
									src={roomImages[3].url}
									alt='Living Room'
									className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
									style={{ objectPosition: '70% center' }}
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
								{loadingImageIndex === 7 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<div className='text-center text-white'>
											<div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2'></div>
											<span className='text-sm font-medium'>Loading...</span>
										</div>
									</div>
								)}
							</div>
							<div className='absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
								<div className='flex items-center gap-1 mb-1'>
									<HomeIcon className='w-3 h-3' />
									<span className='text-xs font-medium opacity-90'>Living Room</span>
								</div>
								<h3 className='font-bold text-sm'>Cozy Living</h3>
							</div>
							<div className='absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								<span className='text-xs font-semibold text-gray-800'>Living</span>
							</div>
						</div>
					</div>

					<div className='col-span-1 row-span-1 group cursor-pointer'>
						<div
							className='relative h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105'
							onClick={() => handleSampleImageClick(roomImages[0].url, 8)}
						>
							<div className='relative h-full overflow-hidden'>
								<img
									src={roomImages[0].url}
									alt='Dining Area'
									className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
									style={{ objectPosition: '80% center' }}
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
								{loadingImageIndex === 8 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<div className='text-center text-white'>
											<div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2'></div>
											<span className='text-sm font-medium'>Loading...</span>
										</div>
									</div>
								)}
							</div>
							<div className='absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
								<div className='flex items-center gap-1 mb-1'>
									<BuildingOfficeIcon className='w-3 h-3' />
									<span className='text-xs font-medium opacity-90'>Dining Area</span>
								</div>
								<h3 className='font-bold text-sm'>Elegant Dining</h3>
							</div>
							<div className='absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								<span className='text-xs font-semibold text-gray-800'>Dining</span>
							</div>
						</div>
					</div>

					<div className='col-span-1 row-span-2 group cursor-pointer'>
						<div
							className='relative h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105'
							onClick={() => handleSampleImageClick(roomImages[1].url, 9)}
						>
							<div className='relative h-full overflow-hidden'>
								<img
									src={roomImages[1].url}
									alt='Master Suite'
									className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
									style={{ objectPosition: 'center 60%' }}
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
								{loadingImageIndex === 9 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<div className='text-center text-white'>
											<div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2'></div>
											<span className='text-sm font-medium'>Loading...</span>
										</div>
									</div>
								)}
							</div>
							<div className='absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
								<div className='flex items-center gap-2 mb-1'>
									<HomeIcon className='w-4 h-4' />
									<span className='text-sm font-medium opacity-90'>Master Suite</span>
								</div>
								<h3 className='font-bold text-lg'>Luxury Bedroom</h3>
								<p className='text-sm opacity-90'>Click to start designing</p>
							</div>
							<div className='absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								<span className='text-xs font-semibold text-gray-800'>Master</span>
							</div>
						</div>
					</div>

					<div className='col-span-1 row-span-1 group cursor-pointer'>
						<div
							className='relative h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105'
							onClick={() => handleSampleImageClick(roomImages[2].url, 10)}
						>
							<div className='relative h-full overflow-hidden'>
								<img
									src={roomImages[2].url}
									alt='Office Space'
									className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
									style={{ objectPosition: '20% center' }}
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
								{loadingImageIndex === 10 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<div className='text-center text-white'>
											<div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2'></div>
											<span className='text-sm font-medium'>Loading...</span>
										</div>
									</div>
								)}
							</div>
							<div className='absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
								<div className='flex items-center gap-1 mb-1'>
									<BuildingOfficeIcon className='w-3 h-3' />
									<span className='text-xs font-medium opacity-90'>Office</span>
								</div>
								<h3 className='font-bold text-sm'>Modern Office</h3>
							</div>
							<div className='absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								<span className='text-xs font-semibold text-gray-800'>Office</span>
							</div>
						</div>
					</div>

					{/* Row 6 */}
					<div className='col-span-2 row-span-1 group cursor-pointer'>
						<div
							className='relative h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105'
							onClick={() => handleSampleImageClick(roomImages[3].url, 11)}
						>
							<div className='relative h-full overflow-hidden'>
								<img
									src={roomImages[3].url}
									alt='Open Plan Living'
									className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
									style={{ objectPosition: 'center 30%' }}
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
								{loadingImageIndex === 11 && (
									<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
										<div className='text-center text-white'>
											<div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2'></div>
											<span className='text-sm font-medium'>Loading...</span>
										</div>
									</div>
								)}
							</div>
							<div className='absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
								<div className='flex items-center gap-2 mb-1'>
									<HomeIcon className='w-4 h-4' />
									<span className='text-sm font-medium opacity-90'>Open Plan Living</span>
								</div>
								<h3 className='font-bold text-lg'>Spacious Design</h3>
								<p className='text-sm opacity-90'>Click to start designing</p>
							</div>
							<div className='absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								<span className='text-xs font-semibold text-gray-800'>Open Plan</span>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom CTA Section */}
				<div className='mt-16 text-center'>
					<div className='bg-white rounded-3xl shadow-lg border border-gray-200 p-8 max-w-2xl mx-auto'>
						<SparklesIcon className='w-12 h-12 text-orange-500 mx-auto mb-4' />
						<h3 className='text-2xl font-bold text-gray-900 mb-2'>
							Ready to Transform Your Space?
						</h3>
						<p className='text-gray-600 mb-6'>
							Join thousands of users who have revolutionized their interior design process with our
							AI technology.
						</p>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<label className='inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 cursor-pointer'>
								<ArrowUpTrayIcon className='w-5 h-5' />
								Upload Your Room
								<input
									type='file'
									accept='image/*'
									onChange={handleFileInput}
									className='hidden'
									disabled={loading}
								/>
							</label>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className='mt-16 text-center'>
					<a
						href='https://www.wizart.ai/legal'
						target='_blank'
						rel='noopener noreferrer'
						className='text-gray-500 hover:text-gray-700 text-sm underline transition-colors duration-200'
					>
						Privacy Policy & Terms of Use
					</a>
				</div>
			</div>
		</div>
	)
}

export default HomePage
