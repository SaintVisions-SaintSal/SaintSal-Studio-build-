import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const RUNWAY_API_URL = 'https://api.runwayml.com/v1';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

interface AdScript {
  visualPrompt: string;
  voiceoverText: string;
  duration: number;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      voiceId = 'pNInz6obpgDQGcFmaJgB', // Adam - narrator voice
      duration = '10',
    } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt required' },
        { status: 400 }
      );
    }

    // Step 1: Use Claude to generate ad script
    const scriptResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Create a ${duration}-second video ad script based on:

${prompt}

Return ONLY JSON with:
{
  "visualPrompt": "Detailed visual description for AI video generation (cinematic, specific actions, lighting, mood)",
  "voiceoverText": "The exact voiceover script (${parseInt(duration) * 15} words max, punchy, compelling)",
  "callToAction": "The call to action text"
}

Make it compelling, professional, and suitable for social media advertising.
Return valid JSON only.`,
        },
      ],
    });

    const scriptContent = scriptResponse.content[0];
    if (scriptContent.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    let scriptJson = scriptContent.text.trim();
    if (scriptJson.startsWith('```')) {
      scriptJson = scriptJson.replace(/```json?\n?/g, '').replace(/```/g, '');
    }
    
    const script = JSON.parse(scriptJson);

    // Step 2: Generate voiceover with ElevenLabs
    const voiceResponse = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: script.voiceoverText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.3, // Slightly more expressive for ads
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!voiceResponse.ok) {
      console.error('ElevenLabs error:', await voiceResponse.text());
      throw new Error('Voiceover generation failed');
    }

    const audioBuffer = await voiceResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // Step 3: Generate video with Runway
    const runwayApiKey = process.env.RUNWAY_API;
    
    const videoCreateResponse = await fetch(`${RUNWAY_API_URL}/text_to_video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${runwayApiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-09-13',
      },
      body: JSON.stringify({
        model: 'gen3a_turbo',
        promptText: script.visualPrompt,
        duration: parseInt(duration),
        watermark: false,
      }),
    });

    if (!videoCreateResponse.ok) {
      console.error('Runway error:', await videoCreateResponse.text());
      throw new Error('Video generation failed');
    }

    const { id: taskId } = await videoCreateResponse.json();

    // Step 4: Poll for video completion
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 120;

    while (attempts < maxAttempts && !videoUrl) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`${RUNWAY_API_URL}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${runwayApiKey}`,
          'X-Runway-Version': '2024-09-13',
        },
      });

      const task = await statusResponse.json();

      if (task.status === 'SUCCEEDED') {
        videoUrl = task.output?.[0] || task.artifacts?.[0]?.url;
        break;
      }

      if (task.status === 'FAILED') {
        throw new Error('Video generation failed');
      }

      attempts++;
    }

    // Return both video and audio for client-side composition
    // (Full server-side video+audio merging would require FFmpeg)
    return NextResponse.json({
      success: true,
      videoUrl,
      audioUrl,
      script: {
        visual: script.visualPrompt,
        voiceover: script.voiceoverText,
        cta: script.callToAction,
      },
      duration: parseInt(duration),
      // Note: Client will need to combine video + audio
      // Or use a service like FFmpeg/Cloudflare Stream for server-side merge
      instructions: 'Play video and audio together. For production, use video editing API to merge.',
    });

  } catch (error: any) {
    console.error('Video ad generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Video ad generation failed' },
      { status: 500 }
    );
  }
}
