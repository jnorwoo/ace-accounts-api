import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { ddb, tableName } from "../aws/ddb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

export const handler = async (
    event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
    const { body } = event;
    if (!body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing request body" }),
        };
    }

    interface AccountPayload {
        [key: string]: string | number | boolean | null | object;  // Define specific fields based on your account structure
    }
    
    // Check if body exists before parsing
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing request body" }),
        };
    }
    
    const payload = typeof event.body === "string" ? JSON.parse(event.body) as AccountPayload : event.body as AccountPayload;
    const id = "acc_" + randomUUID().slice(0, 8);
    const item = { id, ...payload };

    try {
        await ddb.send(
            new PutCommand({
                TableName: tableName(),
                Item: item,
                ConditionExpression: "attribute_not_exists(id)"
            })
        );

        return {
            statusCode: 201,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id }),
        };
    } catch (error) {
        console.error("Error creating item in DynamoDB:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to create item" }),
        };
    }
};
