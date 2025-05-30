import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

interface Props {
  allowedRoles: string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export const RoleGuard: React.FC<Props> = ({
  allowedRoles,
  fallback = <Navigate to="/403" replace />,
  children,
}) => {
  const { user, roles } = useAuth()

  if (!user || !allowedRoles.some(r => roles.includes(r))) {
    return <>{fallback}</>
  }
  return <>{children}</>
}
