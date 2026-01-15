import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import "dotenv/config";

import router from "./routes";

const app: Express = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isProd = process.env.NODE_ENV === "production";

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) return callback(null, true);

    if (!isProd) {
      if (/^http:\/\/.*localhost(:\d+)?$/.test(origin)) return callback(null, true);
    } else {
      if (
        origin === "https://simplao-frontend.vercel.app" ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "online",
    system: "SaaS Psicológico Kernel v1.0",
    timestamp: new Date(),
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err?.stack || err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err?.message || "Unknown error",
  });
});

export default app;
