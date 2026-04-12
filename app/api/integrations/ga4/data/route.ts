import { NextResponse } from 'next/server';
import { getGa4Metrics } from '@/services/integrations/googleAnalytics';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    
    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('ga4_access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const metrics = await getGa4Metrics(token, propertyId);
    
    return NextResponse.json({ success: true, metrics });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
