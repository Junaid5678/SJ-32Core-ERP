import { NextResponse } from 'next/server';

// SJ 32Core ERP - Ultimate Robust Steve Webhook Gateway
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

    const responseText = await n8nResponse.text();
    let finalMessage = "Steve processed your request successfully.";

    try {
      const jsonParsed = JSON.parse(responseText);
      // Try extracting reply, output, message, or any text field from n8n JSON
      finalMessage = jsonParsed.reply || jsonParsed.output || jsonParsed.message || jsonParsed.text || JSON.stringify(jsonParsed);
    } catch (e) {
      // If it's plain text, use responseText directly
      if (responseText && responseText.trim() !== "") {
        finalMessage = responseText;
      }
    }

    // 4. Return exact Steve response back to frontend
    return NextResponse.json({
      success: true,
      tenantId,
      userContext,
      message: finalMessage,
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

export async function GET() {
  return NextResponse.json({
    status: 'online',
    system: 'SJ 32Core ERP - Steve AI Webhook Gateway Active',
    timestamp: new Date().toISOString()
  });
}
