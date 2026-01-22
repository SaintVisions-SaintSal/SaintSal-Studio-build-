import { NextRequest, NextResponse } from 'next/server';

// In production, this would check against your database
// For now, we'll use a simple validation
export async function POST(request: NextRequest) {
  try {
    const { licenseKey } = await request.json();

    if (!licenseKey) {
      return NextResponse.json(
        { valid: false, error: 'License key required' },
        { status: 400 }
      );
    }

    // Basic key format validation
    // Production: Check against Prisma database
    // Format: SAINT-XXXX-XXXX-XXXX for Lite, SAINTPRO-XXXX-XXXX-XXXX for Pro
    
    const isLiteFormat = /^SAINT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(licenseKey);
    const isProFormat = /^SAINTPRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(licenseKey);

    if (!isLiteFormat && !isProFormat) {
      return NextResponse.json(
        { valid: false, error: 'Invalid license key format' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Look up the key in your database
    // 2. Check if it's active and not expired
    // 3. Check usage limits
    // 4. Return the actual tier and expiration

    const tier = isProFormat ? 'pro' : 'lite';
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year from now

    return NextResponse.json({
      valid: true,
      tier,
      expiresAt,
      features: tier === 'pro' 
        ? ['unlimited_scraping', 'crm_integration', 'advanced_analysis', 'priority_support']
        : ['unlimited_scraping', 'basic_analysis']
    });

  } catch (error) {
    console.error('License verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

// Handle CORS
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
