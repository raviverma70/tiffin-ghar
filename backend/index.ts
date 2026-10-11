import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import authRouter from "./routes/auth.js";
import { requireAuth, type AuthedRequest } from "./middleware/auth.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
  if (!user) return res.status(404).json({ error: "User nahi mila" });
  res.json(user);
});

app.get("/", (req, res) => {
  res.json({ message: "Tiffin Ghar API chal rahi hai" });
});



app.listen(5000, () => console.log("Server 5000 par chalu"));