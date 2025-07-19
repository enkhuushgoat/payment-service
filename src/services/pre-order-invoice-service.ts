import { PaymentProviderQpay } from './provider';
import { v4 as uuidv4 } from 'uuid';
import {
  createActiveInvoicePreOrder,
  createHistory,
  deleteActive,
  getActiveForPackage,
  getInvoice,
  updateActiveWithQpay,
  updateInvoice,
} from '@/repository/invoice-repository';
import { CustomError } from '@/error';
import { createPreOrder, updateIsPaid } from '@/repository/pre-order-repository';
import { ActiveInvoice, HistoryInvoice } from '@/types/invoice';
import { PreOrder } from '@/types/pre-order.types';

const qpayProvider = new PaymentProviderQpay();
const PRE_ORDER_AMOUNT = 108000;
const PRE_ORDER_PACKAGE_TYPE = 'S';

export class PreOrderInvoiceService {
  async createPreOrderInvoiceWithoutQpay(
    email: string,
    firstName: string,
    lastName: string,
    phone: string
  ): Promise<{ amount: number; packageType: string; isPreOrder: boolean }> {
    try {
      console.log(`create Pre Order Invoice: ${email}, ${firstName}, ${lastName}, ${phone}`);

      const now = Date.now();
      const packageType = PRE_ORDER_PACKAGE_TYPE;

      const preOrder: PreOrder = {
        PK: `${email}`,
        email,
        firstName,
        lastName,
        phone,
        packageType,
        isQpay: false,
        isPaid: false,
        createdAt: now,
      };

      try {
        await createPreOrder(preOrder);
      } catch (error: any) {
        console.log(`${error instanceof Error ? error.name : 'Unknown error'}`);
        console.log(`${error instanceof Error ? error.stack : 'Unknown error'}`);
        return { amount: PRE_ORDER_AMOUNT, packageType: PRE_ORDER_PACKAGE_TYPE, isPreOrder: true };
      }

      return { amount: PRE_ORDER_AMOUNT, packageType: PRE_ORDER_PACKAGE_TYPE, isPreOrder: true };
    } catch (error: any) {
      console.log(`${error instanceof Error ? error.name : 'Unknown error'}`);
      console.log(`${error instanceof Error ? error.stack : 'Unknown error'}`);
      return { amount: PRE_ORDER_AMOUNT, packageType: PRE_ORDER_PACKAGE_TYPE, isPreOrder: true };
    }
  }

  async createPreOrderInvoice(
    email: string,
    firstName: string,
    lastName: string,
    phone: string
  ): Promise<ActiveInvoice> {
    console.log(`create Pre Order Invoice: ${email}, ${firstName}, ${lastName}, ${phone}`);

    const invoiceId = uuidv4();
    const now = Date.now();
    const expiresAt = Math.floor(now / 1000) + 900; // active invoice expires in 15 minutes by dynamo db ttl
    const packageType = PRE_ORDER_PACKAGE_TYPE;
    const initialStatus = 'pending';
    const isPreOrder = true;

    const baseInvoice = {
      createdAt: now,
      updatedAt: now,
      email,
      packageType,
      amount: PRE_ORDER_AMOUNT,
      status: initialStatus,
      isPreOrder,
    };

    let activeInvoice: ActiveInvoice = {
      PK: `${email}#${packageType}`,
      SK: 'active',
      invoiceId,
      expiresAt,
      ...baseInvoice,
    };

    try {
      await createActiveInvoicePreOrder(activeInvoice);
    } catch (error: any) {
      console.log(`${error instanceof Error ? error.name : 'Unknown error'}`);
      console.log(`${error instanceof Error ? error.stack : 'Unknown error'}`);
      if (error.name !== 'ConditionalCheckFailedException') {
        throw error;
      }
      const activeInvoice = await getActiveForPackage(email, packageType);
      if (!activeInvoice) {
        throw new CustomError('Failed to get active invoice for pre order');
      }
      return activeInvoice;
    }

    const qpayInvoice = await qpayProvider.createInvoice(invoiceId, PRE_ORDER_AMOUNT, `Pre order ${invoiceId}`);

    if (!qpayInvoice) {
      throw new CustomError('Failed to create qpay invoice for pre order');
    }
    activeInvoice.qpayData = qpayInvoice;

    // Update active with Qpay data
    await updateActiveWithQpay(email, packageType, qpayInvoice);

    const historyInvoice: HistoryInvoice = {
      PK: invoiceId,
      SK: 'history',
      qpayData: qpayInvoice,
      ...baseInvoice,
    };

    await createHistory(historyInvoice);
    try {
      const preOrder: PreOrder = {
        PK: `${email}`,
        email,
        firstName,
        lastName,
        phone,
        packageType,
        isQpay: true,
        isPaid: false,
        createdAt: now,
      };

      const preOrderResult = await createPreOrder(preOrder);
      console.log(`preOrder: ${JSON.stringify(preOrderResult)}`);
    } catch (error: any) {
      console.log(`${error instanceof Error ? error.name : 'Unknown error'}`);
      console.log(`${error instanceof Error ? error.stack : 'Unknown error'}`);
    }

    return activeInvoice;
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

    await deleteActive(invoice.email, invoice.packageType);
    await updateIsPaid(invoice.email, true);

    return true;
    // return isPaid;
  }
}
