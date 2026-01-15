import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import * as jwt from "jsonwebtoken";
import { z } from 'zod';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        tenantId: string;
        role: string;
        email: string;
      };
      tenantId?: string; // Capturado do subdomínio
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const host = req.headers.host || '';
    const subdomain = host.split('.')[0];
    const userSnap = await import('../config/firebase').then(m => m.db.collection('users').doc(decodedToken.uid).get());
    if (!userSnap.exists) {
      return res.status(403).json({ error: 'User not registered in system' });
    }
    const userData = userSnap.data();
    if (!userData?.tenantId) {
      return res.status(403).json({ error: 'User missing tenantId' });
    }

    if (!userData?.role) {
      return res.status(403).json({ error: 'User missing role' });
    }

    if (userData?.tenantId !== subdomain && subdomain !== 'localhost') {
      return res.status(403).json({ error: 'Access denied for this tenant scope' });
    }

    req.user = {
      userId: decodedToken.uid,
      tenantId: userData.tenantId,
      role: userData.role,
      email: decodedToken.email || ''
    };

    req.tenantId = userData.tenantId;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};