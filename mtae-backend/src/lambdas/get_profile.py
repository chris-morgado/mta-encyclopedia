import json
import os
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
        user_id = (event.get('pathParameters') or {}).get('userId')
        if not user_id:
            return {
                'statusCode': 400,
                'headers': HEADERS,
                'body': json.dumps({'message': 'userId path parameter is required'})
            }

        result = table.get_item(Key={'userId': user_id})
        item = result.get('Item', {})

        if not item:
            return {
                'statusCode': 404,
                'headers': HEADERS,
                'body': json.dumps({'message': 'Profile not found'})
            }

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'userId':        item.get('userId', ''),
                'displayName':   item.get('displayName', ''),
                'favoriteStops': item.get('favoriteStops', []),
                'memberSince':   item.get('createdAt', ''),
            })
        }

    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'headers': HEADERS,
            'body': json.dumps({'message': 'Internal server error'})
        }
