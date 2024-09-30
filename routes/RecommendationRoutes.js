import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authToken from '../middleware/authToken.js';
import knexDb from "../db/knex.js"
import axios from 'axios';

const router = express.Router();

// GET: Recommended books based on user's saved books
// router.get("/recommendations", async (req, res) => {
//     const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

//     if (!token) return res.status(401).json({ message: "No token provided" });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//         const userId = decoded.id; // Extract user ID from token

//         // Fetch user's saved books
//         const userBooks = await knexDb("user_books")
//             .where("user_id", userId)
//             .select("book_id");

//         if (userBooks.length === 0) {
//             return res.status(404).json({ message: "No saved books found" });
//         }

//         // Extract book IDs for querying similar books
//         const bookIds = userBooks.map(book => book.book_id);

//         // Example: Fetch books from the same authors or genres (this assumes you have author or genre info)
//         const recommendedBooks = await knexDb("user_books")
//             .whereIn("book_id", bookIds) // You may want to join with a books table here
//             .select("book_id");

//         const bookDetails = await Promise.all(recommendedBooks.map(async (book) => {
//             try {
//                 const response = await axios.get(`https://openlibrary.org/works/${book.book_id}.json`);
//                 return {
//                     id: book.book_id,
//                     title: response.data.title || "Untitled",
//                     author: response.data.authors ? response.data.authors.map(author => author.name).join(", ") : "Unknown Author",
//                     coverImage: response.data.covers && response.data.covers.length > 0 ? `https://covers.openlibrary.org/b/id/${response.data.covers[0]}-L.jpg` : null
//                 };
//             } catch (error) {
//                 console.error(`Error fetching details for book ID ${book.book_id}:`, error);
//                 return null; // Handle errors appropriately
//             }
//         }));

//         res.json(bookDetails.filter(book => book !== null)); // Filter out nulls
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error fetching recommended books" });
//     }
// });

export default router;
