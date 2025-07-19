export type Invoice = {
  id: string;
  email: string;
  userId: string;
  packageType: string;
  amount: number;
  status: string;
  createdAt: number;
  updatedAt: number;
  qpayData?: QpayInvoiceResponse;
};

export type HistoryInvoice = {
  PK: string;
  SK: string;
  userId?: string;
  email?: string;
  packageType: string;
  amount: number;
  status: string;
  createdAt: number;
  updatedAt: number;
  qpayData: QpayInvoiceResponse;
  isPreOrder?: boolean;
};

export type ActiveInvoice = {
  PK: string;
  SK: string;
  invoiceId: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  email: string;
  packageType: string;
  amount: number;
  status: string;
  isPreOrder: boolean;
  qpayData?: any;
};

export type QpayInvoiceResponse = {
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
