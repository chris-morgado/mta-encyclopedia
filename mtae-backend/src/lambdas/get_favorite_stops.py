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
        user_id = (event.get('requestContext', {}).get('authorizer', {}) or {}).get('claims', {}).get('sub')
        if not user_id:
            return {
                'statusCode': 401,
                'headers': HEADERS,
                'body': json.dumps({'message': 'Unauthorized'})
            }

        result = table.get_item(Key={'userId': user_id})
        item = result.get('Item', {})

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'favoriteStops': item.get('favoriteStops', []),
            })
        }

    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'headers': HEADERS,
            'body': json.dumps({'message': 'Internal server error'})
        }
