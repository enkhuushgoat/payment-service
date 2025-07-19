import type { AWS } from '@serverless/typescript';
import { createInvoice, verifyInvoice, createPreOrderInvoice, verifyPreOrderInvoice } from './src/functions/api';

const serverlessConfig: AWS = {
  service: 'payment-service',
  frameworkVersion: '4',
  app: 'payment-service-app',
  plugins: ['serverless-offline', 'serverless-prune-plugin'],
  provider: {
    name: 'aws',
    stage: "${opt:stage, 'prod'}",
    runtime: 'nodejs20.x',
    region: 'ap-southeast-1',
    profile: 'goat',
    logRetentionInDays: 365,
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:Query',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
            ],
            Resource: [
              'arn:aws:dynamodb:${self:provider.region}:*:table/invoice',
              'arn:aws:dynamodb:${self:provider.region}:*:table/invoice/index/*',
              'arn:aws:dynamodb:${self:provider.region}:*:table/subscription',
              'arn:aws:dynamodb:${self:provider.region}:*:table/subscription/index/*',
              'arn:aws:dynamodb:${self:provider.region}:*:table/subscription-history',
              'arn:aws:dynamodb:${self:provider.region}:*:table/subscription-history/index/*',
              'arn:aws:dynamodb:${self:provider.region}:*:table/pre-order',
              'arn:aws:dynamodb:${self:provider.region}:*:table/pre-order/index/*',
            ],
          },
        ],
      },
    },
    environment: {
      QPAY_V2_URL: 'https://merchant-sandbox.qpay.mn',
      QPAY_USERNAME: 'TEST_MERCHANT',
      QPAY_PASSWORD: '123456',
      QPAY_INVOICE_CODE: 'TEST_INVOICE',
      BASE_URL: 'https://api.milloingoats.com',
      CF_CAPTCHA_SECRET_KEY: '${ssm:/cloudflare/captcha/secret-key}',
    },
  },
  functions: {
    createInvoice,
    verifyInvoice,
    createPreOrderInvoice,
    verifyPreOrderInvoice,
  },
  package: { individually: true },
  resources: {
    Resources: {
      CognitoAuthorizer: {
        Type: 'AWS::ApiGateway::Authorizer',
        Properties: {
          RestApiId: { Ref: 'ApiGatewayRestApi' },
          Type: 'COGNITO_USER_POOLS',
          IdentitySource: 'method.request.header.Authorization',
          AuthorizerResultTtlInSeconds: 300,
          Name: 'CognitoAuthorizer',
          ProviderARNs: ['arn:aws:cognito-idp:ap-southeast-1:744860871045:userpool/ap-southeast-1_m2P4ohAHM'],
        },
      },
      GatewayResponseDefault4XX: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
    },
  },
  custom: {
    prune: {
      automatic: true,
      number: 2,
    },
    function_timeout: {
      ain: 29,
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk', 'pg-hstore'],
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfig;
