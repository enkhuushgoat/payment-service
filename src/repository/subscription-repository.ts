import { createRecord, getRecordByKey } from '@/dynamo';
import { ActiveSubscription, HistorySubscription } from '@/types/subcription.types';

const TABLE_NAME = process.env.SUBSCRIPTION_TABLE_NAME || 'subscription';
const HISTORY_TABLE_NAME = process.env.SUBSCRIPTION_HISTORY_TABLE_NAME || 'subscription-history';

export async function getSubscriptionByUserId(userId: string): Promise<ActiveSubscription | undefined> {
  return await getRecordByKey<ActiveSubscription>({
    TableName: TABLE_NAME,
    Key: { userId },
  });
}

export async function createActiveSubscription(subscription: ActiveSubscription): Promise<ActiveSubscription> {
  return await createRecord<ActiveSubscription>({
    TableName: TABLE_NAME,
    Item: subscription,
  });
}

export async function createHistorySubscription(subscription: HistorySubscription): Promise<HistorySubscription> {
  return await createRecord<HistorySubscription>({
    TableName: HISTORY_TABLE_NAME,
    Item: subscription,
  });
}
