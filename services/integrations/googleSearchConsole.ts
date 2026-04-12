import { google } from 'googleapis';

export const getGoogleAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

export const getGscAuthUrl = () => {
  const oauth2Client = getGoogleAuthClient();
  const scopes = ['https://www.googleapis.com/auth/webmasters.readonly'];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: 'gsc'
  });
};

export const getGscSites = async (accessToken: string) => {
  const oauth2Client = getGoogleAuthClient();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
  const res = await searchconsole.sites.list();
  return res.data.siteEntry?.map(site => site.siteUrl) || [];
};

export const getGscMetrics = async (accessToken: string, siteUrl: string) => {
  const oauth2Client = getGoogleAuthClient();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
  
  // Get data for the last 30 days
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // To get overall metrics, we can query without dimensions
  const overallRes = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
    }
  });

  const row = overallRes.data.rows?.[0];
  
  return {
    clicks: row?.clicks || 0,
    impressions: row?.impressions || 0,
    ctr: row?.ctr ? Number((row.ctr * 100).toFixed(2)) : 0,
    position: row?.position ? Number(row.position.toFixed(1)) : 0
  };
};
