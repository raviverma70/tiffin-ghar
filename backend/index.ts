import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Tiffin Ghar API chal rahi hai" });
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/users", async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: "phone zaroori hai" });
    const user = await prisma.user.create({ data: { phone, name } });
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: "User nahi bana (shayad ye phone pehle se hai)" });
  }
});

app.listen(5000, () => console.log("Server 5000 par chalu"));