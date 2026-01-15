import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import * as jwt from "jsonwebtoken";
import { z } from 'zod';

// Extensão do Request para TypeScript
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

  try {
    // 1. Validar Token do Firebase (Autenticação)
    const decodedToken = await auth.verifyIdToken(token);
    
    // 2. Identificar Tenant pelo Subdomínio (Ex: cliente2.api.saas.com)
    // Em produção, o frontend envia o 'x-tenant-id' ou extraímos do host
    const host = req.headers.host || '';
    const subdomain = host.split('.')[0]; 
    
    // 3. Buscar usuário no Firestore para pegar o tenantId real e role
    // Otimização: Em produção, isso estaria em cache (Redis)
    const userSnap = await import('../config/firebase').then(m => m.db.collection('users').doc(decodedToken.uid).get());
    
    if (!userSnap.exists) {
        return res.status(403).json({ error: 'User not registered in system' });
    }

    const userData = userSnap.data();

    // 4. Segurança Crítica: O Subdomínio bate com o Tenant do usuário?
    // Exceção: Se for o domínio principal (landing page), lógica diferente pode aplicar.
    if (userData?.tenantId !== subdomain && subdomain !== 'localhost') { 
       // Em dev 'localhost' passa, em prod deve ser estrito
       return res.status(403).json({ error: 'Access denied for this tenant scope' });
    }

    // 5. Gerar/Anexar Contexto
    req.user = {
      userId: decodedToken.uid,
      tenantId: userData?.tenantId,
      role: userData?.role,
      email: decodedToken.email || ''
    };
    
    // Força o tenantId para uso nos repositórios
    req.tenantId = userData?.tenantId;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};