import { updateRecord } from '@/dynamo';
import { PreOrder } from '@/types/pre-order.types';

const TABLE_NAME = 'pre-order';

async function createPreOrder(preOrder: PreOrder): Promise<PreOrder | undefined> {
  const pkValue = `${preOrder.email}`;
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: pkValue,
    },
    UpdateExpression:
      'SET firstName = :firstName, lastName = :lastName, phone = :phone, packageType = :packageType, createdAt = :createdAt, isQpay = :isQpay, isPaid = :isPaid',
    ConditionExpression: 'attribute_not_exists(PK)',
    ExpressionAttributeValues: {
      ':firstName': preOrder.firstName,
      ':lastName': preOrder.lastName,
      ':phone': preOrder.phone,
      ':packageType': preOrder.packageType,
      ':createdAt': preOrder.createdAt,
      ':isQpay': preOrder.isQpay,
      ':isPaid': preOrder.isPaid,
    },
  };
  console.log(`createPreOrder: ${JSON.stringify(params)}`);
  return await updateRecord<PreOrder>(params);
}

async function updateIsPaid(email: string, isPaid: boolean): Promise<PreOrder | undefined> {
  const pkValue = `${email}`;
  const params = {
    TableName: TABLE_NAME,
    Key: { PK: pkValue },
    UpdateExpression: 'SET isPaid = :isPaid',
    ExpressionAttributeValues: {
      ':isPaid': isPaid,
    },
  };
  console.log(`updateIsPaid: ${JSON.stringify(params)}`);
  return await updateRecord<PreOrder>(params);
}

export { createPreOrder, updateIsPaid };
