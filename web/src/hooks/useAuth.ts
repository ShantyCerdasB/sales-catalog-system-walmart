/**
 * These just proxy to the closures installed by AuthProvider.
 */

export function getAccessToken(): string | null {
  // React context stores token in memory
  // We import and call directly instead of window hacks
  // (useAuth returns { login, logout, user, roles }, not the token)
  // We’ll simply throw if someone uses this outside AuthProvider
  throw new Error(
    'getAccessToken should be imported from AuthProvider module and used inside it'
  )
}

export async function onTokenRefresh(): Promise<void> {
  throw new Error(
    'onTokenRefresh should be handled by AuthProvider interceptors'
  )
}
