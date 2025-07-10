import type { CustomQueryCommandOutput } from './types/command.types';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  GetCommand,
  UpdateCommand,
  PutCommand,
  QueryCommand,
  GetCommandInput,
  QueryCommandInput,
  PutCommandInput,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { logger } from '@/libs';
import { CustomError } from '@/error';

// Initialize DynamoDB client
const dynamoDb = new DynamoDBClient({ region: 'ap-southeast-1', profile: 'goat' });
const docClient = DynamoDBDocumentClient.from(dynamoDb);

export async function getRecordByKey<T>(input: GetCommandInput): Promise<T | undefined> {
  try {
    const result = await docClient.send(new GetCommand(input));
    return result.Item ? (result.Item as T) : undefined;
  } catch (error: unknown) {
    logger.error(`Error retrieving record from table "${input.TableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while retrieving record.');
  }
}

export async function queryRecords<T>(input: QueryCommandInput): Promise<CustomQueryCommandOutput<T>> {
  try {
    const result = await docClient.send(new QueryCommand(input));
    return {
      lastEvaluatedKey: result.LastEvaluatedKey ? result.LastEvaluatedKey : {},
      items: result.Items ? (result.Items as T[]) : [],
    };
  } catch (error: unknown) {
    logger.error(`Error querying records from table "${input.TableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while querying records.');
  }
}

export async function createRecord<T>(input: PutCommandInput): Promise<T> {
  try {
    await docClient.send(new PutCommand(input));
    return input.Item as T;
  } catch (error: unknown) {
    logger.error(`Error creating record in table "${input.TableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while creating record.');
  }
}

export async function updateRecord<T>(input: UpdateCommandInput): Promise<T | undefined> {
  try {
    const result = await docClient.send(new UpdateCommand(input));
    return result.Attributes as T;
  } catch (error: unknown) {
    logger.error(`Error updating record in table "${input.TableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while updating record.');
  }
}
