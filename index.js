import express from "express";
import cors from "cors";
import "dotenv/config";
import knexDb from "./db/knex.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import customRoutes from "./routes/customRoutes.js";
import APIRoutes from "./routes/APIRoutes.js"
import RecommendatonRoutes from "./routes/RecommendationRoutes.js"

const app = express();
const { PORT } = process.env;


// Middleware - attach Knex instance to the req object
app.use((req, res, next) => {
    req.knexDb = knexDb;
    next();
});

app.use(express.json()); 
app.use(express.static("public")); 
app.use(cors()); 

// Use routes
app.use("/", customRoutes); 
app.use("/", APIRoutes);
app.use("/", RecommendatonRoutes);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});