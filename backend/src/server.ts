import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { authMiddleware } from './middleware/auth.middleware';
import deckRouter from './routes/decks.route';
import userRouter from './routes/user.route';
import questionRouter from './routes/question.route';
import flashcardRouter from './routes/flashcard.route';
import reviewRouter from './routes/review.route';

const PORT = env.port;

const app = express();
app.use(helmet());
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
	})
);
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ ok: true }));
const apiV1 = express.Router();

// Routes without auth (for user creation during sign-in)
apiV1.use('/user', userRouter);

// Apply auth middleware to protected routes
apiV1.use('/deck', authMiddleware, deckRouter);
apiV1.use('/question', authMiddleware, questionRouter);
apiV1.use('/flashcard', authMiddleware, flashcardRouter);
apiV1.use('/review', authMiddleware, reviewRouter);

app.use('/api/v1', apiV1);

app.listen(PORT, () => {
	console.log(`🌐 Web server listening on http://localhost:${PORT}`);
});
