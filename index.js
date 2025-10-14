import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
dotenv.config();


import db from "./src/config/db.js";
import productRoutes from "./src/routes/products.js";
import userRoutes from "./src/routes/users.js";
import orderRoutes from "./src/routes/orders.js";

const app = express();
app.use(cors());
app.use(express.json());

// Tambahkan ini untuk serve gambar statis
app.use('/api/assets', express.static(path.join(process.cwd(), 'src', 'assets')));

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => res.send("☕ Coffee Shop API is running..."));

app.listen(process.env.PORT || 3000, () => {
  console.log("✅ Server running on port", process.env.PORT || 3000);
});
