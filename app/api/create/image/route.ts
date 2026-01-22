import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Model configurations
const MODELS = {
  flux: 'black-forest-labs/flux-pro',
  sdxl: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  sd3: 'stability-ai/stable-diffusion-3',
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'flux', size = '1024x1024', style } = await request.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt required' }, { status: 400 });
    }

    // Parse dimensions
    const [width, height] = size.split('x').map(Number);

    // Enhanced prompt for better results
    const enhancedPrompt = `${prompt}, high quality, detailed, professional photography, 8k resolution`;

    let output;

    if (model === 'flux') {
      // FLUX Pro
      output = await replicate.run('black-forest-labs/flux-pro', {
        input: {
          prompt: enhancedPrompt,
          width,
          height,
          num_outputs: 1,
          guidance_scale: 3.5,
          num_inference_steps: 28,
          output_format: 'png',
        },
      });
    } else if (model === 'sdxl') {
      // Stable Diffusion XL
      output = await replicate.run(
        'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        {
          input: {
            prompt: enhancedPrompt,
            negative_prompt: 'blurry, low quality, distorted, deformed, ugly, bad anatomy',
            width,
            height,
            num_outputs: 1,
            scheduler: 'K_EULER',
            num_inference_steps: 30,
            guidance_scale: 7.5,
            refine: 'expert_ensemble_refiner',
            high_noise_frac: 0.8,
          },
        }
      );
    } else {
      // Stable Diffusion 3
      output = await replicate.run('stability-ai/stable-diffusion-3', {
        input: {
          prompt: enhancedPrompt,
          negative_prompt: 'blurry, low quality, distorted',
          aspect_ratio: width > height ? '16:9' : height > width ? '9:16' : '1:1',
          output_format: 'png',
        },
      });
    }

    // Get the URL from the output
    const imageUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      model,
      size,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image generation failed' },
      { status: 500 }
    );
  }
}
