import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./lib/prisma.js";
import authRouter from "./routes/auth.js";
import providersRouter from "./routes/providers.js";
import menuRouter from "./routes/menu.js";
import { requireAuth, type AuthedRequest } from "./middleware/auth.js";
import { globalLimiter } from "./middleware/rateLimit.js";
import publicProvidersRouter from "./routes/publicProviders.js";
import ordersRouter from "./routes/orders.js";
import providerOrdersRouter from "./routes/providerOrders.js";
import adminRouter from "./routes/admin.js";

export const app = express();

app.use(helmet());
app.use(cors()); // live karne se pehle yaha sirf apni website ka address denge
app.use(express.json({ limit: "100kb" }));
app.use(globalLimiter);

app.get("/", (req, res) => {
  res.json({ message: "Tiffin Ghar API chal rahi hai" });
});

const api = express.Router();

api.use("/auth", authRouter);
api.use("/providers/me/menu", menuRouter);
api.use("/providers/me/orders", providerOrdersRouter);
api.use("/providers", providersRouter);
api.use("/providers", publicProvidersRouter);
api.use("/orders", ordersRouter);
api.use("/admin", adminRouter);
api.get("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!user) return res.status(404).json({ error: "User nahi mila" });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

app.use("/api/v1", api);

app.use((req, res) => {
  res.status(404).json({ error: "Ye route nahi mila" });
});

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if ((err as { type?: string })?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON galat likha hai" });
  }
  console.error(err);
  res.status(500).json({ error: "Kuch gadbad hui, baad me try karo" });
});
