import Cors from 'cors';

const cors = Cors({
  origin: '*', // or whitelist: ['https://yourdomain.com']
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

export default cors;
