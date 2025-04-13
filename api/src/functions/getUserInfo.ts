import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { validateB2CToken } from "../middleware/auth";

/**
 * User Info API - Protected endpoint that requires authentication
 * Returns the user's profile information from the B2C token
 */
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    // Validate the B2C token from the Authorization header
    const authHeader = req.headers.authorization;
    const user = await validateB2CToken(context, authHeader);

    // If no valid user was found, return 401 Unauthorized
    if (!user) {
      context.res = {
        status: 401,
        body: { message: "Unauthorized - Valid authentication token required" }
      };
      return;
    }

    // Return the user information from the token
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        userId: user.sub,
        name: user.name,
        email: user.emails?.[0] || user.email,
        identityProvider: user.idp || "local",
        // Add any other relevant user information from the token
      }
    };
  } catch (error) {
    context.log.error("Error in getUserInfo function:", error);
    context.res = {
      status: 500,
      body: { message: "An error occurred while processing your request" }
    };
  }
};

export default httpTrigger;