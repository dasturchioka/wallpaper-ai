import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
	return (
		<button
			className={`rounded-md px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-primary text-white hover:bg-primaryHover active:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
			{...props}
		>
			{children}
		</button>
	)
}

export default Button
