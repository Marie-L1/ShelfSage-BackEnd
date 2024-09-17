import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import customRoutes from "./routes/customRoutes.js";
import googleBookRoutes from "./routes/googleBookRoutes.js"
import initKnex from 'knex';
import configuration from './knexfile.js';

const knex = initKnex(configuration);

dotenv.config();

const app = express();

// middleware
app.use(express.json()); 
app.use(express.static("public")); 
app.use(cors()); 

const { JWT_SECRET_KEY, PORT } = process.env;

// Custom Middlewar to verify JWT
function authToken(req, res, next){
    if (!req.headers.authorization){
        return res.status(401).json({ message: "No token provided" });
    }
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
        if (error){
            return res.status(403).json({ message: "Token validation failed" });
        }
        req.user = decoded;
        req.email = decoded.email;
        req.timeOfrequest = Date.now();
        next();
    })
};
export {authToken};

// Use routes
app.use("/", customRoutes); 
app.use("/", googleBookRoutes);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});