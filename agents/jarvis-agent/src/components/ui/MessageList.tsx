import { Message } from '@/lib/types';
import MessageItem from './MessageItem';
import WelcomeScreen from './WelcomeScreen';
import LoadingIndicator from './LoadingIndicator';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onPresentationClick: () => void;
}

export default function MessageList({ messages, isLoading, onPresentationClick }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className="py-8">
            {messages.map((message, index) => (
              <MessageItem
                key={index}
                message={message}
                onPresentationClick={onPresentationClick}
              />
            ))}
            
            {/* Loading indicator */}
            {isLoading && <LoadingIndicator />}
          </div>
        )}
      </div>
    </div>
  );
} 