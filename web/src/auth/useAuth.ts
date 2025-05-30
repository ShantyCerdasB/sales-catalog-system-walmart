/**
 * Returns the current access token stored in memory by AuthProvider.
 */
export function getAccessToken(): string | null {
  const getter = (window as any).__getAccessToken
  return typeof getter === 'function' ? getter() : null
}

/**
 * Calls the refresh endpoint via the closure installed by AuthProvider.
 * Should update AuthProvider’s state with the new token.
 */
export async function onTokenRefresh(): Promise<void> {
  const refresher = (window as any).__onTokenRefresh
  if (typeof refresher === 'function') {
    await refresher()
  } else {
    throw new Error('Refresh token function not available')
  }
}
