const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Tiffin Ghar API v2 chal rahi hai" }));

app.listen(5000, () => console.log("Server 5000 par chalu"));