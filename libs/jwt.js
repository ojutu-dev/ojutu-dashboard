import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

export const generateToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn: '10m' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
