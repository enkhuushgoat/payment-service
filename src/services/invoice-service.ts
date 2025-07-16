import { PaymentProviderQpay } from './provider';
import { v4 as uuidv4 } from 'uuid';
import {
  createActiveInvoice,
  createHistory,
  deleteActive,
  getActiveForPackage,
  getInvoice,
  updateActiveWithQpay,
  updateInvoice,
} from '@/repository/invoice-repository';
import { CustomError } from '@/error';
import { createSubscriptionService } from './subscription-service';

const qpayProvider = new PaymentProviderQpay();

export class InvoiceService {
  async createInvoice(userId: string, packageType: string) {
    console.log('createInvoice', userId, packageType);
    const invoiceId = uuidv4();
    const now = Date.now();
    const expiresAt = Math.floor(now / 1000) + 900;

    try {
      await createActiveInvoice(userId, packageType, invoiceId, now, expiresAt);
    } catch (error: any) {
      console.log(`${error instanceof Error ? error.name : 'Unknown error'}`);
      console.log(`${error instanceof Error ? error.stack : 'Unknown error'}`);
      if (error.name !== 'ConditionalCheckFailedException') {
        throw error;
      }
      return await getActiveForPackage(userId, packageType);
    }

    const qpayInvoice = await qpayProvider.createInvoice(invoiceId, 100, `Test Invoice ${invoiceId}`);

    if (!qpayInvoice) {
      throw new CustomError('Failed to create invoice');
    }
    // Update active with Qpay data
    await updateActiveWithQpay(userId, packageType, qpayInvoice);

    const historyInvoice = {
      PK: invoiceId,
      SK: 'history',
      userId,
      packageType,
      amount: 1000,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      qpayData: qpayInvoice,
    };

    await createHistory(historyInvoice);
    return historyInvoice;
  }

  async verifyInvoice(invoiceId: string): Promise<boolean> {
    const invoice = await getInvoice(invoiceId);
    if (!invoice) {
      throw new CustomError('Invoice not found');
    }

    // const isPaid = await qpayProvider.isPaid(invoice.qpayData?.invoice_id || '');
    // if (!isPaid) {
    //   return false;
    // }

    try {
      await updateInvoice(invoiceId);
    } catch (error: any) {
      console.log(`${error instanceof Error ? error.name : 'Unknown error'}`);
      console.log(`${error instanceof Error ? error.stack : 'Unknown error'}`);
      throw new CustomError('Failed to update invoice', 500);
    }

    await createSubscriptionService(invoice.userId, invoice);
    await deleteActive(invoice.userId, invoice.packageType);

    return true;
    // return isPaid;
  }
}
