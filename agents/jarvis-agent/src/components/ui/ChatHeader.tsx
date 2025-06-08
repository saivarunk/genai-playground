import Avatar from './Avatar';

interface ChatHeaderProps {
  enableStreaming?: boolean;
  onStreamingToggle?: (enabled: boolean) => void;
}

export default function ChatHeader({ enableStreaming = true, onStreamingToggle }: ChatHeaderProps) {
  return (
    <div className="border-b border-gray-200 px-4 py-3 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Jarvis AI Icon */}
          <Avatar type="assistant" size="lg" />
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Jarvis</h1>
            <p className="text-sm text-gray-500">Create presentations from your PDF files and ideas</p>
          </div>
        </div>
        
        {/* Streaming Toggle */}
        {onStreamingToggle && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Streaming:</span>
            <button
              onClick={() => onStreamingToggle(!enableStreaming)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                enableStreaming ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableStreaming ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 