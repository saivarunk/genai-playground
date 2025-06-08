import { NextRequest, NextResponse } from 'next/server';
import { presentationGenerator, PresentationGenerator } from '@/lib/agent/presentation-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, author } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Check if content is already formatted Marpit markdown
    const isMarpit = content.includes('---') && 
                     (content.includes('theme:') || content.includes('paginate:'));
    
    let result;
    let metadata;
    
    if (isMarpit) {
      // Content is already Marpit markdown, render it directly
      result = await presentationGenerator.renderMarpitMarkdown(content);
      
      // Extract title from markdown for metadata
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const extractedTitle = titleMatch ? titleMatch[1] : title || 'AI Generated Presentation';
      
      metadata = {
        title: extractedTitle,
        author: author || 'Jarvis AI',
        slideCount: (content.match(/^---$/gm) || []).length,
        createdAt: new Date().toISOString(),
      };
    } else {
      // Parse the AI-generated content into structured presentation data
      const presentationData = PresentationGenerator.parsePresentationFromText(content);
      
      if (!presentationData) {
        return NextResponse.json(
          { error: 'Could not parse presentation content' },
          { status: 400 }
        );
      }

      // Override title and author if provided
      if (title) presentationData.title = title;
      if (author) presentationData.author = author;

      // Generate the presentation
      result = await presentationGenerator.generatePresentation(presentationData);
      
      metadata = {
        title: presentationData.title,
        author: presentationData.author,
        slideCount: presentationData.slides.length,
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      presentation: {
        ...result,
        metadata
      }
    });

  } catch (error) {
    console.error('Error generating presentation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Presentation Generation API',
    endpoints: {
      generate: 'POST /api/presentation/generate'
    }
  });
} 