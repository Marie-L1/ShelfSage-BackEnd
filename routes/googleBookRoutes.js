import express from 'express';
import axios from 'axios';

const router = express.Router();
 
const baseUrl = "https://openlibrary.org/"

// GET: Search for books
router.get("/books/", async (req, res) => {
    const query = req.query.q;
    
    try {
        const response = await axios.get('https://openlibrary.org/search/.json', {
            params: {
                q: query,
                limit: 10,
            },
            headers: {
                'User-Agent': 'ShelfSage/1.0 (mlukowich27@gmail.com)' // Add a User-Agent header
            }
        });

        const books = response.data.docs.map(item => ({
            id: item.key.replace('/works/', ''), // Extract work ID
            title: item.title,
            author: item.author_name, 
            coverImage: item.cover_i, 
            description: item.first_sentence,
            categories: item.subject, 
        }));

        res.json(books); // Send the books data back in the response
    } catch (error) {
        console.error('Error fetching book details:', error.message);
        res.status(500).json({ message: "Error fetching book details" });
    }
});


// GET: Book details
router.get("/books/details/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const response = await axios.get(`https://openlibrary.org/works/${id}.json`, {
            headers: {
                'User-Agent': 'ShelfSage/1.0 (mlukowich27@gmail.com)' // Add a User-Agent header
            }
        });
        
        const details = response.data.docs.map(item => ({
            id: item.key.replace('/works/', ''), // Extract work ID
            title: item.title,
            author: item.author_name,
            coverImage: item.coverImage,
            description: item.first_sentence,
            categories: item.subject,
        }));

        res.json(details);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching book details" });
    }
});

// GET: list of popular books
router.get("/books/popular", async (req, res) => {
    try{
        const response = await axios.get('https://openlibrary.org/search.json?', {
            params: {
                q: 'popular-books',
                limit: 10,
            },
            headers: {
                'User-Agent': 'ShelfSage/1.0 (mlukowich27@gmail.com)'
            }
        });

        const popularBooks = response.data.docs.map(item => ({
            id: item.key.replace('/works/', ''), // Extract work ID
            title: item.title,
            author: item.author_name,
            coverImage: item.coverImage,
            description: item.first_sentence,
            categories: item.subject,
        }));

        res.json(popularBooks); 
    } catch (error) {
        console.error('Error fetching popular books:', error.message);
        res.status(500).json({ message: "Error fetching popular books" });
    }
    });


export default router;