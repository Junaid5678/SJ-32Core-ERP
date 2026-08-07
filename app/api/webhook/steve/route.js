import { NextResponse } from 'next/server';

// SJ 32Core ERP - Updated Steve Webhook Listener (Forwarding to n8n Cloud)
export async function POST(request) {
  try {
    const body = await request.json();
    const { eventType, tenantId, userContext, payload } = body;

    // 1. Security Check: Verify secret header
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

    // 3. Forward payload to n8n Cloud Webhook URL
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { success: false, error: 'N8N_WEBHOOK_URL is not configured in Vercel environment variables' },
        { status: 500 }
      );
    }

    // Sending data to n8n workflow
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        tenantId,
        userContext,
        payload
      })
    });

    if (!n8nResponse.ok) {
      throw new Error(`Failed to reach n8n webhook: ${n8nResponse.statusText}`);
    }

    const n8nData = await n8nResponse.json();

    // 4. Return n8n's actual response back to the frontend chat UI
    return NextResponse.json({
      success: true,
      tenantId,
      userContext,
      data: n8nData,
      message: n8nData.message || n8nData.reply || 'Steve successfully processed your query',
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
    system: 'SJ 32Core ERP - Steve AI Webhook Gateway with n8n Forwarding',
    timestamp: new Date().toISOString()
  });
}
