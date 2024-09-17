import express from "express";
import cors from "cors";
import "dotenv/config";
import knexDb from "./db/knex.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import customRoutes from "./routes/customRoutes.js";
import googleBookRoutes from "./routes/googleBookRoutes.js"

const app = express();
const { PORT, CORS_ORIGIN } = process.env;

const corsOptions = {
    origin: CORS_ORIGIN, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

  // Middleware - attach Knex instance to the req object
app.use((req, res, next) => {
    req.knexDb = knexDb;
    next();
});

app.use(express.json()); 
app.use(express.static("public")); 
app.use(cors(corsOptions)); 


// Use routes
app.use("/", customRoutes); 
app.use("/", googleBookRoutes);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});