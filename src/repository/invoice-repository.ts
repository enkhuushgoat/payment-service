import { createRecord, getRecordByKey } from '@/dynamo';
import { Invoice } from '@/types/invoice';

const TABLE_NAME = 'invoice';

async function createInvoice(event: Invoice): Promise<Invoice> {
  return await createRecord<Invoice>({
    TableName: TABLE_NAME,
    Item: event,
  });
}

async function getInvoice(id: string): Promise<Invoice | undefined> {
  return await getRecordByKey<Invoice>({
    TableName: TABLE_NAME,
    Key: { id },
  });
}

export { createInvoice, getInvoice };
