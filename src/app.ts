import express from "express";
import dotenv from "dotenv";
import path from "path";

import { authRouter } from "./routes/auth";
import { mediaRouter } from "./routes/media";
import { swaggerRouter } from "./routes/swagger";
import { organisationRouter } from "./routes/organisation";
import { profileRouter } from "./routes/user";
import { pitchRouter } from "./routes/pitch";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/media", express.static(path.join(__dirname, "..", "uploads")));

app.use("/auth", authRouter);
app.use("/media", mediaRouter);
app.use("/docs", swaggerRouter);
app.use("/organisations", organisationRouter);
app.use("/profile", profileRouter);
app.use("/pitch", pitchRouter);

export { app };
