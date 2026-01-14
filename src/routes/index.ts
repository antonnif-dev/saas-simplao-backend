import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';

// Importe seus controllers aqui (exemplo)
// import * as PatientController from '../controllers/patient.controller';

const router = Router();

// Rota Pública (Login/Registro)
router.get('/public-config', (req, res) => {
    // Simula retorno de configs públicas
    res.json({ message: "Config public" });
});

// Rotas Protegidas (Exigem Tenant + Login)
router.use(authMiddleware);

// Exemplo de rota protegida
router.get('/dashboard-stats', (req, res) => {
    res.json({ 
        tenant: req.tenantId, 
        stats: { patients: 12, sessions: 45 } 
    });
});

export default router;