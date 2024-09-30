import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authToken from '../middleware/authToken.js';
import knexDb from "../db/knex.js"
import axios from 'axios';

const router = express.Router();

// Create the cover image URL based on the cover ID in the API
function getCoverImageUrl(coverId, size = 'M') {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};


// GET: list of popular/classic books
router.get("/books/popular", async (req, res) => {
    try{
        const response = await axios.get('https://openlibrary.org/search.json?', {
            params: {
                q: 'popular',
                limit: 10,
            },
            headers: {
                'User-Agent': 'ShelfSage/1.0 (mlukowich27@gmail.com)'
            }
        });

        console.log("response data:", response.data)

        const popularBooks = response.data.docs.map(item => ({
            id: item.key.split('/').pop(), 
            title: item.title,
            author: item.author_name,
            coverImage: getCoverImageUrl(item.cover_i),
            description: item.first_sentence,
            categories: item.subject,
        }));

        res.json(popularBooks); 
    } catch (error) {
        console.error('Error fetching popular books:', error.message);
        res.status(500).json({ message: "Error fetching popular books" });
    }
});

// GET: list of Sara J. Maas books
router.get("/books/Maas", async (req, res) => {
    try{
        const response = await axios.get('https://openlibrary.org/search.json?', {
            params: {
                author: 'Maas',
                limit: 10,
            },
            headers: {
                'User-Agent': 'ShelfSage/1.0 (mlukowich27@gmail.com)'
            }
        });

        console.log("response data:", response.data)

        const popularBooks = response.data.docs.map(item => ({
            id: item.key.split('/').pop(), 
            title: item.title,
            author: item.author_name,
            coverImage: getCoverImageUrl(item.cover_i),
            description: item.first_sentence,
            categories: item.subject,
        }));

        res.json(popularBooks); 
    } catch (error) {
        console.error('Error fetching Maas books:', error.message);
        res.status(500).json({ message: "Error fetching Maas's books" });
    }
});

// GET: list of Scifibooks
router.get("/books/scifi", async (req, res) => {
    try{
        const response = await axios.get('https://openlibrary.org/search.json?', {
            params: {
                q: 'scifi',
                limit: 10,
            },
            headers: {
                'User-Agent': 'ShelfSage/1.0 (mlukowich27@gmail.com)'
            }
        });

        console.log("response data:", response.data)

        const popularBooks = response.data.docs.map(item => ({
            id: item.key.split('/').pop(), 
            title: item.title,
            author: item.author_name,
            coverImage: getCoverImageUrl(item.cover_i),
            description: item.first_sentence,
            categories: item.subject,
        }));

        res.json(popularBooks); 
    } catch (error) {
        console.error('Error fetching scifi books:', error.message);
        res.status(500).json({ message: "Error fetching sci fi books" });
    }
});

// GET: list of Tolkien's books
router.get("/books/tolkien", async (req, res) => {
    try{
        const response = await axios.get('https://openlibrary.org/search.json?', {
            params: {
                q: 'tolkien',
                limit: 10,
            },
            headers: {
                'User-Agent': 'ShelfSage/1.0 (mlukowich27@gmail.com)'
            }
        });

        console.log("response data:", response.data)

        const tolkienBooks = response.data.docs.map(item => ({
            id: item.key.split('/').pop(), 
            title: item.title,
            author: item.author_name,
            coverImage: getCoverImageUrl(item.cover_i),
            description: item.first_sentence,
            categories: item.subject,
        }));

        res.json(tolkienBooks); 
    } catch (error) {
        console.error('Error fetching non-fiction books:', error.message);
        res.status(500).json({ message: "Error fetching non-fiction books" });
    }
});

// GET: Search for books by user query
router.get("/books/search", async (req, res) => {
    const query = req.query.q;

    try {
        const response = await axios.get('https://openlibrary.org/search.json', {
            params: {
                q: query,
                limit: 10, 
            },
            headers: {
                'User-Agent': 'ShelfSage/1.0 (mlukowich27@gmail.com)' 
            }
        });

        const books = response.data.docs.map(item => ({
            id: item.key.split('/').pop(), 
            title: item.title,
            author: item.author_name,
            coverImage: getCoverImageUrl(item.cover_i),
            description: item.first_sentence,
            categories: item.subject,
        }));

        res.json(books);
    } catch (error) {
        console.error('Error fetching book details:', error.message);
        res.status(500).json({ message: "Error fetching book details" });
    }
});

// GET: Fetch related books based on user's saved books
router.get("/books/recommendations", async (req, res) => {
    // console.log("Header received: ", req.headers);
    const token = req.headers.authorization?.split(" ")[1];
    // console.log("Token: ", token);
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        // Decode JWT to get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.id;

        // Fetch the user's saved books from the user_books table
        const userBooks = await knexDb("user_books")
            .where("user_id", userId)
            .select("book_id");

        if (userBooks.length === 0) {
            return res.status(404).json({ message: "No books found on shelf" });
        }

        // Get the first saved book ID
        const firstBookId = userBooks[0].book_id;

        // Fetch details of the first saved book from Open Library API
        const response = await axios.get(`https://openlibrary.org/works/${firstBookId}.json`);

        const genre = response.data.subjects ? response.data.subjects[0] : null; // First genre
        const author = response.data.authors ? response.data.authors[0].name : null; // First author

        let relatedBooks = [];

        // Fetch related books by genre if available
        if (genre) {
            const genreResponse = await axios.get(`https://openlibrary.org/subjects/${genre}.json`);
            relatedBooks = genreResponse.data.works;
        }

        // Fetch related books by author if available
        if (author) {
            const authorResponse = await axios.get(`https://openlibrary.org/search.json?author=${author}`);
            relatedBooks = authorResponse.data.works;
            relatedBooks = [...relatedBooks, ...authorBooks];
        }

        // Ensure the books are unique by 'key' (book ID)
        const uniqueRelatedBooks = Array.from(
            new Set(relatedBooks.map(book => book.key))
        ).map(key => relatedBooks.find(book => book.key === key));

        res.json(uniqueRelatedBooks);
    } catch (error) {
        console.error("Error fetching related books:", error.message);
        res.status(500).json({ message: "Error fetching related books", error: error.message });
    }
});

// GET: Book details
router.get("/books/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const response = await axios.get(`https://openlibrary.org/works/${id}.json`, {
            headers: {
                "User-Agent": "ShelfSage/1.0 (mlukowich27@gmail.com)"
            }
        });
        
        const details = {
            id: response.data.id, 
            title: response.data.title,
            author: response.data.author_name,
            coverImage: getCoverImageUrl(response.data.cover_id),
            description: response.data.first_sentence,
            categories: response.data.subjects,
        };

        res.json(details);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching book details" });
    }
});

export default router;