import express from "express";
import jwt from "jsonwebtoken";

const jwtRoute = express.Router();

jwtRoute.post("/jwt", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

export default jwtRoute;
