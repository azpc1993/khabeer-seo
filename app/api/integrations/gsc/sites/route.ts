import { NextResponse } from 'next/server';
import { getGscSites } from '@/services/integrations/googleSearchConsole';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('gsc_access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sites = await getGscSites(token);
    
    return NextResponse.json({ success: true, sites });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
