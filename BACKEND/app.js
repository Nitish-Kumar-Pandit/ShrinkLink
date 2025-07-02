import express from 'express';
const app = express();
import { nanoid } from 'nanoid';
import dotenv from "dotenv"; 
import short_url from './src/routes/short_url.route.js';
import UrlSchema from './src/models/shorturl.model.js';
import connectDB from './src/config/mongo.config.js';
import auth_routes from './src/routes/auth.route.js';
import { redirectFromShortUrl } from './src/controller/short_url.controller.js';
dotenv.config("./.env"); 
import cors from 'cors';
import { attachUser } from './src/utils/attachUser.js';
import cookieParser from 'cookie-parser';
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use(cookieParser());
app.use(attachUser);
 
// Test route
app.get("/", (req, res) => {
    res.json({ message: "Server is working!" });
});

app.use("/api/auth", auth_routes)
app.use("/api/create", short_url)

app.get("/:id", redirectFromShortUrl);

app.listen(3000, () =>{
    connectDB();
    console.log("Connected to MongoDB");
    console.log('Server is running on http://localhost:3000');
})

// get route will redirect 
// post route will create short url