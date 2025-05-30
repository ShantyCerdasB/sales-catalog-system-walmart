import { Request, Response, NextFunction } from 'express';

/**
 * Middleware factory that checks the caller’s roles.
 *
 * @param allowedRoles  One or more role names, e.g. 'admin', 'editor'.
 * @returns             Express middleware that enforces the rule set.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const roles = (req.user as { roles?: string[] } | undefined)?.roles;

    if (!roles?.length) {
      res.status(403).json({ message: 'No roles assigned' });
      return;
    }

    const match = roles.some(r => allowedRoles.includes(r));

    if (!match) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
