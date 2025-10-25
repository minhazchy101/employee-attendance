import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import UsersRoute from "./routes/userRoutes.js";
import jwtRoute from "./routes/jwt.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Server is running...");
});
app.use("/", jwtRoute);
app.use("/api/users", UsersRoute);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
