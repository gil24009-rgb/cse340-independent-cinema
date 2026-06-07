import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const parsedPort = Number(process.env.PORT || 3400);

if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

export const env = Object.freeze({
  databaseUrl: process.env.DATABASE_URL || "",
  isProduction: nodeEnv === "production",
  nodeEnv,
  port: parsedPort,
});
