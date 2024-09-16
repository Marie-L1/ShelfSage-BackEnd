import express from "express";
import axios from "axios";
import "dotenv/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();
const { JWT_SECRET_KEY } = process.env;

// apply middleware to the routes
router.get("/user/me", authToken, async (req, res) => {
    try{
        const userId = req.user.userId;
        const user = await knex("users").where({ userId }).first();
        if(!user){
            return res.status(404).json({ message: "User not found"})
        }
        res.json(user);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error fetching user data"});
    }
});

// POST: Login route
router.post("/login", async (req, res) => {
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
router.post("/signup", async (req, res) => {
    const { username, password, email } = req.body;

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
});

// DELETE: Delete the user's account
router.delete("/delete/:userId", async (req, res) => {
    const { userId } =req.params;

    try{
        // delete user from user_book table first
        await knex("user_books").where({user_id: userId, }).del();

        // delete user from the users table
        await knex("users").where({ id: userId }).del();

        res.json({ message: "User account successfully deleted" });

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error deleting account"});
    }
})


// GET: User's saved books
router.get("/books/shelf/:userId", async (req, res) => {
    const { userId } = req.params;

    try{
        const userBooks = await knex("user_books").where({ user_id: userId });
        res.json(userBooks);

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error saving book" });
    }
});

// POST: Add books to user's shelf
router.post("/books/shelf/add", async (req, res) => {
    const { userId, bookId } = req.body;

    try{
        addBook = await knex("user_books").insert({ user_id: userId, book_id: bookId });

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error adding book to shelf" });
    }
});

// DElETE: Remove books from the user's shelf
router.delete("/books/shelf/remove", async (req, res) => {
    const { userId, bookId } = req.body;

    try{
        const removeBook = await knex("user_books").where({ user_id: userId, book_id: bookId }).del();
        res.json(removeBook);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error removing book from shelf" });
    }
})

// GET: Search for books - for search bar
router.get("/books/details", async (req, res) => {
    const query = req.query.q;

    try{
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes`, {
            params: {
                q: query,
                key: GOOGLE_BOOKS_API_KEY,
            },
        });
        const books = response.data.item.map(item => ({
            id: item.id, // volume id
            title: item.volumeInfo.title,
            author: item.volumeInfo.author,
            coverImage: item.volumeInfo.imageLinks,
            description: item.volumeInfo.description,
        }))

        res.json(books);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error fetching book details" });
    }
});

// GET: get deails of single book by Volume ID
router.get("/books/:id", async (req, res) => {
    const volumeId = req.params.id;

    try{
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${volumeId}`, {
            params: {
                key: GOOGLE_BOOKS_API_KEY
            },
        });
        const book = {
            id: response.data.id, // volume id
            title: response.data.volumeInfo.title,
            author: response.data.volumeInfo.author,
            coverImage: response.data.volumeInfo.imageLinks,
            description: response.data.volumeInfo.description,
            categories: response.data.volumeInfo.categorie,
            genre: response.data.volumeInfo.genre,
        }
        res.json(book);

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error fetching book details" });
    }
})

// GET: Recommendations

