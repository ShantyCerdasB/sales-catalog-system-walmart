import React from 'react'
import AppRouter from './routes/AppRouter'
import './App.css'

/**
 * Root application component.
 * Delegates all rendering and routing to AppRouter.
 */
const App: React.FC = () => {
  return <AppRouter />
}

export default App
