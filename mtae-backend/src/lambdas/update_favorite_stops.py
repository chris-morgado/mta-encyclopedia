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
        favorite_stops = body.get('favoriteStops', [])

        if not isinstance(favorite_stops, list) or len(favorite_stops) > 5:
            return {
                'statusCode': 400,
                'headers': HEADERS,
                'body': json.dumps({'message': 'favoriteStops must be an array of at most 5 stop IDs'})
            }

        now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

        table.update_item(
            Key={'userId': user_id},
            UpdateExpression='SET favoriteStops = :stops, updatedAt = :now',
            ExpressionAttributeValues={
                ':stops': favorite_stops,
                ':now':   now,
            }
        )

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({'favoriteStops': favorite_stops})
        }

    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'headers': HEADERS,
            'body': json.dumps({'message': 'Internal server error'})
        }
