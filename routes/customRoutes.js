import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authToken from '../middleware/authToken.js';
import knexDb from "../db/knex.js"
import axios from 'axios';

const router = express.Router();

router.get('/user/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from header

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify the token
        const user = await knexDb('users').where({ id: decoded.id }).first();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Invalid token" });
    }
});


// POST: Login route
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await knexDb("users").where({ username: username.toLowerCase() }).first();

        // Check if user was found
        if (!user) {
            return res.status(401).json({ message: "Incorrect username or password" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (passwordMatch) {
            const token = jwt.sign(
                {
                    id: user.id,  // Use the 'id' column here
                    username: user.username,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "5h" }
            );
            return res.json({ token });
        } else {
            return res.status(401).json({ message: "Incorrect username or password" });
        }
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
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Signup failed", error: error.message });
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
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

    
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.id; // Extract user ID from token

        const userBooks = await knexDb("user_books")
            .where("user_id", userId) // Use userId from token
            .select("book_id");

            if (userBooks.length === 0) { return res.status(404).json({ message: "No books found on shelf" }); }

            const bookDetails = await Promise.all(userBooks.map(async (book) => {
                // Validate book ID before making a request
                if (!book.book_id) {
                    console.error("Invalid book ID:", book.book_id);
                    return null; // Skip invalid IDs
                }
    
                try {
                    const response = await axios.get(`https://openlibrary.org/works/${book.book_id}.json`, {
                        timeout: 9000 // 5 seconds timeout
                    });
                    console.log(response.data.covers)
                    return {
                        id: book.book_id,
                        title: response.data.title || "Untitled",
                        author: response.data.authors ? response.data.authors.map(author => author.name).join(", ") : "Unknown Author",
                        coverImage: response.data.covers && response.data.covers.length > 0 ? `https://covers.openlibrary.org/b/id/${response.data.covers[0]}-L.jpg` : null
                    };
                } catch (error) {
                    console.error(`Error fetching details for book ID ${book.book_id}:`, error);
                    return null; // Return null for errors so we can filter later
                }
            }));
        // res.json(userBooks);
        res.json(bookDetails)
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching books" });
    }
});

// POST: Add a book to the user's shelf
router.post("/books/shelf/add", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const { book_id } = req.body;
    if (!book_id) {
        return res.status(400).json({ message: "Book ID is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.id;

        console.log("Request body:", req.body);
        console.log("userId:", userId, "bookId:", book_id);

        // Check if the book is already on the shelf
        const existingBook = await knexDb("user_books")
            .where({ user_id: userId, book_id: book_id })
            .first();

        if (existingBook) {
            return res.status(400).json({ message: "Book is already on the shelf" });
        }

        // Add the book to the user's shelf
        await knexDb("user_books").insert({ user_id: userId, book_id: book_id });
        res.json({ message: "Book added to shelf" });
    } catch (error) {
        console.error("Error adding book to shelf:", error.message);
        res.status(500).json({ message: "Error adding book to shelf", error: error.message });
    }
});

// // GET: Fetch related books based on user's saved books
// router.get("/books/recommendations", async (req, res) => {
//     console.log("Header received: ", req.headers);
//     const token = req.headers.authorization?.split(" ")[1];
//     // console.log("Token: ", token);
//     if (!token) return res.status(401).json({ message: "No token provided" });

//     try {
//         // Decode JWT to get user ID
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//         const userId = decoded.id;

//         // Fetch the user's saved books from the user_books table
//         const userBooks = await knexDb("user_books")
//             .where("user_id", userId)
//             .select("book_id");

//         if (userBooks.length === 0) {
//             return res.status(404).json({ message: "No books found on shelf" });
//         }

//         // Get the first saved book ID
//         const firstBookId = userBooks[0].book_id;

//         // Fetch details of the first saved book from Open Library API
//         const response = await axios.get(`https://openlibrary.org/works/${firstBookId}.json`);

//         const genre = response.data.subjects ? response.data.subjects[0] : null; // First genre
//         const author = response.data.authors ? response.data.authors[0].name : null; // First author

//         let relatedBooks = [];

//         // Fetch related books by genre if available
//         if (genre) {
//             const genreResponse = await axios.get(`https://openlibrary.org/subjects/${genre}.json`);
//             relatedBooks = genreResponse.data.works;
//         }

//         // Fetch related books by author if available
//         if (author) {
//             const authorResponse = await axios.get(`https://openlibrary.org/search.json?author=${author}`);
//             const authorBooks = authorResponse.data.docs.map(book => ({
//                 key: book.key,
//                 id: book.book_id,
//                 title: response.data.title || "Untitled",
//                 author: response.data.authors ? response.data.authors.map(author => author.name).join(", ") : "Unknown Author",
//                 coverImage: response.data.covers && response.data.covers.length > 0 ? `https://covers.openlibrary.org/b/id/${response.data.covers[0]}-L.jpg` : null
//             }));
//             relatedBooks = [...relatedBooks, ...authorBooks];
//         }

//         // Ensure the books are unique by 'key' (book ID)
//         const uniqueRelatedBooks = Array.from(
//             new Set(relatedBooks.map(book => book.key))
//         ).map(key => relatedBooks.find(book => book.key === key));

//         res.json(uniqueRelatedBooks);
//     } catch (error) {
//         console.error("Error fetching related books:", error.message);
//         res.status(500).json({ message: "Error fetching related books", error: error.message });
//     }
// });


export default router;