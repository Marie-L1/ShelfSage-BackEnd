import express from "express";
import cors from "cors";
import knex from "knex";
import config from "./knexfile.js";
import "dotenv/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import knexConfig from './knexfile.js';
import customRoutes from "./routes/customRoutes.js";
import googleBookRoutes from "./routes/googleBookRoutes.js"

// Initialize Knex with the development configuration
const knexDb = knex(config.development);

const app = express();
const { PORT, CORS_ORIGIN } = process.env;

app.use(express.json()); 
app.use(express.static("public")); 
app.use(cors({ origin: CORS_ORIGIN })); 

// Middleware - attach Knex instance to the req object
app.use((req, res, next) => {
    req.knexDb = knexDb;
    next();
});

// Use routes
app.use("/", customRoutes); 
app.use("/", googleBookRoutes);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});