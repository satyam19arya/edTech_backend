const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./dbConnect');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const fileupload = require('express-fileupload');

const userRoutes = require('./routes/User');
const profileRoutes = require('./routes/Profile');
const courseRoutes = require('./routes/Course');
const paymentRoutes = require('./routes/Payments');
const contactRoute = require('./routes/Contact');

dotenv.config();
const app = express();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
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

app.use("/api/auth", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/contact", contactRoute);

app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});