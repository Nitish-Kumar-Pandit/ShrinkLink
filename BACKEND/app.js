import express from 'express';
const app = express();
import { nanoid } from 'nanoid';
import dotenv from "dotenv"; 
import short_url from './src/routes/short_url.route.js';
import UrlSchema from './src/models/shorturl.model.js';
import connectDB from './src/config/mongo.config.js';
import { redirectFromShortUrl } from './src/controller/short_url.controller.js';
dotenv.config("./.env"); 
import cors from 'cors';
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.use("/api/create", short_url)

app.get("/:id", redirectFromShortUrl);

app.listen(3000, () =>{
    connectDB();
    console.log("Connected to MongoDB");
    console.log('Server is running on http://localhost:3000');
})

// get route will redirect 
// post route will create short url