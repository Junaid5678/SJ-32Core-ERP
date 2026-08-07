import { NextResponse } from 'next/server';

// SJ 32Core ERP - Robust Steve Webhook Listener with Safe Response Handling
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

    // 3. Forward payload to n8n Cloud Webhook URL
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { success: false, error: 'N8N_WEBHOOK_URL is not configured in Vercel environment variables' },
        { status: 500 }
      );
    }

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

    // Safely handle text or empty response from n8n to prevent JSON parsing crash
    const responseText = await n8nResponse.text();
    let n8nData = {};
    
    try {
      n8nData = responseText ? JSON.parse(responseText) : { message: "Steve processed your request successfully." };
    } catch (parseError) {
      n8nData = { message: responseText || "Steve processed your request successfully." };
    }

    // 4. Return formatted response back to the frontend chat UI
    return NextResponse.json({
      success: true,
      tenantId,
      userContext,
      data: n8nData,
      message: n8nData.message || n8nData.reply || n8nData.output || responseText || 'Steve successfully processed your query',
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
    system: 'SJ 32Core ERP - Steve AI Webhook Gateway with Safe Handling',
    timestamp: new Date().toISOString()
  });
}
