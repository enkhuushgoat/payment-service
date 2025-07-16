import { createRecord, deleteRecord, getRecordByKey, queryRecords, updateRecord } from '@/dynamo';
import { Invoice } from '@/types/invoice';
import { UpdateCommandInput } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = 'invoice';

async function createActiveInvoice(
  userId: string,
  packageType: string,
  invoiceId: string,
  createdAt: number,
  expiresAt: number
): Promise<Invoice | undefined> {
  const pkValue = `${userId}#${packageType}`;
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: pkValue,
      SK: 'active',
    },
    UpdateExpression:
      'SET invoiceId = :invoiceId, createdAt = :createdAt, expiresAt = :expiresAt, userId = :userId, packageType = :packageType',
    ConditionExpression: 'attribute_not_exists(PK)',
    ExpressionAttributeValues: {
      ':invoiceId': invoiceId,
      ':createdAt': createdAt,
      ':expiresAt': expiresAt,
      ':userId': userId,
      ':packageType': packageType,
    },
  };
  console.log(`createActiveInvoice: ${JSON.stringify(params)}`);
  return await updateRecord<Invoice>(params);
}

async function updateActiveWithQpay(userId: string, packageType: string, qpayData: any): Promise<Invoice | undefined> {
  const pkValue = `${userId}#${packageType}`;
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: pkValue,
      SK: 'active',
    },
    UpdateExpression: 'SET qpayData = :qpayData',
    ConditionExpression: 'attribute_exists(PK)',
    ExpressionAttributeValues: {
      ':qpayData': qpayData,
    },
  };

  return await updateRecord<Invoice>(params);
}

async function getActiveForPackage(userId: string, packageType: string): Promise<Invoice | undefined> {
  const pkValue = `${userId}#${packageType}`;
  const params = {
    TableName: TABLE_NAME,
    Key: { PK: pkValue, SK: 'active' },
  };
  return await getRecordByKey<Invoice>(params);
}

async function createHistory(history: any): Promise<Invoice | undefined> {
  const params = {
    TableName: TABLE_NAME,
    Item: history,
  };

  return await createRecord<Invoice>(params);
}

async function getInvoice(id: string): Promise<Invoice | undefined> {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'invoiceId-index',
    KeyConditionExpression: 'invoiceId = :invoiceId',
    ExpressionAttributeValues: {
      ':invoiceId': id,
    },
  };
  const result = await queryRecords<Invoice>(params);
  console.log('result', result);
  return result.items?.[0] as Invoice | undefined;
}

async function updateInvoice(id: string): Promise<Invoice | undefined> {
  const now = Date.now();

  const params: UpdateCommandInput = {
    TableName: TABLE_NAME,
    Key: { PK: id, SK: 'history' },
    UpdateExpression: 'SET #status = :main_status, #updatedAt = :updatedAt',
    ConditionExpression: 'attribute_exists(PK) and #status = :currentStatus',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#updatedAt': 'updatedAt',
    },
    ExpressionAttributeValues: {
      ':main_status': 'done',
      ':currentStatus': 'pending',
      ':updatedAt': now,
    },
  };
  return await updateRecord<Invoice>(params);
}

async function deleteActive(userId: string, packageType: string): Promise<void> {
  const pkValue = `${userId}#${packageType}`;
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: pkValue,
      SK: 'active',
    },
  };

  await deleteRecord(params);
}

export {
  getInvoice,
  updateInvoice,
  createActiveInvoice,
  updateActiveWithQpay,
  createHistory,
  getActiveForPackage,
  deleteActive,
};
