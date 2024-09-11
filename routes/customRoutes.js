import express from "express";
import axios from 'axios';
import "dotenv/config";

const router = express.Router();
const { PORT} = process.env;