import Avatar from './Avatar';

export default function LoadingIndicator() {
  return (
    <div className="py-6 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 flex gap-4">
        <Avatar type="assistant" />
        <div className="flex-1">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
} 