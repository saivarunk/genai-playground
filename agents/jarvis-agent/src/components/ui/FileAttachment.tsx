import { FileAttachment as FileAttachmentType } from '@/lib/types';

interface FileAttachmentProps {
  attachment: FileAttachmentType;
}

export default function FileAttachment({ attachment }: FileAttachmentProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    return (
      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    );
  };

  return (
    <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 mb-2 max-w-xs">
      {getFileIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
      </div>
    </div>
  );
} 