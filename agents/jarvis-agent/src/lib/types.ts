export interface AgentState {
  messages: Message[];
  files: File[];
  currentPresentation?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
}

export interface File {
  name: string;
  type: string;
  content: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  content?: string; // For backward compatibility
  path?: string; // File path for Gemini upload
  mimeType?: string; // MIME type for Gemini
}

export interface PresentationConfig {
  theme?: string;
  size?: string;
  orientation?: 'portrait' | 'landscape';
} 