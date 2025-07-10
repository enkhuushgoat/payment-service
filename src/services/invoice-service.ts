import { PaymentProviderQpay } from './provider';
import { v4 as uuidv4 } from 'uuid';
import { createInvoice, getInvoice } from '@/repository/invoice-repository';

const qpayProvider = new PaymentProviderQpay();

export class InvoiceService {
  async createInvoice(userId: string, packageId: string) {
    console.log('createInvoice', userId, packageId);
    const invoiceNo = uuidv4();
    // const now = Date.now();

    const invoice = await qpayProvider.createInvoice(invoiceNo, 100, `Test Invoice ${invoiceNo}`);
    // await createInvoice({
    //   id: invoiceNo,
    //   userId,
    //   packageId,
    //   invoiceNo,
    //   amount: 1000,
    //   status: 'pending',
    //   createdAt: now,
    //   updatedAt: now,
    //   qpayData: invoice,
    // });
    return invoice;
  }

  async verifyInvoice(invoiceNo: string): Promise<boolean> {
    // const invoice = await getInvoice(invoiceNo);
    // if (!invoice) {
    //   throw new Error('Invoice not found');
    // }

    const isPaid = await qpayProvider.isPaid(invoiceNo);
    if (!isPaid) {
      return false;
    }

    return isPaid;
  }
}
