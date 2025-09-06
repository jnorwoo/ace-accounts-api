import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";


const endpoint =
    process.env.DDB_ENDPOINT ??
    (process.env.AWS_SAM_LOCAL ? 'http://host.docker.internal:8000' : undefined);
    
const client = new DynamoDBClient({
    endpoint: endpoint,
    region: process.env.AWS_REGION || "us-east-1"
});

export const ddb = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true }
});

export const tableName = () => process.env.TABLE_NAME || "Accounts";
