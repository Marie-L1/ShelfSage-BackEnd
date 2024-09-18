import express from 'express';
import axios from 'axios';

const router = express.Router();
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY; 

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
        const books = response.data.items.map(item => ({
            id: item.id, // volume id
            title: item.volumeInfo.title,
            author: item.volumeInfo.author,
            coverImage: item.volumeInfo.imageLinks,
            description: item.volumeInfo.description,
            genre: item.volumeId.genre,
            catgeories: item.volumeId.categories,
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

// GET: list of popular books
router.get("/books/popular", async (req, res)=>{
    try{
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=popular-books`, {
            params: {
                key: GOOGLE_BOOKS_API_KEY,
            },
        });
        // Map response data to your desired format
        const popularBooks = response.data.items.map(item => ({
            id: item.id,
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors,
            coverImage: item.volumeInfo.imageLinks,
            description: item.volumeInfo.description,
            categories: item.volumeInfo.categories,
        }));

        res.json(popularBooks);

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error fetching popular books" });
    }
});


export default router;