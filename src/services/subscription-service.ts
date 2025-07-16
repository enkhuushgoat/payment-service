import { CustomError } from '@/error';
import { logger } from '@/libs';
import {
  getSubscriptionByUserId,
  createActiveSubscription,
  createHistorySubscription,
} from '@/repository/subscription-repository';
import { Invoice } from '@/types/invoice';
import { ActiveSubscription, SubscriptionStatusEnum, SubscriptionTierEnum } from '@/types/subcription.types';
import { v4 as uuidv4 } from 'uuid';

async function createSubscriptionService(userId: string, invoice: Invoice): Promise<ActiveSubscription> {
  try {
    const currentSubscription = await getSubscriptionByUserId(userId);

    if (currentSubscription) {
      return currentSubscription;
    }

    const now = Date.now();
    const subscriptionId = uuidv4();

    const subscription = {
      subscriptionId,
      userId: invoice.userId,
      currentTier: SubscriptionTierEnum.parse(invoice.packageType),
      subscriptionStatus: SubscriptionStatusEnum.parse('active'),

      startedAt: now,
      expiresAt: Math.floor(now / 1000) + 60 * 60 * 24 * 30,
      startedAtIso: new Date(now).toISOString(),
      expiresAtIso: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
      updatedAt: now,

      paymentId: invoice.id,
      paymentProvider: 'qpay',
    };

    await createActiveSubscription(subscription);
    await createHistorySubscription(subscription);
    return subscription;
  } catch (error) {
    logger.error(`${error instanceof Error ? error.stack : 'Unknown error'}`);
    logger.error(`${error instanceof Error ? error.message : 'Unknown error'}`);

    throw new CustomError('Failed to create subscription', 500);
  }
}

export { createSubscriptionService };
