# Payment Service API Documentation

## Overview

The Payment Service API provides endpoints for managing invoice creation and verification with QPay integration. The service supports JWT-based authentication via AWS Cognito.

**Base URL:** `https://api.milloingoats.com/payment`  
**Authentication:** Bearer JWT tokens (Cognito)  
**Content-Type:** `application/json`

## Authentication

All endpoints require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

The JWT token should contain the user's `sub` claim which is used as the `userId`.

## Data Models

### Invoice Request

| Field     | Type   | Required | Description                |
| --------- | ------ | -------- | -------------------------- |
| packageId | string | Yes      | Identifier for the package |

### Invoice Response

| Field     | Type   | Description                         |
| --------- | ------ | ----------------------------------- |
| invoiceNo | string | Unique invoice identifier (UUID v4) |
| amount    | number | Invoice amount                      |
| qr_text   | string | QPay QR code text for payment       |
| qr_image  | string | QPay QR code image URL              |
| urls      | object | QPay payment URLs                   |

### Verification Response

| Field  | Type    | Description                 |
| ------ | ------- | --------------------------- |
| isPaid | boolean | Whether the invoice is paid |

## Endpoints

### 1. Create Invoice

Creates a new invoice for payment processing through QPay.

**Endpoint:** `POST /createInvoice`  
**Authentication:** Required  
**Request Body:**

| Parameter | Type   | Required | Description                 |
| --------- | ------ | -------- | --------------------------- |
| packageId | string | Yes      | Package identifier for sale |

#### cURL Example

```bash
curl -X POST "https://api.milloingoats.com/payment/createInvoice" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "X | L | M"
  }'
```

#### Success Response (200)

```json
{
  "invoice_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 100,
  "qr_text": "QPay:123456789",
  "qr_image": "https://qpay.mn/qr/123456789.png",
  "urls": {
    "name": "QPay Invoice",
    "description": "Test Invoice 550e8400-e29b-41d4-a716-446655440000",
    "logo": "https://qpay.mn/logo.png",
    "link": "qpaywallet://q?qPay_QRcode=000"
  }
}
```

#### Error Responses

**403 Forbidden**

```json
{
  "error": "Unauthorized: Admin access required"
}
```

**500 Internal Server Error**

```json
{
  "error": "Internal server error occurred"
}
```

### 2. Verify Invoice Payment

Verifies whether an invoice has been paid through QPay.

**Endpoint:** `GET /verifyInvoice`  
**Authentication:** Required  
**Query Parameters:**

| Parameter | Type   | Required | Description              |
| --------- | ------ | -------- | ------------------------ |
| invoiceNo | string | Yes      | Invoice number to verify |

#### cURL Example

```bash
curl -X GET "https://api.milloingoats.com/payment/verifyInvoice?invoiceNo=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

#### Success Response (200)

```json
{
  "isPaid": true
}
```

#### Error Responses

**403 Forbidden**

```json
{
  "error": "Unauthorized: Admin access required"
}
```

**404 Not Found**

```json
{
  "error": "Invoice not found"
}
```

**500 Internal Server Error**

```json
{
  "error": "Internal server error occurred"
}
```

## Environment Configuration

The service uses the following QPay configuration:

- **QPay API URL:** `https://merchant-sandbox.qpay.mn`
- **Environment:** Sandbox (for testing)
- **Username:** `TEST_MERCHANT`
- **Invoice Code:** `TEST_INVOICE`

## Integration Notes

1. **QPay Integration**: The service integrates with QPay's sandbox environment for payment processing
2. **AWS Cognito**: Authentication is handled through AWS Cognito User Pools
3. **Invoice Generation**: Each invoice gets a unique UUID v4 identifier
4. **Payment Verification**: Real-time payment status checking through QPay API

## Importable Postman Collection

You can import this API into Postman using the following collection format:

```json
{
  "info": {
    "name": "Payment Service API",
    "description": "API for managing invoice creation and payment verification",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://api.milloingoats.com/payment",
      "type": "string"
    },
    {
      "key": "authToken",
      "value": "your-jwt-token-here",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Create Invoice",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"packageId\": \"premium-package-001\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/createInvoice",
          "host": ["{{baseUrl}}"],
          "path": ["createInvoice"]
        }
      }
    },
    {
      "name": "Verify Invoice Payment",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/verifyInvoice?invoiceNo=550e8400-e29b-41d4-a716-446655440000",
          "host": ["{{baseUrl}}"],
          "path": ["verifyInvoice"],
          "query": [
            {
              "key": "invoiceNo",
              "value": "550e8400-e29b-41d4-a716-446655440000"
            }
          ]
        }
      }
    }
  ]
}
```

## Error Handling

The API uses consistent error response formats:

- **Authentication Errors (403)**: Invalid or missing JWT token
- **Validation Errors (400)**: Missing or invalid request parameters
- **Not Found Errors (404)**: Resource not found
- **Server Errors (500)**: Internal processing errors

All error responses include a descriptive error message in the response body.
