import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

 // PublicRoute is used to protect routes that should only be accessible when the user is not authenticated.
// If the user is authenticated, they are redirected to the products page.
export const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth()
  return user ? <Navigate to="/products" replace /> : children
}
