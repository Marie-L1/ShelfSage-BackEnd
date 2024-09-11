import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import initKnex from "knex";
import configuration from "./knexfile.js";
const knex = initKnex(configuration);
const app = express();
dotenv.config();
configDotenv.config();

const { JWT_SECRET_KEY, PORT } = process.env;

app.use(express.json()); 
app.use(express.static("public")); 
app.use(cors()); 

/*
 * Middleware
 */

// Custom Middlewar to verify JWT
function authToken(req, res, next){
    if (!req.headers.authorization){
        return res.status(401).json({ message: "No token provided" });
    }
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, JWT_SECRET_KEY, (error, decoded) => {
        if (error){
            return res.status(500).json({ message: "Token validation failed" });
        }
        req.user = decoded;
        req.email = "";
        req.timeOfrequest = Date.now();
        next();
    })
}


// Use routes
app.use("/api", customRoutes); 

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});