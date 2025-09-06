import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { ddb, tableName } from "../aws/ddb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
  const { id } = event.pathParameters || {};

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing account ID" }),
    };
  }

  try {
    const command = new GetCommand({
      TableName: tableName(),
      Key: { id },
    });

    const { Item } = await ddb.send(command);

    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Account not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(Item),
    };
  } catch (error) {
    console.error("Error getting account:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error getting account" }),
    };
  }
};
