import axios from 'axios';
import { logger } from './winston';
const CF_CAPTCHA_SECRET_KEY = process.env.CF_CAPTCHA_SECRET_KEY || '';

export const verifyCloudFlareCaptcha = async (captchaRes: string): Promise<boolean> => {
  try {
    if (!captchaRes) return false;
    const formData = new URLSearchParams();
    formData.append('secret', CF_CAPTCHA_SECRET_KEY);
    formData.append('response', captchaRes);
    const res = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', formData);
    return res.data.success;
  } catch (error) {
    logger.error('Error verifying captcha:', error);
    return false;
  }
};
