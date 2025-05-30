/**
 * Full authentication payload returned by signup/login.
 */
export interface AuthPayload {
  /** User’s UUID */
  id: string
  /** User’s confirmed email address */
  email: string
  /** Array of roles (e.g. ['USER','ADMIN']) */
  roles: string[]
  /** Short-lived JWT for API calls */
  accessToken: string
  /** Long-lived JWT, stored in an HttpOnly cookie */
  refreshToken: string
}