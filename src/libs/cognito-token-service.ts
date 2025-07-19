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

    return { sub: '', email: '', 'cognito:groups': [] };
  } catch (error) {
    console.error('Error in extractJWTDataWithoutVerification:', error);
    return { sub: '', email: '', 'cognito:groups': [] };
  }
};

const getUserIdFromTokenWithoutVerification = (token: string): { userId: string; email: string; groups: string[] } => {
  try {
    const decodedToken = extractJWTDataWithoutVerification(token);

    if (!decodedToken?.sub) {
      return { userId: '', email: '', groups: [] };
    }

    return { userId: decodedToken.sub, email: decodedToken.email, groups: decodedToken['cognito:groups'] };
  } catch (error) {
    console.error('Error in getUserIdFromTokenWithoutVerification:', error);
    return { userId: '', email: '', groups: [] };
  }
};

export { getUserIdFromTokenWithoutVerification };
