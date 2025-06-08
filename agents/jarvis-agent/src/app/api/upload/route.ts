import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf', // .pdf
];

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF files are supported. For spreadsheets or data files, please convert them to PDF first.' },
        { status: 400 }
      );
    }

    // Generate unique file ID and file name
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileExtension = file.name.split('.').pop() || 'unknown';
    const fileName = `${fileId}.${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file to disk
    const filePath = join(uploadsDir, fileName);
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, new Uint8Array(buffer));

    console.log('File saved:', {
      id: fileId,
      name: file.name,
      originalName: file.name,
      savedPath: filePath,
      type: file.type,
      size: file.size
    });

    return NextResponse.json({
      success: true,
      file: {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        path: filePath, // Gemini will use this path
        mimeType: file.type, // Gemini needs mimeType
      },
    });

  } catch (error) {
    console.error('Error in file upload API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'File Upload API',
    supportedTypes: ['pdf'],
    maxSize: '10MB',
    note: 'For spreadsheets or data files, please convert them to PDF first.',
  });
} 