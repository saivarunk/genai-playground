import { NextRequest, NextResponse } from 'next/server';
import { runJarvisAgent } from '@/lib/agent/jarvis-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, messages } = body;

    if (!message && (!messages || messages.length === 0)) {
      return NextResponse.json(
        { error: 'Message or messages array is required' },
        { status: 400 }
      );
    }

    // Check if GOOGLE_API_KEY is set
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    // Use the full conversation history if provided, otherwise use single message
    const conversationHistory = messages || [{ role: 'user', content: message }];
    
    // Run the Jarvis agent with full context (including attachments)
    const result = await runJarvisAgent(conversationHistory);
    
    // Extract the AI response
    const lastMessage = result.messages[result.messages.length - 1];
    const response = lastMessage.content;

    return NextResponse.json({
      message: response,
      success: true,
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Jarvis API is running',
    endpoints: {
      chat: 'POST /api/chat'
    }
  });
} 