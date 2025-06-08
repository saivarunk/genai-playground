import Avatar from './Avatar';

export default function ChatHeader() {
  return (
    <div className="border-b border-gray-200 px-4 py-3 bg-white">
      <div className="flex items-center space-x-3">
        {/* Jarvis AI Icon */}
        <Avatar type="assistant" size="lg" />
        
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Jarvis</h1>
          <p className="text-sm text-gray-500">Create presentations from your files and ideas</p>
        </div>
      </div>
    </div>
  );
} 