import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const SYSTEM_PROMPT = `You are SaintSal™ (SAINT DR™ SAL) - an elite AI assistant embedded in a Chrome extension. You help users analyze web pages, extract lead information, and provide business intelligence.

When analyzing pages, provide:
1. Key insights and summary
2. Contact information found (emails, phones, social links)
3. Company/person details
4. Lead quality assessment
5. Recommended next actions

Be direct, confident, and actionable. You are the user's GOTTA GUY™ for web intelligence.`;

export async function POST(request: NextRequest) {
  try {
    const licenseKey = request.headers.get('X-License-Key');
    const { messages, context, pageUrl } = await request.json();

    // Verify license (basic check - expand with DB lookup)
    // For now, allow requests with or without license
    const tier = licenseKey ? 'pro' : 'free';

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const response = await anthropic.messages.create({
            model: tier === 'pro' ? 'claude-sonnet-4-20250514' : 'claude-haiku-3-5-latest',
            max_tokens: tier === 'pro' ? 4096 : 1024,
            system: SYSTEM_PROMPT,
            messages: messages.map((m: any) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
            stream: true,
          });

          for await (const event of response) {
            if (event.type === 'content_block_delta') {
              const delta = event.delta;
              if ('text' in delta) {
                const data = JSON.stringify({ content: delta.text });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('Extension chat error:', error);
          const errorData = JSON.stringify({ error: 'An error occurred' });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Extension API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-License-Key',
    },
  });
}
