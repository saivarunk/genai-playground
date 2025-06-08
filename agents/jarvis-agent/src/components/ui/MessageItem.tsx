import { Message } from '@/lib/types';
import Avatar from './Avatar';
import PresentationCard from './PresentationCard';
import FileAttachment from './FileAttachment';

interface MessageItemProps {
  message: Message;
  onPresentationClick: () => void;
}

export default function MessageItem({ message, onPresentationClick }: MessageItemProps) {
  const isPresentationCard = message.content.startsWith('PRESENTATION_CARD:');

  return (
    <div className={`py-6 ${message.role === 'assistant' ? 'bg-gray-50' : ''}`}>
      <div className="max-w-4xl mx-auto px-4 flex gap-4">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center">
          <Avatar type={message.role === 'user' ? 'user' : 'assistant'} />
        </div>
        
        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* File Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 space-y-1">
              {message.attachments.map((attachment) => (
                <FileAttachment key={attachment.id} attachment={attachment} />
              ))}
            </div>
          )}
          
          {isPresentationCard ? (
            (() => {
              const cardData = JSON.parse(message.content.replace('PRESENTATION_CARD:', ''));
              return (
                <PresentationCard
                  title={cardData.title}
                  slideCount={cardData.slideCount}
                  createdAt={cardData.createdAt}
                  onClick={onPresentationClick}
                />
              );
            })()
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
} 