import { Request, Response, NextFunction } from 'express';

export const roleAuthMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Access forbidden: insufficient role' });
    }
    next();
  };
};
