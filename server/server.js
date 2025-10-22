import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import UsersRoute from "./routes/userRoutes.js";
import jwtRoute from "./routes/jwt.js";


const app = express();
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Routes
    app.get('/', (req, res) => {
      res.send('Server is running...');
    });

    
    app.use("/", jwtRoute);
    app.use('/api/users', UsersRoute);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
