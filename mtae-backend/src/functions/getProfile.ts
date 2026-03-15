import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // get userid from path parameter (this endpoint is public and can't be authenticated via Cognito authorizer)
        const userId = event.pathParameters?.userId;
        if (!userId) {
            return { statusCode: 400, headers, body: JSON.stringify({ message: 'userId path parameter is required' }) };
        }

        const result = await dynamo.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId },
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                userId: result.Item?.userId ?? "", 
                displayName: result.Item?.displayName ?? "",
                favoriteStops: result.Item?.favoriteStops ?? [],
                memberSince: result.Item?.createdAt ?? "",
            }),
        };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, headers, body: JSON.stringify({ message: 'Internal server error' }) };
    }
};