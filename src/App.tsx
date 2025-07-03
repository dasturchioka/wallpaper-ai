import { ReactPlugin } from '@stagewise-plugins/react'
import { StagewiseToolbar } from '@stagewise/toolbar-react'
import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import EditorPage from './pages/EditorPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

const App: React.FC = () => {
	return (
		<Router>
			<div className='min-h-screen bg-gray-50 text-gray-900'>
				<StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/editor' element={<EditorPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Routes>
			</div>
		</Router>
	)
}

export default App
