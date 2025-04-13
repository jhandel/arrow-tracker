import { Context } from '@azure/functions';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Configuration for B2C
const b2cTenantName = process.env.B2C_TENANT_NAME || '';
const b2cPolicy = process.env.B2C_SIGN_UP_SIGN_IN_POLICY || 'B2C_1_signupsignin';
const b2cBaseUrl = `https://${b2cTenantName}.b2clogin.com/${b2cTenantName}.onmicrosoft.com`;
const b2cJwksUri = `${b2cBaseUrl}/${b2cPolicy}/discovery/v2.0/keys`;

// Create a JWKS client
const jwksRsa = jwksClient({
  jwksUri: b2cJwksUri,
  cache: true,
  cacheMaxAge: 86400000, // 1 day
});

// Function to get the signing key
const getSigningKey = (kid: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwksRsa.getSigningKey(kid, (err, key) => {
      if (err) {
        return reject(err);
      }
      
      // Using getPublicKey() for both types of signing keys
      const signingKey = key && ('getPublicKey' in key 
        ? key.getPublicKey() 
        : key.rsaPublicKey);
      
      resolve(signingKey as string);
    });
  });
};

/**
 * Middleware to validate Azure AD B2C JWT token
 * @param context Azure Functions context
 * @param req HTTP request
 * @returns User information if token is valid, null otherwise
 */
export const validateB2CToken = async (context: Context, authHeader?: string): Promise<any | null> => {
  try {
    // If no authorization header is present, return null
    if (!authHeader) {
      context.log.warn('No authorization header present');
      return null;
    }

    // Extract the token from the Authorization header (Bearer token)
    const token = authHeader.replace('Bearer ', '');
    
    // Decode the token to get the header (without verification)
    const decodedToken = jwt.decode(token, { complete: true });
    
    if (!decodedToken || typeof decodedToken === 'string') {
      context.log.warn('Invalid token format');
      return null;
    }
    
    // Get the key ID from the token header
    const kid = decodedToken.header.kid;
    if (!kid) {
      context.log.warn('No key ID in token header');
      return null;
    }
    
    // Get the signing key using the key ID
    const signingKey = await getSigningKey(kid);
    
    // Verify the token
    const verifyOptions: jwt.VerifyOptions = {
      algorithms: ['RS256'],
      audience: process.env.B2C_CLIENT_ID || '',
      issuer: `${b2cBaseUrl}/v2.0/`
    };
    
    const verified = jwt.verify(token, signingKey, verifyOptions);
    
    // If verification is successful, return the user information
    return verified;
  } catch (error) {
    context.log.error('Token validation error:', error);
    return null;
  }
};