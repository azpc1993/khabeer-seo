import { NextResponse } from 'next/server';
import { getGoogleAuthClient } from '@/services/integrations/googleSearchConsole';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // 'gsc' or 'ga4'
    
    if (!code) {
      return NextResponse.redirect(new URL('/settings?error=NoCodeProvided', request.url));
    }

    const oauth2Client = getGoogleAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      return NextResponse.redirect(new URL('/settings?error=NoAccessToken', request.url));
    }

    const cookieStore = await cookies();
    
    if (state === 'gsc') {
      cookieStore.set('gsc_access_token', tokens.access_token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600
      });
      
      return NextResponse.redirect(new URL('/settings?integration=gsc&success=true', request.url));
    } else if (state === 'ga4') {
      cookieStore.set('ga4_access_token', tokens.access_token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600
      });
      
      return NextResponse.redirect(new URL('/settings?integration=ga4&success=true', request.url));
    }

    return NextResponse.redirect(new URL('/settings', request.url));
  } catch (error: unknown) {
    console.error('OAuth Callback Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
