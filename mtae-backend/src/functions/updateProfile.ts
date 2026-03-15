import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

// still developing
// need to allow emails to be changed, currently its the unique identifier for users so it can't be changed, but ideally it should be

// export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//     try {
//         // get userid from auth context
//         const userId = event.requestContext.authorizer?.claims?.sub;
//         if (!userId) {
//             return { statusCode: 401, headers, body: JSON.stringify({ message: 'Unauthorized' }) };
//         }

//         const body = JSON.parse(event.body ?? '{}');


//     } catch (err) {
//         console.error(err);
//         return { statusCode: 500, headers, body: JSON.stringify({ message: 'Internal server error' }) };
//     }
// }