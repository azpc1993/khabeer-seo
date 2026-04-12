import { google } from 'googleapis';
import { getGoogleAuthClient } from './googleSearchConsole';

export const getGa4AuthUrl = () => {
  const oauth2Client = getGoogleAuthClient();
  const scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: 'ga4'
  });
};

export const getGa4Properties = async (accessToken: string) => {
  const oauth2Client = getGoogleAuthClient();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const analyticsadmin = google.analyticsadmin({ version: 'v1beta', auth: oauth2Client });
  const res = await analyticsadmin.accountSummaries.list();
  
  const properties: { id: string; name: string }[] = [];
  
  res.data.accountSummaries?.forEach(account => {
    account.propertySummaries?.forEach(prop => {
      if (prop.property && prop.displayName) {
        properties.push({
          id: prop.property,
          name: prop.displayName
        });
      }
    });
  });
  
  return properties;
};

export const getGa4Metrics = async (accessToken: string, propertyId: string) => {
  const oauth2Client = getGoogleAuthClient();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const analyticsdata = google.analyticsdata({ version: 'v1beta', auth: oauth2Client });
  
  // Property ID format should be 'properties/1234567'
  const property = propertyId.startsWith('properties/') ? propertyId : `properties/${propertyId}`;
  
  const res = await analyticsdata.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
    }
  });
  
  const row = res.data.rows?.[0];
  
  return {
    users: Number(row?.metricValues?.[0]?.value || 0),
    sessions: Number(row?.metricValues?.[1]?.value || 0),
    topPages: [] // Simplified for now
  };
};
