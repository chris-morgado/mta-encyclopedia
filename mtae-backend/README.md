to run (have docker installed first pls, or if not then get rid of the use-container but then you'll have to make sure you're running exactly what this code says you should run):

sam build --use-container

then, 

sam deploy --guided

todo make this readme way way better

## Backend: AWS Serverless Application Model (SAM) w/ 4 Lambda functions:
### Infrastructure
- API Gateway w/ Cognito authorization
- Python 3.13 runtime
- DynamoDB table (`user_profiles`)

### API Endpoints:
1. `GET /profile/{userId}` - Public endpoint to fetch user profile
2. `PUT /profile` - Authenticated endpoint to update display name
3. `GET /profile/favorites` - Authenticated endpoint to fetch favorite stops
4. `PUT /profile/favorites` - Authenticated endpoint to update favorite stops (max 5)