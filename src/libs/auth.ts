import type { APIGatewayProxyEvent } from 'aws-lambda';
import type { QueryParams, RequestMetadata } from '@/types';

import { logger } from '@/libs';
import { getUserIdFromTokenWithoutVerification } from '@/libs/cognito-token-service';

interface ExtendedAPIGatewayProxyEvent extends Omit<APIGatewayProxyEvent, 'body'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

const extractMetadata = (event: ExtendedAPIGatewayProxyEvent): RequestMetadata => {
  try {
    const ipAddress = event.requestContext.identity.sourceIp;
    const token = event.headers.Authorization?.replace('Bearer ', '');
    const queryParams = event.queryStringParameters as QueryParams;
    const headers = event.headers;
    const body = event.body;

    const { userId, email, groups } = token
      ? getUserIdFromTokenWithoutVerification(token)
      : { userId: undefined, email: undefined, groups: undefined };
      return { ipAddress, token, headers, queryParams, body, userId, email, groups };
  } catch (error) {
    logger.error('Err', error);
    throw new Error('Unable to process request!');
  }
};

export { extractMetadata };
