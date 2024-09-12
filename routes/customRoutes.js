import express from "express";
import axios from 'axios';
import "dotenv/config";import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();
const { PORT} = process.env;

// Home route
// app.get("/", (req, res) => {

// })

// POST: Login route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try{
        const user = await knex("users").where({ username: username.toLowerCase() }).first();
        if (!user){
            return res.status(401).json({ message: "Login failed" });
        }

        // compare the hased password with the given password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // generate token
            const token = jwt.sign(
                {
                    userId: user.userId,
                    username: user.username,
                }, JWT_SECRET_KEY,
                {
                    expiresIn: "2h",
                }
            );
            res.json({ token });
        } else {
            return res.status(400).json({ message: "Login failed" });
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({ message: "Login failed" });
    }
});

// POST: Signup
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await knex("user").insert({
            username: username.toLowerCase(),
            email,
            password: hashedPassword,
        });

        res.status(201).json({ message: "User successfully created"})

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Signup failed"})
    }
})


// GET: User's saved books
router.get("/book/shelf/:userId", async (req, res) => {
    const { userId } = req.params;

    try{
        const books = await knex("shelf")
        .join("books", "shelf.bookId", "books.Id")
        .where("shelf.userId", userId)
        .select("books.id", "books.title", "books.author", "books.coverImage");

        res.json(books);

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error saving book" });
    }
})

// POST: Add books to user's shelf

// DElETE: Remove books from the user's shelf

// GET: Recommendations
