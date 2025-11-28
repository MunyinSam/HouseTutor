import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import * as z from 'zod';
import { env } from './config/env';
import topicRouter from './routes/topic.route';
import questionRouter from './routes/question.route';

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

apiV1.use('/topic', topicRouter);
apiV1.use('/question', questionRouter);

app.use('/api/v1', apiV1);

app.listen(PORT, () => {
	console.log(`🌐 Web server listening on http://localhost:${PORT}`);
});
