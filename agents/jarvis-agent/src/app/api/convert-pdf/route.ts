import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { markdown, filename } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: 'Markdown content is required' },
        { status: 400 }
      );
    }

    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), 'temp');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    // Generate unique filenames
    const timestamp = Date.now();
    const safeFilename = (filename || 'presentation').replace(/[^a-zA-Z0-9]/g, '_');
    const mdFile = join(tempDir, `${safeFilename}_${timestamp}.md`);
    const pdfFile = join(tempDir, `${safeFilename}_${timestamp}.pdf`);

    try {
      // Write markdown to temporary file
      writeFileSync(mdFile, markdown, 'utf8');

      // Convert to PDF using Marp CLI
      const marpCommand = `npx @marp-team/marp-cli "${mdFile}" --pdf --output "${pdfFile}" --allow-local-files --no-stdin`;
      
      await execAsync(marpCommand, {
        cwd: process.cwd(),
        timeout: 30000 // 30 second timeout
      });

      // Check if PDF was created
      if (!existsSync(pdfFile)) {
        throw new Error('PDF generation failed - output file not found');
      }

      // Read the PDF file
      const pdfBuffer = require('fs').readFileSync(pdfFile);

      // Clean up temporary files
      unlinkSync(mdFile);
      unlinkSync(pdfFile);

      // Return the PDF as a downloadable response
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeFilename}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });

    } catch (conversionError) {
      // Clean up files in case of error
      try {
        if (existsSync(mdFile)) unlinkSync(mdFile);
        if (existsSync(pdfFile)) unlinkSync(pdfFile);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      throw conversionError;
    }

  } catch (error) {
    console.error('PDF conversion error:', error);
    
    let errorMessage = 'Failed to convert presentation to PDF';
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'PDF conversion timed out. Please try again.';
      } else if (error.message.includes('not found')) {
        errorMessage = 'Marp CLI not found. Please ensure dependencies are installed.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 