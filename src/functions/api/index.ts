import { createDefaultApiFunction } from '@/libs';

// Client endpoints
export const createInvoice = createDefaultApiFunction(__dirname, 'createInvoice', 'post', '/v1');
export const verifyInvoice = createDefaultApiFunction(__dirname, 'verifyInvoice', 'get', '/v1');
