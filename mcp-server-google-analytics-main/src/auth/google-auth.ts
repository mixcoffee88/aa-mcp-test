/**
 * Google Authentication Module
 * 
 * This module handles authentication with Google APIs using a service account.
 */

import { google, analyticsdata_v1beta } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

// Environment variables for authentication
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;

// Validate required environment variables
if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
  console.error('Missing required environment variables: GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY must be set');
  process.exit(1);
}

if (!GA_PROPERTY_ID) {
  console.error('Warning: GA_PROPERTY_ID environment variable is not set. You will need to specify property IDs in requests.');
}

/**
 * Create a Google Auth client using service account credentials
 */
export const auth = new GoogleAuth({
  credentials: {
    client_email: GOOGLE_CLIENT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle escaped newlines
  },
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});

/**
 * Create an Analytics Data API client
 */
export const analyticsDataClient = new analyticsdata_v1beta.Analyticsdata({
  auth,
});

/**
 * Get the default GA4 property ID from environment variables
 */
export const getDefaultPropertyId = (): string => {
  if (!GA_PROPERTY_ID) {
    throw new Error('GA_PROPERTY_ID environment variable is not set');
  }
  return GA_PROPERTY_ID;
};

/**
 * Format a property ID to ensure it has the 'properties/' prefix
 */
export const formatPropertyId = (propertyId: string): string => {
  if (propertyId.startsWith('properties/')) {
    return propertyId;
  }
  return `properties/${propertyId}`;
};