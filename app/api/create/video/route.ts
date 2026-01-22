import { NextRequest, NextResponse } from 'next/server';

const RUNWAY_API_URL = 'https://api.runwayml.com/v1';

export async function POST(request: NextRequest) {
  try {
    const { prompt, duration = '5', imageUrl } = await request.json();

    if (!prompt && !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Prompt or image URL required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RUNWAY_API;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Runway API not configured' },
        { status: 500 }
      );
    }

    // Create generation task
    const createResponse = await fetch(`${RUNWAY_API_URL}/text_to_video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-09-13',
      },
      body: JSON.stringify({
        model: 'gen3a_turbo',
        promptText: prompt,
        duration: parseInt(duration),
        watermark: false,
        seed: Math.floor(Math.random() * 1000000),
        ...(imageUrl && { promptImage: imageUrl }),
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error('Runway create error:', error);
      throw new Error(`Runway API error: ${createResponse.status}`);
    }

    const { id: taskId } = await createResponse.json();

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes max wait
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`${RUNWAY_API_URL}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-09-13',
        },
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to check task status');
      }

      const task = await statusResponse.json();

      if (task.status === 'SUCCEEDED') {
        return NextResponse.json({
          success: true,
          url: task.output?.[0] || task.artifacts?.[0]?.url,
          duration,
          taskId,
        });
      }

      if (task.status === 'FAILED') {
        throw new Error(task.error || 'Video generation failed');
      }

      attempts++;
    }

    // Return task ID for async polling if still processing
    return NextResponse.json({
      success: true,
      status: 'processing',
      taskId,
      message: 'Video is still generating. Check back shortly.',
    });

  } catch (error: any) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Video generation failed' },
      { status: 500 }
    );
  }
}

// Check task status
export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get('taskId');
  
  if (!taskId) {
    return NextResponse.json({ success: false, error: 'Task ID required' }, { status: 400 });
  }

  try {
    const apiKey = process.env.RUNWAY_API;
    
    const response = await fetch(`${RUNWAY_API_URL}/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-09-13',
      },
    });

    const task = await response.json();

    return NextResponse.json({
      success: true,
      status: task.status,
      url: task.status === 'SUCCEEDED' ? (task.output?.[0] || task.artifacts?.[0]?.url) : null,
      progress: task.progress,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
