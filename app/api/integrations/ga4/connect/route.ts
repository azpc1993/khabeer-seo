import { NextResponse } from 'next/server';
import { getGa4AuthUrl } from '@/services/integrations/googleAnalytics';

export async function POST() {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return NextResponse.json({ error: 'Google Client ID is not configured.' }, { status: 500 });
    }
    
    const url = getGa4AuthUrl();
    return NextResponse.json({ url });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
