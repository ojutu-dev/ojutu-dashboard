import initMiddleware from './init-middleware';
import cors from './cors';

const corsMiddleware = initMiddleware(cors);

export default function withCors(handler) {
  return async (req, res) => {
    await corsMiddleware(req, res);
    return handler(req, res);
  };
}
