import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;