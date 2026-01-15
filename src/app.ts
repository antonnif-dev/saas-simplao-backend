import express from "express";
import type { Express, Request, Response, NextFunction } from "express";

import cors from "cors";
import type { CorsOptions } from "cors";

import helmet from "helmet";
import "dotenv/config";

import router from "./routes";

const app: Express = express();
const PORT = process.env.PORT || 3001;

// 1. Segurança e Parsers
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Somente localhost:3000 funcionando
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.match(/^http:\/\/localhost/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
*/

const isProd = process.env.NODE_ENV === "production";

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Requisições sem origin (Postman, mobile, SSR)
    if (!origin) return callback(null, true);

    if (!isProd) {
      // DEV → aceita localhost e subdomínios
      if (/^http:\/\/.*localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    } else {
      // PROD → domínio da Vercel e subdomínios
      if (
        origin === "https://simplao-frontend.vercel.app" ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".simplao-frontend.vercel.app")
      ) {
        return callback(null, true);
      }
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// 3. Rotas da API
app.use("/api/v1", router);

// 4. Rota de Health Check
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "online",
    system: "SaaS Psicológico Kernel v1.0",
    timestamp: new Date(),
  });
});

// 5. Middleware Global de Erros
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  const error = err as { stack?: string; message?: string };
  console.error(error.stack || error.message || err);
  res.status(500).json({
    error: "Internal Server Error",
    message: error.message || "Unknown error",
  });
});

// 6. Iniciar Servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV}`);
});