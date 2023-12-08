const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./dbConnect');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const Razorpay = require('razorpay');
const fileupload = require('express-fileupload');
dotenv.config('./.env');
const app = express();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
});

app.use(express.json({ limit: "5mb" }));
app.use(morgan('common'));
app.use(cookieParser());
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));
let origin = 'http://localhost:3000';
if(process.env.NODE_ENV === 'production') {
    origin = process.env.CORS_ORIGIN;
}
app.use(cors({
    credentials: true,
    origin
}));

const PORT = process.env.PORT;
dbConnect();

app.get('/', (req, res) => {
    res.send('Hello from server 😎');
});

app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});