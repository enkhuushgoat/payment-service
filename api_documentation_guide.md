## Overview

The E-Trading course API provides endpoints for managing notification with support for priority levels, user authentication via JWT tokens.

**Base URL:** `https://api.milliongoats.com/calendar`  
**Authentication:** Bearer JWT tokens (Cognito)  
**Content-Type:** `application/json`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

The JWT token should contain the user's `sub` claim which is used as the `userId`.

Check admin endpoints by groups field in bearer token using jwt

## Data models in table like this

| field | type   | Description    |
| ----- | ------ | -------------- |
| id    | string | unique uuid v4 |

also in ts interface

## Endpoints

### 1.

Description

**Endpoint:** `GET /v1`  
**Authentication:** Required  
**Query Parameters:**

| Parameter | Type | Required | Default | Description |
| --------- | ---- | -------- | ------- | ----------- |

#### cURL Example

```bash
curl -X GET "https://api.milliongoats.com/calendar/v1" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

#### Success Response (200)

```json
{}
```

#### Error Responses

**401 Unauthorized**

```json
{}
```

**500 Internal Server Error**

```json
{}
```

## Importable Postman Collection

You can import this API into Postman using the following collection format:
this is only example create new Importable Postman Collection for this repo plesae

```json
{
  "info": {
    "name": "E-Trading Notification API",
    "description": "API for managing in-app notifications",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://your-api-gateway-url.amazonaws.com",
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
      "name": "Get All Notifications",
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
          "raw": "{{baseUrl}}/v1?limit=20",
          "host": ["{{baseUrl}}"],
          "path": ["v1"],
          "query": [
            {
              "key": "limit",
              "value": "20"
            }
          ]
        }
      }
    },
    {
      "name": "Get Unseen Count",
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
          "raw": "{{baseUrl}}/v1/unseen-count",
          "host": ["{{baseUrl}}"],
          "path": ["v1", "unseen-count"]
        }
      }
    },
    {
      "name": "Create Test Notification",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"12345678-1234-1234-1234-123456789012\",\n  \"email\": \"user@example.com\",\n  \"titleKey\": \"Test Notification\",\n  \"messageKey\": \"This is a test message\",\n  \"type\": \"system_announcement\",\n  \"priority\": \"medium\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/notifications/test-create",
          "host": ["{{baseUrl}}"],
          "path": ["notifications", "test-create"]
        }
      }
    },
    {
      "name": "Mark Notification as Seen",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/v1/:notificationId/seen",
          "host": ["{{baseUrl}}"],
          "path": ["v1", ":notificationId", "seen"],
          "variable": [
            {
              "key": "notificationId",
              "value": "550e8400-e29b-41d4-a716-446655440000"
            }
          ]
        }
      }
    },
    {
      "name": "Delete Single Notification",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/v1?id=550e8400-e29b-41d4-a716-446655440000",
          "host": ["{{baseUrl}}"],
          "path": ["v1"],
          "query": [
            {
              "key": "id",
              "value": "550e8400-e29b-41d4-a716-446655440000"
            }
          ]
        }
      }
    },
    {
      "name": "Delete All Notifications",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/v1/all",
          "host": ["{{baseUrl}}"],
          "path": ["v1", "all"]
        }
      }
    }
  ]
}
```
