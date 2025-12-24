import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { generateShortId } from "./utils/generateId";

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME as string;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Request body missing" }),
      };
    }

    const { url } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "URL is required" }),
      };
    }

    const shortId = generateShortId();

    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          shortId,
          originalUrl: url,
          createdAt: new Date().toISOString(),
        },
      })
    );

    const domain = event.requestContext.domainName;
    const stage = event.requestContext.stage;

    return {
      statusCode: 200,
      body: JSON.stringify({
        shortUrl: `https://${domain}/${stage}/short/${shortId}`,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
