import { NextResponse } from 'next/server';
import { getSallaStoreData } from '@/services/integrations/salla';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('salla_access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await getSallaStoreData(token);
    
    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
