import React from 'react'

interface UploadCardProps {
	onUpload: (file: File) => void
	loading?: boolean
	error?: string
}

const UploadCard: React.FC<UploadCardProps> = ({ onUpload, loading, error }) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			onUpload(e.target.files[0])
		}
	}

	return (
		<div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center w-full max-w-md mx-auto'>
			<label
				htmlFor='room-upload'
				className='w-full flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-lg p-8 cursor-pointer hover:bg-primary-light transition-colors focus-within:ring-2 focus-within:ring-primary'
				tabIndex={0}
			>
				<span className='text-lg font-semibold text-gray-700 mb-2'>Upload Room Photo</span>
				<span className='text-sm text-gray-500 mb-4'>JPG, PNG, or WebP. Max 10MB.</span>
				<input
					id='room-upload'
					type='file'
					accept='image/*'
					className='hidden'
					onChange={handleChange}
					disabled={loading}
				/>
				<span className='inline-block px-4 py-2 bg-primary text-white rounded-md mt-2'>
					Choose File
				</span>
			</label>
			{loading && <div className='mt-4 text-primary'>Uploading...</div>}
			{error && <div className='mt-4 text-error'>{error}</div>}
		</div>
	)
}

export default UploadCard
