export function response(
    statusCode: number,
    data: any,
    headers: Record<string, string> = {}
  ) {
    return {
      statusCode,
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: JSON.stringify(data)
    };
  }
  