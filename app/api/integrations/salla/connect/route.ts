import { NextResponse } from 'next/server';
import { getSallaAuthUrl } from '@/services/integrations/salla';

export async function POST() {
  try {
    if (!process.env.SALLA_CLIENT_ID) {
      return NextResponse.json({ error: 'Salla Client ID is not configured.' }, { status: 500 });
    }
    
    const url = getSallaAuthUrl();
    return NextResponse.json({ url });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
