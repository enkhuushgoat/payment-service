import { createAuthenticatedApiFunction, createDefaultApiFunction } from '@/libs';

// Client endpoints
export const createInvoice = createAuthenticatedApiFunction(__dirname, 'createInvoice', 'post', '/v1');
export const verifyInvoice = createAuthenticatedApiFunction(__dirname, 'verifyInvoice', 'get', '/v1');

export const createPreOrderInvoice = createDefaultApiFunction(
  __dirname,
  'createPreOrderInvoice',
  'post',
  '/v1/pre-order'
);

export const verifyPreOrderInvoice = createDefaultApiFunction(
  __dirname,
  'verifyPreOrderInvoice',
  'get',
  '/v1/pre-order'
);
