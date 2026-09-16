import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { path } = await req.json();
    const headersList = headers();
    
    // Get basic visitor info
    const userAgent = headersList.get('user-agent') || 'Unknown';
    // Use x-forwarded-for for Vercel edge/proxied IPs
    const forwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'Unknown IP';

    // Log the visit to the database
    await prisma.visitorLog.create({
      data: {
        path: path || '/',
        userAgent,
        ipAddress,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to log visitor:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
