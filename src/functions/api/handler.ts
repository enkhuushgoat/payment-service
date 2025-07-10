import type { CustomAPIGatewayEvent as ApiFunc } from '@/libs/api-gateway';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';
import { formatApiResponse, middyfy } from '@/libs';
import { extractMetadata } from '@/libs/auth';
import { CustomError, handleApiFuncError } from '@/error';
import { InvoiceService } from '@/services';

const invoiceService = new InvoiceService();

const createInvoiceFunc: ApiFunc<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const { body, userId } = extractMetadata(event);

    if (!userId || !body) {
      throw new CustomError('Unauthorized: Admin access required', 403);
    }

    const invoice = await invoiceService.createInvoice(userId, body.packageId);
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

export const createInvoice = middyfy(createInvoiceFunc);
export const verifyInvoice = middyfy(verifyInvoiceFunc);
