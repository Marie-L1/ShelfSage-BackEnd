import express from 'express';
import axios from 'axios';
// import {getCoverImageUrl} from '../utils/utils';

const router = express.Router();

// Create the cover image URL based on the cover ID in the API
function getCoverImageUrl(coverId, size = 'M') {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};

//OL20867W


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