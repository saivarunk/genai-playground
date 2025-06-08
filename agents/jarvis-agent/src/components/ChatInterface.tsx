'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, FileAttachment } from '@/lib/types';
import ChatHeader from './ui/ChatHeader';
import MessageList from './ui/MessageList';
import ChatInput from './ui/ChatInput';
import Sidebar from './ui/Sidebar';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPresentation, setGeneratedPresentation] = useState<any>(null);
  const [rawMarkdown, setRawMarkdown] = useState<string>('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'presentation' | 'markdown'>('presentation');
  const [enableStreaming, setEnableStreaming] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAndGeneratePresentation = async (content: string) => {
    console.log('Checking content for presentation markers:', content.substring(0, 100) + '...');
    
    // Check if content contains presentation markers
    const hasPresentationMarkers = content.includes('PRESENTATION_START') && content.includes('PRESENTATION_END');
    
    console.log('Has presentation markers:', hasPresentationMarkers);
    
    if (hasPresentationMarkers) {
      try {
        // Extract the presentation content between markers
        const startMarker = 'PRESENTATION_START';
        const endMarker = 'PRESENTATION_END';
        const startIndex = content.indexOf(startMarker) + startMarker.length;
        const endIndex = content.indexOf(endMarker);
        
        if (startIndex > startMarker.length && endIndex > startIndex) {
          const markdownContent = content.substring(startIndex, endIndex).trim();
          
          console.log('Extracted markdown:', markdownContent.substring(0, 100) + '...');
          
          // Store the raw markdown
          setRawMarkdown(markdownContent);
          
          // Extract explanation (everything before PRESENTATION_START)
          const explanation = content.substring(0, content.indexOf(startMarker)).trim();
          
          console.log('Extracted explanation:', explanation);
          
          const response = await fetch('/api/presentation/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: markdownContent,
              title: 'AI Generated Presentation',
              author: 'Jarvis AI',
            }),
          });

          if (response.ok) {
            const presentationData = await response.json();
            setGeneratedPresentation(presentationData.presentation);
            
            // Replace the current message content with just the explanation
            setMessages((prev) => {
              const newMessages = [...prev];
              if (newMessages[newMessages.length - 1]?.role === 'assistant') {
                newMessages[newMessages.length - 1].content = explanation;
              }
              return newMessages;
            });
            
            // Add a presentation card message
            const presentationMessage: Message = {
              role: 'assistant',
              content: `PRESENTATION_CARD:${JSON.stringify({
                title: presentationData.presentation.metadata?.title || 'Generated Presentation',
                slideCount: presentationData.presentation.metadata?.slideCount || 0,
                createdAt: presentationData.presentation.metadata?.createdAt
              })}`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, presentationMessage]);
          }
        }
      } catch (error) {
        console.error('Error generating presentation:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, attachments?: FileAttachment[]) => {
    e.preventDefault();
    if ((!input.trim() && (!attachments || attachments.length === 0)) || isLoading) return;

    const newMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachments: attachments || [],
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    // Add placeholder assistant message only for streaming
    if (enableStreaming) {
      const placeholderMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, placeholderMessage]);
    }

    // Call the Jarvis API with full conversation history
    const updatedMessages = [...messages, newMessage];
    
    try {
      const requestBody = {
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          attachments: msg.attachments
        })),
        stream: enableStreaming // Enable streaming based on toggle
      };
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let streamedContent = '';

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    
                    if (data.type === 'content' && data.content) {
                      streamedContent += data.content;
                      
                      // Update the last assistant message with streamed content
                      setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant') {
                          lastMessage.content = streamedContent;
                        }
                        return newMessages;
                      });
                    } else if (data.type === 'end') {
                      // Stream completed
                      console.log('Stream completed');
                      
                      // Check if the response contains presentation content
                      if (streamedContent) {
                        await checkAndGeneratePresentation(streamedContent);
                      }
                      break;
                    } else if (data.type === 'error') {
                      throw new Error(data.error || 'Stream error');
                    }
                  } catch (parseError) {
                    console.error('Error parsing streaming data:', parseError);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
      } else {
        // Handle non-streaming response (fallback)
        const data = await response.json();
        
        if (response.ok) {
          if (enableStreaming) {
            // Update the placeholder message with the complete response
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.content = data.message;
              }
              return newMessages;
            });
          } else {
            // Add new assistant message for non-streaming
            const agentResponse: Message = {
              role: 'assistant',
              content: data.message,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, agentResponse]);
          }
          
          console.log('About to check for presentation in message:', data.message.substring(0, 100) + '...');
          
          // Check if the response contains presentation content
          await checkAndGeneratePresentation(data.message);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      }
    } catch (error) {
      console.error('Error calling Jarvis API:', error);
      
      if (enableStreaming) {
        // Update the placeholder message with error
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
          return newMessages;
        });
      } else {
        // Add new error message for non-streaming
        const errorResponse: Message = {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponse]);
      }
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePresentationClick = () => {
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Main Chat Area */}
      <div className={`flex flex-col transition-all duration-300 ${showSidebar ? 'w-1/2' : 'w-full'}`}>
        {/* Header */}
        <ChatHeader 
          enableStreaming={enableStreaming}
          onStreamingToggle={setEnableStreaming}
        />

        {/* Messages Container */}
        <MessageList 
          messages={messages}
          isLoading={isLoading}
          onPresentationClick={handlePresentationClick}
        />
        
        <div ref={messagesEndRef} />

        {/* Input Area */}
        <ChatInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Right Sidebar for Presentation */}
      <Sidebar
        isVisible={showSidebar}
        onClose={handleCloseSidebar}
        presentation={generatedPresentation}
        rawMarkdown={rawMarkdown}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
} 