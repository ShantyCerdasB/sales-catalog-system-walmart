import { Request, Response, NextFunction } from 'express';

/**
 * Role-based access control middleware.
 *
 * Usage:
 *   // Only allow users with “admin” role
 *   router.post('/products', jwtAuth(), requireRole('admin'), productController.create);
 *
 * Reads `req.user.roles: string[]` (populated by jwtAuth).
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { roles?: string[] } | undefined;
    if (!user?.roles) {
      return res.status(403).json({ message: 'No roles assigned' });
    }
    // Check for intersection
    const hasRole = user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}
