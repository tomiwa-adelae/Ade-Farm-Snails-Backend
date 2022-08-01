import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoute from './routes/productRoute.js';
import userRoute from './routes/userRoute.js';
import orderRoute from './routes/orderRoute.js';
import uploadRoute from './routes/uploadRoute.js';
import passwordResetRoute from './routes/passwordResetRoute.js';

dotenv.config();

const app = express();

app.use(cors());

// Express body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// DB Connect
const db = process.env.MONGO_URI;

mongoose
   .connect(db)
   .then(() => console.log('Mongo DB Connected...'))
   .catch(() => console.log('An error occured...'));

// API Routes
app.get('/', (req, res) => {
   res.send('APP IS RUNNING');
});
app.use('/api/products', productRoute);
app.use('/api/users', userRoute);
app.use('/api/orders', orderRoute);
app.use('/api/uploads', uploadRoute);
app.use('/api/password-reset', passwordResetRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
