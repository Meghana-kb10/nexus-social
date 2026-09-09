import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generate a signed JWT token containing the user's ID and username.
 * Uses process.env.JWT_SECRET with a 7-day expiration.
 */
export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }

  const tokenPayload = {
    id: payload.id || payload._id,
    username: payload.username
  };

  return jwt.sign(tokenPayload, secret, {
    expiresIn: '7d'
  });
};
