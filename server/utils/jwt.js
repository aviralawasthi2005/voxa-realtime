import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'voxa_super_secret_jwt_key_2026_modern_editorial';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const generate2FAToken = (userId) => {
  return jwt.sign({ id: userId, is2FA: true }, JWT_SECRET, {
    expiresIn: '10m',
  });
};

export const verify2FAToken = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (!decoded.is2FA) {
    throw new Error('Invalid two-factor session token.');
  }
  return decoded;
};
