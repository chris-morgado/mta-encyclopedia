import json
import os
from datetime import datetime, timezone
import boto3 # type: ignore
# ^ preinstalled in AWS Lambda Python environment

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
}

def handler(event, context):
    try:
        user_id = (event.get('requestContext', {}).get('authorizer', {}) or {}).get('claims', {}).get('sub')
        if not user_id:
            return {
                'statusCode': 401,
                'headers': HEADERS,
                'body': json.dumps({'message': 'Unauthorized'})
            }

        body = json.loads(event.get('body') or '{}')
        updated_display_name = body.get('updatedDisplayName')

        if not updated_display_name or not isinstance(updated_display_name, str):
            return {
                'statusCode': 400,
                'headers': HEADERS,
                'body': json.dumps({'message': 'updatedDisplayName is required and must be a string'})
            }

        now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

        table.update_item(
            Key={'userId': user_id},
            UpdateExpression='SET displayName = :name, updatedAt = :now, createdAt = if_not_exists(createdAt, :now)',
            ExpressionAttributeValues={
                ':name': updated_display_name,
                ':now':  now,
            }
        )

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({'message': 'Display name updated successfully'})
        }

    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'headers': HEADERS,
            'body': json.dumps({'message': 'Internal server error'})
        }
