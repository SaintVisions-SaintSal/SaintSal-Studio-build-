import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { jsPDF } from 'jspdf';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface PDFSection {
  type: 'title' | 'heading' | 'subheading' | 'paragraph' | 'bullets' | 'table';
  content: string | string[] | string[][];
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, format = 'letter', style = 'professional' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt required' },
        { status: 400 }
      );
    }

    // Use Claude to generate document content
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Create a professional document based on this request:

${prompt}

Return ONLY a JSON array of sections. Each section should have:
- type: "title" | "heading" | "subheading" | "paragraph" | "bullets" | "table"
- content: string for title/heading/subheading/paragraph, string[] for bullets, string[][] for table (first row is headers)

Structure: Start with title, then organized sections with headings, paragraphs, and bullets as appropriate.
Make it comprehensive, professional, and well-formatted.

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
    let sectionsJson = content.text.trim();
    if (sectionsJson.startsWith('```')) {
      sectionsJson = sectionsJson.replace(/```json?\n?/g, '').replace(/```/g, '');
    }
    
    const sections: PDFSection[] = JSON.parse(sectionsJson);

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: format,
    });

    // Fonts and styling
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // Colors
    const colors = {
      gold: [251, 191, 36],
      black: [10, 10, 10],
      darkGray: [64, 64, 64],
      lightGray: [128, 128, 128],
    };

    // Helper to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (y + requiredSpace > pageHeight - margin) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    // Process each section
    sections.forEach((section, index) => {
      switch (section.type) {
        case 'title':
          checkPageBreak(30);
          doc.setFontSize(24);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...colors.gold);
          const titleLines = doc.splitTextToSize(section.content as string, contentWidth);
          doc.text(titleLines, margin, y);
          y += titleLines.length * 10 + 15;
          
          // Add line under title
          doc.setDrawColor(...colors.gold);
          doc.setLineWidth(0.5);
          doc.line(margin, y - 10, pageWidth - margin, y - 10);
          break;

        case 'heading':
          checkPageBreak(20);
          y += 8;
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...colors.black);
          const headingLines = doc.splitTextToSize(section.content as string, contentWidth);
          doc.text(headingLines, margin, y);
          y += headingLines.length * 7 + 5;
          break;

        case 'subheading':
          checkPageBreak(15);
          y += 5;
          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...colors.darkGray);
          const subLines = doc.splitTextToSize(section.content as string, contentWidth);
          doc.text(subLines, margin, y);
          y += subLines.length * 6 + 3;
          break;

        case 'paragraph':
          checkPageBreak(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...colors.darkGray);
          const paraLines = doc.splitTextToSize(section.content as string, contentWidth);
          
          paraLines.forEach((line: string) => {
            checkPageBreak(6);
            doc.text(line, margin, y);
            y += 5;
          });
          y += 3;
          break;

        case 'bullets':
          const bullets = section.content as string[];
          bullets.forEach((bullet) => {
            checkPageBreak(10);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colors.darkGray);
            
            // Bullet point
            doc.setFillColor(...colors.gold);
            doc.circle(margin + 2, y - 1.5, 1, 'F');
            
            // Text
            const bulletLines = doc.splitTextToSize(bullet, contentWidth - 10);
            bulletLines.forEach((line: string, i: number) => {
              doc.text(line, margin + 8, y);
              y += 5;
            });
            y += 2;
          });
          y += 3;
          break;

        case 'table':
          const tableData = section.content as string[][];
          if (tableData.length === 0) break;
          
          checkPageBreak(30);
          
          const colCount = tableData[0].length;
          const colWidth = contentWidth / colCount;
          const rowHeight = 8;
          
          tableData.forEach((row, rowIndex) => {
            checkPageBreak(rowHeight + 2);
            
            // Header row styling
            if (rowIndex === 0) {
              doc.setFillColor(...colors.gold);
              doc.rect(margin, y - 5, contentWidth, rowHeight, 'F');
              doc.setTextColor(0, 0, 0);
              doc.setFont('helvetica', 'bold');
            } else {
              doc.setTextColor(...colors.darkGray);
              doc.setFont('helvetica', 'normal');
              // Alternating row colors
              if (rowIndex % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, y - 5, contentWidth, rowHeight, 'F');
              }
            }
            
            doc.setFontSize(10);
            row.forEach((cell, colIndex) => {
              const cellX = margin + (colIndex * colWidth) + 2;
              const cellText = doc.splitTextToSize(cell, colWidth - 4);
              doc.text(cellText[0] || '', cellX, y);
            });
            
            y += rowHeight;
          });
          y += 5;
          break;
      }
    });

    // Add footer on each page
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...colors.lightGray);
      doc.text(
        `Generated by SaintSal™ AI | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Generate PDF
    const pdfOutput = doc.output('datauristring');

    return NextResponse.json({
      success: true,
      url: pdfOutput,
      pageCount,
      title: (sections.find(s => s.type === 'title')?.content as string) || 'Document',
    });

  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'PDF generation failed' },
      { status: 500 }
    );
  }
}
