export type Invoice = {
  id: string;
  userId: string;
  packageId: string;
  invoiceNo: string;
  amount: number;
  status: string;
  createdAt: number;
  updatedAt: number;
  qpayData: any;
};
