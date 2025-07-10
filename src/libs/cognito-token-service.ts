import * as jwt from 'jsonwebtoken';

interface JWTPayload {
  sub: string;
  email: string;
  'cognito:groups': string[];
  [key: string]: unknown;
}

const extractJWTDataWithoutVerification = (token: string): JWTPayload => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (decoded) return decoded.payload as JWTPayload;

    throw new Error('Invalid token');
  } catch (error) {
    console.error('Error in extractJWTDataWithoutVerification:', error);
    throw error;
  }
};

const getUserIdFromTokenWithoutVerification = (token: string): { userId: string; email: string; groups: string[] } => {
  try {
    const decodedToken = extractJWTDataWithoutVerification(token);

    if (!decodedToken?.sub) {
      throw new Error('No sub claim in token');
    }

    return { userId: decodedToken.sub, email: decodedToken.email, groups: decodedToken['cognito:groups'] };
  } catch (error) {
    console.error('Error in getUserIdFromTokenWithoutVerification:', error);
    throw error;
  }
};

export { getUserIdFromTokenWithoutVerification };
