interface AvatarProps {
  type: 'user' | 'assistant';
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ type, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  if (type === 'user') {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm`}>
        <span className="text-white text-sm font-medium">U</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm`}>
      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Central eye/vision element */}
        <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.9"/>
        
        {/* Surrounding neural network nodes */}
        <circle cx="7" cy="7" r="1" fill="currentColor" opacity="0.7"/>
        <circle cx="17" cy="7" r="1" fill="currentColor" opacity="0.7"/>
        <circle cx="7" cy="17" r="1" fill="currentColor" opacity="0.7"/>
        <circle cx="17" cy="17" r="1" fill="currentColor" opacity="0.7"/>
        
        {/* Connection lines */}
        <path d="M8 8L10.5 10.5" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
        <path d="M16 8L13.5 10.5" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
        <path d="M8 16L10.5 13.5" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
        <path d="M16 16L13.5 13.5" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
        
        {/* Scanning lines */}
        <path d="M12 4L12 6" stroke="currentColor" strokeWidth="1" opacity="0.5" strokeLinecap="round"/>
        <path d="M12 18L12 20" stroke="currentColor" strokeWidth="1" opacity="0.5" strokeLinecap="round"/>
        <path d="M4 12L6 12" stroke="currentColor" strokeWidth="1" opacity="0.5" strokeLinecap="round"/>
        <path d="M18 12L20 12" stroke="currentColor" strokeWidth="1" opacity="0.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
} 