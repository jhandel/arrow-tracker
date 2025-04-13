import { AzureFunction, Context, HttpRequest } from "@azure/functions";

/**
 * Health Check API - Public endpoint that doesn't require authentication
 * Used to verify the API is running correctly
 */
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const responseMessage = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0"
  };

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: responseMessage
  };
};

export default httpTrigger;