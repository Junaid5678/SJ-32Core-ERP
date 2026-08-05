import { NextResponse } from 'next/server';

// Steve AI Agent Webhook Listener for SJ 32Core ERP
export async function POST(request) {
  try {
    const body = await request.json();
    const { eventType, tenantId, payload } = body;

    // Security Check: Verify secret header from n8n cloud
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.STEVE_WEBHOOK_SECRET;

    if (secretKey && authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized Webhook Access - Invalid Secret' },
        { status: 401 }
      );
    }

    console.log(`[SJ 32Core ERP] Steve Webhook Received Successfully:`, { eventType, tenantId });

    // Here we can handle different actions triggered by Steve AI Agent
    switch (eventType) {
      case 'AI_ORDER_PROCESS':
        // Handle automated order parsing from WhatsApp / Gmail
        break;
      case 'STOCK_ALERT_TRIGGER':
        // Handle low-stock restock alerts
        break;
      default:
        console.log('General event received from Steve:', eventType);
    }

    return NextResponse.json({
      success: true,
      message: `Steve webhook successfully processed for tenant ${tenantId || 'Global'}`,
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
    system: 'SJ 32Core ERP - Steve AI Webhook Gateway',
    timestamp: new Date().toISOString()
  });
}

