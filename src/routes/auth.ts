import { Router } from "express";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  // const { email, password } = req.body;
  // const token = await betterAuthLogin(email, password);
  // res.json({ token });

  res.json({ token: "demo-token" });
});
