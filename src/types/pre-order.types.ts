import { z } from 'zod';

const PreOrderSchema = z.object({
  PK: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  packageType: z.string(),
  isQpay: z.boolean(),
  isPaid: z.boolean(),
  createdAt: z.number(),
});

export type PreOrder = z.infer<typeof PreOrderSchema>;
