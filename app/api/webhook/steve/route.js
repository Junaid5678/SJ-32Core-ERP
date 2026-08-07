import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventType, tenantId, userContext, payload } = body;

    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.STEVE_WEBHOOK_SECRET;

    if (secretKey && authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!tenantId || !userContext) {
      return NextResponse.json({ success: false, error: 'Missing tenantId or userContext' }, { status: 400 });
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      return NextResponse.json({ success: false, error: 'N8N_WEBHOOK_URL missing' }, { status: 500 });
    }

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, tenantId, userContext, payload })
    });

    const responseText = await n8nResponse.text();
    
    // Debugging: Let's see what n8n actually returned
    let finalMessage = "";
    if (!responseText || responseText.trim() === "") {
      finalMessage = "[DEBUG]: n8n returned an EMPTY response. Please check 'Respond to Webhook' node settings.";
    } else {
      try {
        const jsonParsed = JSON.parse(responseText);
        finalMessage = jsonParsed.reply || jsonParsed.output || jsonParsed.message || jsonParsed.text || JSON.stringify(jsonParsed);
      } catch (e) {
        finalMessage = responseText;
      }
    }

    return NextResponse.json({
      success: true,
      tenantId,
      userContext,
      message: finalMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Steve Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'online' });
}
