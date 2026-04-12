import { NextResponse } from 'next/server';
import { getGscMetrics } from '@/services/integrations/googleSearchConsole';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteUrl = searchParams.get('siteUrl');
    
    if (!siteUrl) {
      return NextResponse.json({ error: 'Site URL is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('gsc_access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const metrics = await getGscMetrics(token, siteUrl);
    
    return NextResponse.json({ success: true, metrics });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
