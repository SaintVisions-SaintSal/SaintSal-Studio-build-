import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatContext, AIModel } from '@/types';

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Context-based model selection
function selectModel(context: ChatContext): AIModel {
  switch (context) {
    case 'research':
      return 'sonar-pro'; // Perplexity for research
    case 'property':
    case 'analyzer':
      return 'claude-sonnet-4-20250514'; // Claude for analysis
    case 'leads':
    case 'loans':
      return 'gpt-4o'; // GPT for structured data
    case 'apply':
      return 'claude-haiku-3-5-latest'; // Fast responses for forms
    default:
      return 'claude-sonnet-4-20250514'; // Default to Claude Sonnet
  }
}

// System prompts by context
function getSystemPrompt(context: ChatContext): string {
  const basePrompt = `You are SaintSal™ (SAINT DR™ SAL) - the digital embodiment of Sal Couzzo's intellectual legacy. IQ 157. Former Goldman Sachs executive track. You operate at the apex of human intelligence across EVERY domain: finance, real estate, law, technology, healthcare, government/defense, strategy, and execution.

THE GOTTA GUY™ PRINCIPLE:
Whatever the problem, you HAVE the answer. Not "I'll try" - you KNOW.
Whatever the need, you HAVE the solution. Not "maybe" - you DELIVER.
Whatever the complexity, you SOLVE it. Not "it's complicated" - you EXECUTE.

You are the AI equivalent of having a Goldman Sachs CEO, Silicon Valley CTO, Elite law firm partner, Real estate mogul, Hedge fund titan, and Chief of neurosurgery - ALL IN ONE.

Be direct, confident, and provide actionable solutions. Use precise terminology and show expertise.`;

  const contextPrompts: Record<ChatContext, string> = {
    chat: basePrompt,
    property: `${basePrompt}

PROPERTY CONTEXT: Focus on real estate analysis, property valuations, market trends, investment metrics (cap rate, cash-on-cash, NOI, IRR), 1031 exchanges, and property research. Provide detailed property analysis with comparable data when available.`,
    analyzer: `${basePrompt}

ANALYZER CONTEXT: Focus on deal analysis, investment calculations, ROI projections, renovation costs, ARV estimates, and financial modeling. Provide detailed spreadsheet-ready calculations and sensitivity analysis.`,
    leads: `${basePrompt}

LEADS CONTEXT: Focus on lead generation, contact enrichment, company research, decision-maker identification, and sales intelligence. Help qualify leads, craft outreach messages, and identify best prospects.`,
    loans: `${basePrompt}

LOANS CONTEXT: Focus on commercial and residential lending, loan products (DSCR, fix-and-flip, bridge, construction, conventional), lender matching, and financing strategies. Help users find the best loan products for their needs.`,
    apply: `${basePrompt}

APPLICATION CONTEXT: Help users complete loan applications, gather required documents, understand terms, and prepare submissions. Be helpful and guide them through the process step by step.`,
    research: `${basePrompt}

RESEARCH CONTEXT: Focus on deep research, market analysis, competitive intelligence, due diligence, and comprehensive reports. Cite sources, provide data, and deliver actionable insights.`,
  };

  return contextPrompts[context] || basePrompt;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, context = 'chat', model: requestedModel } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const model = requestedModel || selectModel(context);
    const systemPrompt = getSystemPrompt(context);

    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Determine provider based on model
          if (model.startsWith('claude')) {
            // Anthropic Claude
            const response = await anthropic.messages.create({
              model: model,
              max_tokens: 4096,
              system: systemPrompt,
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
          } else if (model.startsWith('gpt') || model.startsWith('o1')) {
            // OpenAI
            const response = await openai.chat.completions.create({
              model: model,
              messages: [
                { role: 'system', content: systemPrompt },
                ...messages,
              ],
              max_tokens: 4096,
              stream: true,
            });

            for await (const chunk of response) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                const data = JSON.stringify({ content });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
          } else if (model.startsWith('gemini')) {
            // Google Gemini
            const geminiModel = google.getGenerativeModel({ model: model });
            
            const chat = geminiModel.startChat({
              history: messages.slice(0, -1).map((m: any) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
              })),
            });

            const lastMessage = messages[messages.length - 1];
            const result = await chat.sendMessageStream(
              systemPrompt + '\n\n' + lastMessage.content
            );

            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                const data = JSON.stringify({ content: text });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
          } else if (model.startsWith('grok')) {
            // xAI Grok
            const response = await fetch('https://api.x.ai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  ...messages,
                ],
                stream: true,
              }),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            while (reader) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                  try {
                    const json = JSON.parse(line.slice(6));
                    const content = json.choices?.[0]?.delta?.content;
                    if (content) {
                      const data = JSON.stringify({ content });
                      controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
          } else if (model.startsWith('sonar')) {
            // Perplexity
            const response = await fetch('https://api.perplexity.ai/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  ...messages,
                ],
                stream: true,
              }),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            while (reader) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                  try {
                    const json = JSON.parse(line.slice(6));
                    const content = json.choices?.[0]?.delta?.content;
                    if (content) {
                      const data = JSON.stringify({ content });
                      controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('Stream error:', error);
          const errorData = JSON.stringify({ 
            error: 'An error occurred while processing your request.' 
          });
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
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
