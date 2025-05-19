import { Request, Response, NextFunction } from 'express';

export function roleAuthMiddleware(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.role) {
      return res.status(403).json({ error: 'Access denied: no role found' });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient role' });
    }
    next();
  };
}
