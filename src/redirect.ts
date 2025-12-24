import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME as string;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const shortId = event.pathParameters?.id;

    if (!shortId) {
      return {
        statusCode: 400,
        body: "Short URL id is missing",
      };
    }

    const result = await client.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { shortId },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        body: "URL not found",
      };
    }

    return {
      statusCode: 302,
      headers: {
        Location: result.Item.originalUrl,
      },
      body: "",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};
