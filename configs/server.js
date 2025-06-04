import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { dbConnection } from "./mongo.js";
import { swaggerDocs, swaggerUi } from "./swagger.js";
import apiLimiter from "../src/middlewares/request-limit.js";
import authRoutes from "../src/auth/auth.routes.js"
import userRoutes from "../src/user/user.routes.js"

const middlewares = (app) => {
    app.use(express.urlencoded({extended: false}))
    app.use(express.json())
    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", `http://localhost:${process.env.PORT}`],
                connectSrc: ["'self'", `http://localhost:${process.env.PORT}`],
                imgSrc: ["'self'", "data:"],
                styleSrc: ["'self'", "'unsafe-inline'"],
            },
        },
    }));
    app.use(morgan("dev"))
    app.use(apiLimiter)

}

const routes = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))
    app.use("/virtualBank/v1/auth", authRoutes)
    app.use("/virtualBank/v1/user", userRoutes)
}

const connectDB = async () => {
    try {
        await dbConnection()
    } catch (err) {
        console.log(`Database connection failed ${err}`)
        process.exit(1)
    }
}

export const initServer = () => {
    const app = express()
    try {
        middlewares(app)
        connectDB()
        routes(app)
        app.listen(process.env.PORT)
        console.log(`Server running on port ${process.env.PORT}`)
    } catch (err) {
        console.log(`Server init failed ${err}`)
    }
}