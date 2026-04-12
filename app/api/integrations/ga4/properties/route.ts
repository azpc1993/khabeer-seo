import { NextResponse } from 'next/server';
import { getGa4Properties } from '@/services/integrations/googleAnalytics';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ga4_access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const properties = await getGa4Properties(token);
    
    return NextResponse.json({ success: true, properties });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
