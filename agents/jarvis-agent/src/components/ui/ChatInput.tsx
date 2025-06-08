import { useRef } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export default function ChatInput({ input, setInput, isLoading, onSubmit, onKeyDown }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={onSubmit}>
          <div className="relative flex items-end bg-white border border-gray-300 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:shadow-md focus-within:border-blue-500">
            {/* File Upload Button */}
            <button
              type="button"
              className="flex-shrink-0 p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-l-2xl hover:bg-gray-50"
              title="Upload files"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={onKeyDown}
              placeholder="Message Jarvis..."
              className="flex-1 resize-none border-0 bg-transparent px-3 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 max-h-48 min-h-[20px]"
              rows={1}
              disabled={isLoading}
              style={{ lineHeight: '1.5' }}
            />
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`flex-shrink-0 m-2 p-2 rounded-lg transition-all duration-200 ${
                input.trim() && !isLoading
                  ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-500">
              Press <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">⏎</kbd> to send, 
              <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded ml-1">⇧⏎</kbd> for new line
            </span>
          </div>
        </form>
      </div>
    </div>
  );
} 