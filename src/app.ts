import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

// Importação das rotas (vamos criar abaixo)
import router from './routes'; 

const app: Express = express();
const PORT = process.env.PORT || 3001;

// 1. Segurança e Parsers
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CORS (Crucial para Localhost com subdomínios)
// Permite que localhost:3000 e subdomínios acessem o backend na porta 3001
app.use(cors({
  origin: (origin, callback) => {
    // Em produção, liste os domínios exatos. Em dev, aceitamos localhost.
    if (!origin || origin.match(/^http:\/\/localhost/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 3. Rotas da API
app.use('/api/v1', router);

// 4. Rota de Health Check (Para testar se está vivo)
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    status: 'online', 
    system: 'SaaS Psicológico Kernel v1.0',
    timestamp: new Date()
  });
});

// 5. Middleware Global de Erros
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

// 6. Iniciar Servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV}`);
});