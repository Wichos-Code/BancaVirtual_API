import { config } from "dotenv";
import { initServer } from "./configs/server.js";
import createAdminUser from "./src/auth/auth.controller.js";

config()
initServer()
createAdminUser()