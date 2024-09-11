import express from 'express';
import axios from 'axios';

const router = express.Router();
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY; 

// GET: search for books
router.get("/search", async (req, res) => {
    const { q, type } = req.query;
    let queryParam = "";

    switch (type) {
        case "title":
            queryParam = `intitle:${q}`;
            break;
        case "author":
            queryParam = `inauthor:${q}`;
            break;
        case "subject":
            queryParam = `insubject:${q}`;
            break;
        case "isbn":
            queryParam = `inisbn:${q}`;
            break;
    }

    try{
        const response = await axios.get("https://www.googleapis.com/books/v1/volumes", {
            params: {
                q: queryParam,
                key: GOOGLE_BOOKS_API_KEY,
            },
        });
        res.json(response.data);
    }catch(error){
        console.error("Error fetching data", error);
        res.status(500).json({ message: "Error fetching data from Google Books API"})
    }
});

// GET: book details by ID
router.get("book/:id", async(req, res) => {
    const { id } = req.params;

    try{
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`, {
            params: {
                key: GOOGLE_BOOKS_API_KEY,
            },
        });

        const bookData = response.data;

        const bookDetails = {
            title: bookData.volumeInfo.title,
            authors: bookData.volumeInfo.authors || [],
            publishedDate: bookData.volumeInfo.publishedDate,
            description: bookData.volumeInfo.description,
            genre: bookData.volumeInfo.genre,
            image: bookData.volumeInfo.image,
            language: bookData.volumeInfo.language,
        };

        res.json(bookDetails);

    }catch(error){
        console.error("Error fetching book details");
        res.status(500).json({ message: "Error fetching book details from Google Books API"})
    }
})