import { NextResponse } from 'next/server';

// SJ 32Core ERP - Updated Steve Webhook Listener (Rich Context & Permission Enforcement)
export async function POST(request) {
  try {
    const body = await request.json();
    const { eventType, tenantId, userContext, payload } = body;

    // 1. Security Check: Verify secret header from n8n cloud
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.STEVE_WEBHOOK_SECRET;

    if (secretKey && authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized Webhook Access - Invalid Secret' },
        { status: 401 }
      );
    }

    // 2. Validate Tenant & User Context existence
    if (!tenantId || !userContext) {
      return NextResponse.json(
        { success: false, error: 'Missing tenantId or userContext in webhook payload' },
        { status: 400 }
      );
    }

    console.log(`[SJ 32Core ERP] Processing Steve Payload for Tenant: ${tenantId}`, {
      userId: userContext.userId,
      role: userContext.role,
      permissions: userContext.permissions,
      eventType
    });

    // 3. Handle action based on event type
    switch (eventType) {
      case 'AI_PROCESS_RESPONSE':
        // Here we handle the response returned by Steve, 
        // ensuring userContext and permissions are preserved for the frontend UI.
        break;
      default:
        console.log('Processed general event with context:', eventType);
    }

    // Return the payload back along with the context so the frontend UI 
    // can handle permission checks (e.g., showing "Permission Denied" if unauthorized)
    return NextResponse.json({
      success: true,
      tenantId,
      userContext,
      data: payload,
      message: 'Webhook payload successfully processed with permission context',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Steve Webhook Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET method to check if the webhook endpoint is online
export async function GET() {
  return NextResponse.json({
    status: 'online',
    system: 'SJ 32Core ERP - Steve AI Webhook Gateway with Context Enforcement',
    timestamp: new Date().toISOString()
  });
}
