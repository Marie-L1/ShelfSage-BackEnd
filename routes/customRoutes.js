import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authToken from '../middleware/authToken.js';
import knexDb from "../db/knex.js"

const router = express.Router();

// GET: Fetch user info
router.get("/user/me", authToken, async (req, res) => {
    try {
        const userId = req.id; 
        console.log(userId)
        const user = await knexDb("users").where({ id: userId }).first(); 
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user data" });
    }
});

// POST: Login route
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await knexDb("users").where({ username: username.toLowerCase() }).first();
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign(
                {
                    id: user.id,  // Use the 'id' column here
                    username: user.username,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "2h" }
            );
            res.json({ token });
        };
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Login failed" });
    }
});

// POST: Signup
router.post("/signup", async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [newUserId] = await knexDb("users").insert({
            username: username.toLowerCase(),
            email,
            password: hashedPassword
        });
        
        res.status(201).json({ message: "User successfully created", userId: newUserId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Signup failed" });
    }
});

// GET: when the user logs in
router.get("/loggedIn", authToken, (req, res) => {
    try {
        res.status(200).json({ 
            message: "User is logged in!",
            user: {
                id: req.id,  
                username: req.username,
            },
            timeOfRequest: new Date().toISOString(),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login failed" });
    }
});

// DELETE: Delete the user's account
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await knexDb("user_books").where({ user_id: id }).del();
        await knexDb("users").where({ id }).del();
        res.json({ message: "User account successfully deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting account" });
    }
});

// GET: User's saved books
router.get("/books/shelf", async (req, res) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.id; // Extract user ID from token

        const userBooks = await knexDb("user_books")
            .join("books", "user_books.book_id", "=", "books.id")
            .where("user_books.user_id", userId) // Use userId from token
            .select("books.id", "books.title", "books.author", "books.cover_image");

        res.json(userBooks);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching books" });
    }
});

// POST: Add books to user's shelf
router.post("/books/shelf/add", async (req, res) => {
    const { bookId } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.id; // Extract user ID from token

        await knexDb("user_books").where({ user_id: userId, book_id: bookId }).del();
        res.json({ message: "Book removed from shelf" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding book to shelf" });
    }
});

// DELETE: Remove books from the user's shelf
router.delete("/books/shelf/remove", async (req, res) => {
    const { userId, bookId } = req.body;

    try {
        await knexDb("user_books").where({ user_id: userId, book_id: bookId }).del();
        res.json({ message: "Book removed from shelf" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error removing book from shelf" });
    }
});

export default router;