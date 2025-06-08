import { NextRequest, NextResponse } from 'next/server';
import { runJarvisAgent, runJarvisAgentStream } from '@/lib/agent/jarvis-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, messages, stream = false } = body;

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
    
    // Handle streaming response
    if (stream) {
      const encoder = new TextEncoder();
      
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const streamGenerator = runJarvisAgentStream(conversationHistory);
            
            for await (const chunk of streamGenerator) {
              const data = `data: ${JSON.stringify({ 
                content: chunk,
                type: 'content'
              })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
            
            // Send end signal
            const endData = `data: ${JSON.stringify({ 
              type: 'end'
            })}\n\n`;
            controller.enqueue(encoder.encode(endData));
            
          } catch (error) {
            console.error('Streaming error:', error);
            const errorData = `data: ${JSON.stringify({ 
              type: 'error',
              error: 'Failed to generate response'
            })}\n\n`;
            controller.enqueue(encoder.encode(errorData));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
    
    // Non-streaming response (existing functionality)
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