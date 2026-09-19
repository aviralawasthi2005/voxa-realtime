import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'voxa_super_secret_jwt_key_2026_modern_editorial', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'voxa_super_secret_jwt_key_2026_modern_editorial');
};
