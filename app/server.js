import { createApp } from "./src/app.js";
import { env } from "./src/config/env.js";
import { closeDatabase } from "./src/config/database.js";

const app = createApp();
const server = app.listen(env.port, () => {
  console.log(`Cinema app running at http://localhost:${env.port}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing server.`);

  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
