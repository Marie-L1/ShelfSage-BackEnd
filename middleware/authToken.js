import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Custom Middlewar to verify JWT
function authToken(req, res, next){
    if (!req.headers.authorization){
        return res.status(401).json({ message: "No token provided" });
    }
    const token = req.headers.authorization.split(" ")[1];
    console.log("token:", token)

    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
        if (error){
            return res.status(403).json({ message: "Token validation failed" });
        }
        req.id = decoded.id,
        req.username = decoded.username;
        req.email = decoded.email;
        req.timeOfrequest = Date.now();
        next();
    })
};
export default authToken;