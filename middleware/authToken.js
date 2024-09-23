import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

function authToken(req, res, next){
    if (!req.headers.authorization){
        return res.status(401).json({ message: "No token provided" });
    }
    const token = req.headers.authorization.split(" ")[1];
    console.log("token:", token)
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.id = user.id;
        req.username = user.username;
        next(); 
    });
};
export default authToken;