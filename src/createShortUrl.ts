import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { generateShortId } from "./utils/generateId";
import { isValidUrl } from "./utils/validateUrl";
import { response } from "./utils/response";


const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME as string;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
        return response(400, { message: "Request body missing" });
      }

    const { url } = JSON.parse(event.body);
    if (!url) {
        return response(400, { message: "URL is required" });
    }


    if (!isValidUrl(url)) {
        return response(400, {
            message: "Invalid URL. Only http/https URLs are allowed",
          });
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

    return response(200, {
        shortUrl: `https://${domain}/${stage}/short/${shortId}`,
      });
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
