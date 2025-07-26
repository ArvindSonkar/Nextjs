

// src/app/api/hello/route.ts
import { NextResponse } from 'next/server';

export interface HiApiResponseModel {
    message: string;
}

export const GET = async () => {

    return NextResponse.json({ message: 'Hello Avi from API!' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
