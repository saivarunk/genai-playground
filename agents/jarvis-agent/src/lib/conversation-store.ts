interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

class ConversationStore {
  private conversations: Map<string, Conversation> = new Map();
  private readonly maxConversations = 100; // Limit to prevent memory issues
  private readonly maxAge = 24 * 60 * 60 * 1000; // 24 hours

  generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  createConversation(): string {
    const id = this.generateId();
    const conversation: Conversation = {
      id,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.conversations.set(id, conversation);
    this.cleanup(); // Clean up old conversations
    return id;
  }

  addMessage(conversationId: string, message: ConversationMessage): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.messages.push(message);
    conversation.updatedAt = new Date();
  }

  getConversation(conversationId: string): Conversation | undefined {
    return this.conversations.get(conversationId);
  }

  getMessages(conversationId: string): ConversationMessage[] {
    const conversation = this.conversations.get(conversationId);
    return conversation?.messages || [];
  }

  private cleanup(): void {
    const now = Date.now();
    const conversations = Array.from(this.conversations.entries());
    
    // Remove conversations older than maxAge
    for (const [id, conversation] of conversations) {
      if (now - conversation.updatedAt.getTime() > this.maxAge) {
        this.conversations.delete(id);
      }
    }

    // If still too many, remove oldest ones
    if (this.conversations.size > this.maxConversations) {
      const sortedConversations = conversations
        .sort((a, b) => a[1].updatedAt.getTime() - b[1].updatedAt.getTime())
        .slice(0, this.conversations.size - this.maxConversations);
      
      for (const [id] of sortedConversations) {
        this.conversations.delete(id);
      }
    }
  }
}

// Export singleton instance
export const conversationStore = new ConversationStore();
export type { ConversationMessage, Conversation }; 