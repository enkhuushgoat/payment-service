import { z } from 'zod';

export const SubscriptionTierEnum = z.enum(['S', 'M', 'L', 'XL']);
export type SubscriptionTier = z.infer<typeof SubscriptionTierEnum>;

export const ContentPackageEnum = z.enum(['none', 'swing', 'day', 'scalp', 'all']);
export type ContentPackage = z.infer<typeof ContentPackageEnum>;

export const SubscriptionStatusEnum = z.enum(['active', 'expired', 'cancelled', 'pending', 'suspended']);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;

export const ActiveSubscriptionSchema = z.object({
  userId: z.string().uuid(),
  subscriptionId: z.string().uuid(),

  currentTier: SubscriptionTierEnum,
  currentPackage: ContentPackageEnum.optional(),
  subscriptionStatus: SubscriptionStatusEnum,

  paymentId: z.string().uuid(),
  paymentProvider: z.string(),

  startedAt: z.number().int(),
  expiresAt: z.number().int(),
  startedAtIso: z.string().datetime(),
  expiresAtIso: z.string().datetime(),

  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const HistorySubscriptionSchema = z.object({
  userId: z.string().uuid(),
  subscriptionId: z.string().uuid(),

  currentTier: SubscriptionTierEnum,
  currentPackage: ContentPackageEnum.optional(),
  subscriptionStatus: SubscriptionStatusEnum,

  paymentId: z.string().uuid(),
  paymentProvider: z.string(),

  startedAt: z.number().int(),
  expiresAt: z.number().int(),
  startedAtIso: z.string().datetime(),
  expiresAtIso: z.string().datetime(),

  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export type ActiveSubscription = z.infer<typeof ActiveSubscriptionSchema>;
export type HistorySubscription = z.infer<typeof HistorySubscriptionSchema>;
