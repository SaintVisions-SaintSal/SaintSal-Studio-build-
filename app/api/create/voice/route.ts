import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      voiceId = '21m00Tcm4TlvDq8ikWAM', // Rachel
      modelId = 'eleven_multilingual_v2',
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0,
      speakerBoost = true,
    } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Text content required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API not configured' },
        { status: 500 }
      );
    }

    // Generate speech
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: prompt,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: speakerBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs error:', error);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 data URL
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    // Alternatively, you could upload to R2/S3 and return a URL
    // For now, returning base64 data URL works for immediate playback

    return NextResponse.json({
      success: true,
      url: audioUrl,
      voiceId,
      characterCount: prompt.length,
    });

  } catch (error: any) {
    console.error('Voice generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Voice generation failed' },
      { status: 500 }
    );
  }
}

// Get available voices
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': apiKey!,
      },
    });

    const data = await response.json();

    // Map to simplified format
    const voices = data.voices.map((v: any) => ({
      id: v.voice_id,
      name: v.name,
      category: v.category,
      description: v.description,
      previewUrl: v.preview_url,
      labels: v.labels,
    }));

    return NextResponse.json({ success: true, voices });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
