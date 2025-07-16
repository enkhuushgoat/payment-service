export type Invoice = {
  id: string;
  userId: string;
  packageType: string;
  amount: number;
  status: string;
  createdAt: number;
  updatedAt: number;
  qpayData?: QpayInvoiceResponse;
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
