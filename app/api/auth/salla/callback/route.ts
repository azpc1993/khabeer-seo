import { NextResponse } from 'next/server';
import { exchangeSallaCode } from '@/services/integrations/salla';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/settings?error=NoCodeProvided', request.url));
    }

    const tokens = await exchangeSallaCode(code);
    
    if (!tokens.access_token) {
      return NextResponse.redirect(new URL('/settings?error=NoAccessToken', request.url));
    }

    const cookieStore = await cookies();
    
    cookieStore.set('salla_access_token', tokens.access_token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokens.expires_in || 3600
    });
    
    return NextResponse.redirect(new URL('/settings?integration=salla&success=true', request.url));
  } catch (error: unknown) {
    console.error('Salla OAuth Callback Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
