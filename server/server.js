import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';


const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins = [
    'http://localhost:5173',
];

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin or allowed origins or any vercel subdomain
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// API Endpoints
app.get('/',(req,res)=>{ 
    res.send("API Working")
})
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.listen(port,()=>{
    console.log(`Server is running on PORT: ${port}`)
})