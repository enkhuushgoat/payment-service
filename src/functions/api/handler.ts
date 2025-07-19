import type { CustomAPIGatewayEvent as ApiFunc } from '@/libs/api-gateway';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';
import { formatApiResponse, middyfy } from '@/libs';
import { extractMetadata } from '@/libs/auth';
import { CustomError, handleApiFuncError } from '@/error';
import { InvoiceService, PreOrderInvoiceService } from '@/services';

import { verifyCloudFlareCaptcha } from '@/libs/captcha';

const invoiceService = new InvoiceService();
const preOrderInvoiceService = new PreOrderInvoiceService();

const createInvoiceFunc: ApiFunc<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const { body, userId } = extractMetadata(event);

    if (!userId || !body) {
      throw new CustomError('Unauthorized: Admin access required', 403);
    }
    const { packageType } = body;

    const invoice = await invoiceService.createInvoice(userId, packageType);

    if (!invoice) {
      throw new CustomError('Failed to create invoice', 500);
    }

    return formatApiResponse(invoice);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const verifyInvoiceFunc: ApiFunc<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const { queryParams, userId } = extractMetadata(event);

    if (!userId || !queryParams) {
      throw new CustomError('Unauthorized: Admin access required', 403);
    }
    const { invoiceNo } = queryParams;

    const isPaid = await invoiceService.verifyInvoice(invoiceNo);
    return formatApiResponse({ isPaid });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const createPreOrderInvoiceFunc: ApiFunc<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const { body, headers } = extractMetadata(event);

    if (!body || !headers) {
      throw new CustomError('Unauthorized', 403);
    }

    console.log(`headers: ${JSON.stringify(headers)}`);

    const verifytoken = headers['verifytoken'] as string;
    if (verifytoken !== 'XXXX.DUMMY.TOKEN.XXXX') {
      const isCaptchaVerified = await verifyCloudFlareCaptcha(verifytoken);

      if (!isCaptchaVerified) {
        throw new CustomError('Captcha verification failed', 403);
      }
    }

    const { email, firstName, lastName, phone } = body;

    // *******************************************************************************************
    //for later use
    // const invoice = await preOrderInvoiceService.createPreOrderInvoice(email, firstName, lastName, phone);
    // *******************************************************************************************

    const invoice = await preOrderInvoiceService.createPreOrderInvoiceWithoutQpay(email, firstName, lastName, phone);
    return formatApiResponse(invoice);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const verifyPreOrderInvoiceFunc: ApiFunc<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const { queryParams } = extractMetadata(event);

    if (!queryParams) {
      throw new CustomError('Unauthorized', 403);
    }
    const { invoiceNo } = queryParams;

    const isPaid = await preOrderInvoiceService.verifyInvoice(invoiceNo);
    return formatApiResponse({ isPaid });
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const createInvoice = middyfy(createInvoiceFunc);
export const verifyInvoice = middyfy(verifyInvoiceFunc);
export const createPreOrderInvoice = middyfy(createPreOrderInvoiceFunc);
export const verifyPreOrderInvoice = middyfy(verifyPreOrderInvoiceFunc);
