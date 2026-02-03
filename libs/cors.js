import Cors from 'cors';
import initMiddleware from './init-middleware';

const allowedOrigins = [
  'http://168.231.66.225:3010',
  'https://ojutu.co',
  'https://www.ojutu.co',
  'http://localhost:3000',
  'http://localhost:3001',
];

const cors = initMiddleware(
  Cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

export default cors;
