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

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // get userid from auth context
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            return { statusCode: 401, headers, body: JSON.stringify({ message: 'Unauthorized' }) };
        }

        const body = JSON.parse(event.body ?? '{}');

        // update fields (currently just display name)
        const updatedDisplayName: string = body.updatedDisplayName;
        if(!updatedDisplayName || typeof updatedDisplayName !== 'string') {
            return { statusCode: 400, headers, body: JSON.stringify({ message: 'updatedDisplayName is required and must be a string' }) };
        }
        
        await dynamo.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { userId },
            UpdateExpression: 'SET displayName = :name, updatedAt = :now, createdAt = if_not_exists(createdAt, :now)',
            ExpressionAttributeValues: {
                ':name': updatedDisplayName,
                ':now': new Date().toISOString(),
            }
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Display name updated successfully' }),
        }

    } catch (err) {
        console.error(err);
        return { statusCode: 500, headers, body: JSON.stringify({ message: 'Internal server error' }) };
    }
}