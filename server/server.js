import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./src/config/database.js";
import http from "http";
import { initSocket } from "./src/sockets/server.socket.js";

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
initSocket(httpServer);
httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on http://localhost:${PORT}`);
});
const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
