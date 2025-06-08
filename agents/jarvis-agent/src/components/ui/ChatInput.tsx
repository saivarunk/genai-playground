import { useRef, useState } from 'react';
import { FileAttachment } from '@/lib/types';
import FileAttachmentComponent from './FileAttachment';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent, attachments?: FileAttachment[]) => Promise<void> | void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export default function ChatInput({ input, setInput, isLoading, onSubmit, onKeyDown }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    const newAttachments: FileAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Basic validation
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      const allowedTypes = [
        'application/pdf'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not supported. Only PDF files are accepted. For spreadsheets or data files, please convert them to PDF first.`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          newAttachments.push(result.file);
        } else {
          alert(`Error uploading ${file.name}: ${result.error}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Error uploading ${file.name}`);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    setIsUploading(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset the input
    e.target.value = '';
  };

  const handleSubmitWithAttachments = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting with attachments:', attachments.length);
    console.log('Attachment details:', attachments.map(att => ({ 
      name: att.name, 
      type: att.type, 
      hasPath: !!att.path,
      hasContent: !!att.content,
      mimeType: att.mimeType
    })));
    
    const attachmentsCopy = [...attachments]; // Make a copy before clearing
    setAttachments([]); // Clear attachments from UI immediately
    
    try {
      await onSubmit(e, attachmentsCopy);
    } catch (error) {
      console.error('Submit error:', error);
      // If submission fails, restore the attachments
      setAttachments(attachmentsCopy);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Create a synthetic form event and call our submit handler
      const syntheticEvent = new Event('submit') as any;
      handleSubmitWithAttachments(syntheticEvent);
    } else {
      // For other keys, call the parent's handler
      onKeyDown(e);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* File Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Attached Files:</span>
            </div>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between">
                  <FileAttachmentComponent attachment={attachment} />
                  <button
                    type="button"
                    onClick={() => removeAttachment(attachment.id)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitWithAttachments}>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div className={`relative flex items-end bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 focus-within:shadow-md ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50 shadow-md' 
              : 'border-gray-300 focus-within:border-blue-500'
          }`}>
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isLoading}
              className={`flex-shrink-0 p-3 transition-colors rounded-l-2xl ${
                isUploading || isLoading
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              title="Upload PDF files"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
            </button>
            
            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                placeholder={isDragOver ? "Drop PDF files here..." : "Message Jarvis..."}
                className="w-full resize-none border-0 bg-transparent px-3 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 max-h-48 min-h-[20px]"
                rows={1}
                disabled={isLoading}
                style={{ lineHeight: '1.5' }}
              />
              {isDragOver && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg px-4 py-2">
                    <p className="text-blue-700 text-sm font-medium">Drop PDF files here</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || isLoading || isUploading}
              className={`flex-shrink-0 m-2 p-2 rounded-lg transition-all duration-200 ${
                (input.trim() || attachments.length > 0) && !isLoading && !isUploading
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
              <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded ml-1">⇧⏎</kbd> for new line, 
              or drag & drop PDF files
            </span>
          </div>
        </form>
      </div>
    </div>
  );
} 