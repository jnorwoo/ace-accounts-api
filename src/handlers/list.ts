import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { ddb, tableName } from "../aws/ddb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _evt: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
console.log('TABLE_NAME=', process.env.TABLE_NAME, 'DDB_ENDPOINT=', process.env.DDB_ENDPOINT);
    const data = await ddb.send(new ScanCommand({ TableName: tableName(), Limit: 25 }));
    return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ items: data.Items ?? [], nextPageToken: null })
    };
  } catch (error) {

    console.error("Error scanning DynamoDB table:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to scan table" }),
    };
  }
};
