import { logger } from '@/libs';
import axios, { AxiosError } from 'axios';

const QPAY_V2_URL = process.env.QPAY_V2_URL || '';
const QPAY_USERNAME = process.env.QPAY_USERNAME || '';
const QPAY_PASSWORD = process.env.QPAY_PASSWORD || '';
const QPAY_INVOICE_CODE = process.env.QPAY_INVOICE_CODE || '';
const BASE_URL = process.env.BASE_URL || '';

type PaymentProviderAuthObj = {
  accessToken: string;
  createdAt: number;
};

type QpayInvoiceVerificationResult = {
  count: number;
  paid_amount?: number;
  rows: any[];
};

type QpayInvoiceResponse = {
  invoice_id: string;
  amount: number;
  qr_text: string;
  qr_image: string;
  urls: [
    {
      name: string;
      description: string;
      logo: string;
      link: string;
    },
  ];
};

export class PaymentProviderQpay {
  authObj: PaymentProviderAuthObj | null = null;
  async auth(): Promise<any | null> {
    try {
      const URL = `${QPAY_V2_URL}/v2/auth/token`;
      const auth = { username: QPAY_USERNAME, password: QPAY_PASSWORD };
      const response = await axios.post(URL, { withCredentials: true }, { auth });
      this.authObj = {
        accessToken: response.data.access_token,
        createdAt: Math.floor(Date.now() / 1000), // Store the current timestamp in seconds
      };
      return this.authObj;
    } catch (error) {
      console.log(`error ${error instanceof AxiosError ? JSON.stringify(error.response?.data) : error}`);
      console.log(`error ${error instanceof AxiosError ? JSON.stringify(error.response) : error}`);
      logger.error(`Error authenticating with Qpay:`, error);
      throw error;
    }
  }

  async getToken(): Promise<any | null> {
    try {
      if (this.authObj && Math.floor(Date.now() / 1000) - this.authObj.createdAt < 3600) {
        // If the token is still valid (less than 1 hour old), return it
        return this.authObj.accessToken;
      } else {
        // If the token is expired or not set, re-authenticate
        return (await this.auth()).accessToken;
      }
    } catch (error) {
      logger.error(`Error getting token from Qpay:`, error);
      throw error;
    }
  }

  async createInvoice(invoiceNo: string, amount: number, description: string): Promise<QpayInvoiceResponse | null> {
    try {
      const URL = `${QPAY_V2_URL}/v2/invoice`;
      const CALLBACK_URL = this.generateCallbackUrl(invoiceNo);
      const body = {
        invoice_code: QPAY_INVOICE_CODE,
        sender_invoice_no: invoiceNo,
        invoice_receiver_code: 'terminal',
        invoice_description: description,
        invoice_due_date: null,
        amount,
        callback_url: CALLBACK_URL,
      };
      const token = await this.getToken();
      console.log('token', token);
      const response = await axios.post(URL, body, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      console.log('response', response.data);
      const invoiceData = response.data as QpayInvoiceResponse;
      if (!invoiceData || !invoiceData.invoice_id) {
        logger.error(`Invalid response from Qpay:`, invoiceData);
        throw new Error(`Invalid response from Qpay`);
      }
      return invoiceData;
    } catch (error) {
      console.log(`error ${error instanceof AxiosError ? JSON.stringify(error.response?.data) : error}`);
      console.log(`error ${error instanceof AxiosError ? JSON.stringify(error.response) : error}`);
      logger.error(`Error creating Qpay invoice:`, error);
      return null;
    }
  }

  async verifyInvoice(providerInvoiceNo: string): Promise<QpayInvoiceVerificationResult | null> {
    try {
      const URL = `${QPAY_V2_URL}/payment/check`;
      const body = {
        object_type: 'INVOICE',
        object_id: providerInvoiceNo,
        offset: {
          page_number: 1,
          page_limit: 100,
        },
      };
      const token = await this.getToken();
      const response = await axios.post(URL, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('response', response.data);
      const paymentData = response.data as QpayInvoiceVerificationResult;
      return paymentData;
      // const isPaid = paymentData.count === 1 && paymentData.paid_amount && paymentData.paid_amount > 0 ? true : false;
      // return isPaid;
    } catch (error) {
      console.log(`error ${error instanceof AxiosError ? JSON.stringify(error.response?.data) : error}`);
      logger.error(`Error verifying Qpay invoice:`, error);
      return null;
    }
  }

  async isPaid(providerInivoiceNo: string): Promise<boolean> {
    const result = await this.verifyInvoice(providerInivoiceNo);
    if (!result) {
      return false;
    }
    const isPaid = result.count === 1 && result.paid_amount && result.paid_amount > 0 ? true : false;
    return isPaid;
  }

  generateCallbackUrl = (invoiceNo: string, baseUrl: string = BASE_URL): string => {
    return `${baseUrl}/v1/payments/verify-invoice?invoiceNo=${invoiceNo}`;
  };
}
