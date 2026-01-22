import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import PptxGenJS from 'pptxgenjs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Slide {
  title: string;
  subtitle?: string;
  bullets?: string[];
  content?: string;
  layout: 'title' | 'bullets' | 'content' | 'section' | 'image';
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, slideCount = 10, theme = 'gold' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt required' },
        { status: 400 }
      );
    }

    // Use Claude to generate slide content
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Create a professional presentation with ${slideCount} slides based on this request:

${prompt}

Return ONLY a JSON array of slides. Each slide should have:
- title: string (the slide title)
- subtitle: string (optional subtitle)
- bullets: string[] (bullet points, 3-5 per slide for bullet slides)
- layout: "title" | "bullets" | "section" | "content"
- notes: string (speaker notes)

First slide should be layout "title", use "section" for transition slides, "bullets" for most content.

Return valid JSON only, no markdown, no explanation.`,
        },
      ],
    });

    // Parse Claude's response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Clean and parse JSON
    let slidesJson = content.text.trim();
    if (slidesJson.startsWith('```')) {
      slidesJson = slidesJson.replace(/```json?\n?/g, '').replace(/```/g, '');
    }
    
    const slides: Slide[] = JSON.parse(slidesJson);

    // Create PowerPoint
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.author = 'SaintSal™ AI';
    pptx.title = slides[0]?.title || 'Presentation';
    pptx.subject = prompt.slice(0, 100);
    pptx.company = 'Saint Vision Technologies';

    // Theme colors
    const themes = {
      gold: {
        primary: '#fbbf24',
        secondary: '#f59e0b',
        bg: '#0a0a0a',
        text: '#ffffff',
        accent: '#d97706',
      },
      blue: {
        primary: '#3b82f6',
        secondary: '#1d4ed8',
        bg: '#0f172a',
        text: '#ffffff',
        accent: '#60a5fa',
      },
      minimal: {
        primary: '#1f2937',
        secondary: '#374151',
        bg: '#ffffff',
        text: '#111827',
        accent: '#6b7280',
      },
    };

    const colors = themes[theme as keyof typeof themes] || themes.gold;

    // Create slides
    slides.forEach((slideData, index) => {
      const slide = pptx.addSlide();
      
      // Background
      slide.background = { color: colors.bg };

      if (slideData.layout === 'title') {
        // Title slide
        slide.addText(slideData.title, {
          x: 0.5,
          y: '35%',
          w: '90%',
          h: 1.5,
          fontSize: 44,
          bold: true,
          color: colors.primary,
          align: 'center',
        });
        
        if (slideData.subtitle) {
          slide.addText(slideData.subtitle, {
            x: 0.5,
            y: '55%',
            w: '90%',
            h: 0.8,
            fontSize: 24,
            color: colors.text,
            align: 'center',
          });
        }

        // Add logo placeholder or branding
        slide.addText('SaintSal™', {
          x: 0.5,
          y: '90%',
          w: 2,
          h: 0.4,
          fontSize: 12,
          color: colors.accent,
        });

      } else if (slideData.layout === 'section') {
        // Section divider
        slide.addText(slideData.title, {
          x: 0.5,
          y: '40%',
          w: '90%',
          h: 1.2,
          fontSize: 36,
          bold: true,
          color: colors.primary,
          align: 'center',
        });

      } else if (slideData.layout === 'bullets' && slideData.bullets) {
        // Title
        slide.addText(slideData.title, {
          x: 0.5,
          y: 0.5,
          w: '90%',
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: colors.primary,
        });

        // Bullets
        const bulletText = slideData.bullets.map(b => ({
          text: b,
          options: { bullet: { type: 'bullet', color: colors.primary }, indentLevel: 0 },
        }));

        slide.addText(bulletText, {
          x: 0.5,
          y: 1.5,
          w: '90%',
          h: 4,
          fontSize: 18,
          color: colors.text,
          valign: 'top',
          lineSpacing: 32,
        });

      } else {
        // Content slide
        slide.addText(slideData.title, {
          x: 0.5,
          y: 0.5,
          w: '90%',
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: colors.primary,
        });

        if (slideData.content) {
          slide.addText(slideData.content, {
            x: 0.5,
            y: 1.5,
            w: '90%',
            h: 4,
            fontSize: 16,
            color: colors.text,
            valign: 'top',
          });
        }
      }

      // Slide number (except title slide)
      if (index > 0) {
        slide.addText(`${index + 1}`, {
          x: '95%',
          y: '95%',
          w: 0.3,
          h: 0.3,
          fontSize: 10,
          color: colors.accent,
        });
      }

      // Add speaker notes
      if (slideData.notes) {
        slide.addNotes(slideData.notes);
      }
    });

    // Generate PowerPoint file
    const pptxBuffer = await pptx.write({ outputType: 'base64' });
    const pptxUrl = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${pptxBuffer}`;

    return NextResponse.json({
      success: true,
      url: pptxUrl,
      slideCount: slides.length,
      title: slides[0]?.title,
    });

  } catch (error: any) {
    console.error('Presentation generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Presentation generation failed' },
      { status: 500 }
    );
  }
}
