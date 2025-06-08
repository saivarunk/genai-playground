import { StateGraph, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { GoogleGenAI } from "@google/genai";

// Define the agent state
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  currentTask: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  files: Annotation<any[]>({
    reducer: (x, y) => y ?? x,
  }),
});

// Initialize Gemini model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-preview-05-20",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Initialize Google AI client for file uploads
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

// System prompt for Jarvis
const SYSTEM_PROMPT = `You are Jarvis, an AI assistant specialized in creating rich, visually appealing presentations using advanced Marpit features.

Your capabilities include:
- Analyzing uploaded PDF files and extracting key insights
- Creating structured, professional presentations with advanced styling
- Using tables, charts, and visual elements effectively
- Applying modern CSS themes and layouts
- Generating comprehensive slide content with visual hierarchy

When users ask for presentations:
1. Provide a brief explanation of what you're creating (1-2 sentences)
2. Generate a complete presentation using advanced Marpit features

PRESENTATION FORMATTING: Structure your response as:

Provide a brief explanation of what you're creating (1-2 sentences)

PRESENTATION_START
---
theme: default
paginate: true
style: |
  section {
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    margin: 10px 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
---

# 📊 [Presentation Title]

**Author:** Jarvis AI  
**Date:** ${new Date().toLocaleDateString()}

---

## 🎯 Key Insights

### Primary Finding
**Main insight or conclusion from the analysis**

- **Critical Point:** Detailed explanation with impact
- **Supporting Evidence:** Data-backed observation  
- **Strategic Implication:** What this means for the business

---

## 📊 Executive Summary

| Metric | Current | Target | Status |
|--------|---------|--------|---------|
| Performance | 85% | 90% | ⚠️ Monitor |
| Growth | +12% | +15% | ✅ On Track |
| Efficiency | 92% | 95% | ❌ Below Target |

**Key Takeaway:** Brief summary of the most important finding from the data analysis.

---

## 💡 Strategic Recommendations

### Immediate Actions
- Priority initiative with clear ownership
- Quick win opportunity  
- Risk mitigation step

### Long-term Strategy
- Vision-aligned objective
- Investment opportunity
- Innovation pathway

---

## 🚀 Next Steps

1. **Phase 1:** Implementation timeline
2. **Phase 2:** Monitoring and adjustment
3. **Phase 3:** Scale and optimize

### Success Metrics:
- KPI 1: Target value
- KPI 2: Target value
- KPI 3: Target value

PRESENTATION_END

When creating presentations, ensure proper structure with exactly 4-6 slides to avoid empty slides. Focus on concise, well-formatted content that fits within slide boundaries.`;

// Agent functions
async function processMessage(state: typeof AgentState.State) {
  const messages = state.messages;
  const files = state.files || [];
  const lastMessage = messages[messages.length - 1];
  
  try {
    // If we have files, use the direct Google AI client for file upload support
    if (files.length > 0) {
      console.log('Processing message with files:', files.length);
      
      // Upload files to Gemini using the new SDK
      const uploadedFiles = [];
      const fileParts = [];
      
      for (const file of files) {
        if (file.path) {
          try {
            console.log('Uploading file to Gemini:', file.name);
            
            // Upload file using the new SDK
            const uploadedFile = await genAI.files.upload({
              file: file.path,
              config: { 
                mimeType: file.mimeType || 'application/pdf',
                displayName: file.name
              }
            });
            
            console.log('File uploaded successfully:', uploadedFile.name);
            
            // Add the file part for the content generation
            fileParts.push({
              fileData: {
                mimeType: uploadedFile.mimeType,
                fileUri: uploadedFile.uri
              }
            });
            
            uploadedFiles.push(uploadedFile.name);
          } catch (uploadError) {
            console.error('Error uploading file to Gemini:', uploadError);
            // Fallback to file info
            uploadedFiles.push(`File: ${file.name} (${file.type}, ${file.size} bytes) - could not process`);
          }
        }
      }
      
      // Create prompt with conversation history
      const conversationText = messages.map(msg => {
        if (msg instanceof HumanMessage) {
          return `User: ${msg.content}`;
        } else {
          return `Assistant: ${msg.content}`;
        }
      }).join('\n\n');
      
      const textPrompt = `${SYSTEM_PROMPT}\n\nConversation:\n${conversationText}`;
      
      // Generate content with files using the new SDK
      const contents = [
        ...fileParts,
        { text: textPrompt }
      ];
      
      const result = await genAI.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: [{
          role: 'user',
          parts: contents
        }]
      });
      
      const responseText = result.text || "I was unable to process the uploaded file. Please try again.";
      
      return {
        messages: [new AIMessage(responseText)],
        currentTask: "responding",
      };
    } else {
      // No files - use the standard LangChain approach
      const systemMessage = new HumanMessage(SYSTEM_PROMPT);
      const conversationMessages = [systemMessage, ...messages];
      
      const response = await model.invoke(conversationMessages);
      
      return {
        messages: [response],
        currentTask: "responding",
      };
    }
  } catch (error) {
    console.error("Error in Gemini API call:", error);
    return {
      messages: [new AIMessage("I apologize, but I'm having trouble processing your request right now. Please try again.")],
      currentTask: "error",
    };
  }
}

// Create the graph
const workflow = new StateGraph(AgentState)
  .addNode("process_message", processMessage)
  .addEdge("__start__", "process_message")
  .addEdge("process_message", "__end__");

// Compile the graph
export const jarvisAgent = workflow.compile();

// Helper function to convert message format
function convertToLangChainMessages(messages: Array<{role: string, content: string}>) {
  return messages.map(msg => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });
}

// Helper function to run the agent
export async function runJarvisAgent(input: string | Array<{role: string, content: string, attachments?: any[]}>) {
  let messages: BaseMessage[];
  let files: any[] = [];
  
  if (typeof input === 'string') {
    // Single message (backward compatibility)
    messages = [new HumanMessage(input)];
  } else {
    // Full conversation history
    messages = convertToLangChainMessages(input);
    
    // Extract files from the last message with attachments
    const lastMessageWithFiles = input.reverse().find(msg => msg.attachments && msg.attachments.length > 0);
    if (lastMessageWithFiles) {
      files = lastMessageWithFiles.attachments || [];
      console.log('Found files in conversation:', files.map(f => f.name));
    }
  }
  
  const initialState = {
    messages: messages,
    currentTask: "processing",
    files: files,
  };
  
  const result = await jarvisAgent.invoke(initialState);
  return result;
}

// Helper function to run the agent with streaming
export async function* runJarvisAgentStream(input: string | Array<{role: string, content: string, attachments?: any[]}>) {
  let messages: BaseMessage[];
  let files: any[] = [];
  
  if (typeof input === 'string') {
    // Single message (backward compatibility)
    messages = [new HumanMessage(input)];
  } else {
    // Full conversation history
    messages = convertToLangChainMessages(input);
    
    // Extract files from the last message with attachments
    const lastMessageWithFiles = input.reverse().find(msg => msg.attachments && msg.attachments.length > 0);
    if (lastMessageWithFiles) {
      files = lastMessageWithFiles.attachments || [];
      console.log('Found files in conversation:', files.map(f => f.name));
    }
  }
  
  try {
    // If we have files, use the direct Google AI client for file upload support
    if (files.length > 0) {
      console.log('Processing message with files for streaming:', files.length);
      
      // Upload files to Gemini using the new SDK
      const fileParts = [];
      
      for (const file of files) {
        if (file.path) {
          try {
            console.log('Uploading file to Gemini:', file.name);
            
            // Upload file using the new SDK
            const uploadedFile = await genAI.files.upload({
              file: file.path,
              config: { 
                mimeType: file.mimeType || 'application/pdf',
                displayName: file.name
              }
            });
            
            console.log('File uploaded successfully:', uploadedFile.name);
            
            // Add the file part for the content generation
            fileParts.push({
              fileData: {
                mimeType: uploadedFile.mimeType,
                fileUri: uploadedFile.uri
              }
            });
          } catch (uploadError) {
            console.error('Error uploading file to Gemini:', uploadError);
            yield `Error processing file: ${file.name}. `;
          }
        }
      }
      
      // Create prompt with conversation history
      const conversationText = messages.map(msg => {
        if (msg instanceof HumanMessage) {
          return `User: ${msg.content}`;
        } else {
          return `Assistant: ${msg.content}`;
        }
      }).join('\n\n');
      
      const textPrompt = `${SYSTEM_PROMPT}\n\nConversation:\n${conversationText}`;
      
      // Generate content with files using the new SDK (streaming)
      const contents = [
        ...fileParts,
        { text: textPrompt }
      ];
      
      const result = await genAI.models.generateContentStream({
        model: 'gemini-2.0-flash-001',
        contents: [{
          role: 'user',
          parts: contents
        }]
      });
      
      // Stream the response
      for await (const chunk of result) {
        const chunkText = chunk.text;
        if (chunkText) {
          yield chunkText;
        }
      }
    } else {
      // No files - use the standard LangChain approach with streaming
      const systemMessage = new HumanMessage(SYSTEM_PROMPT);
      const conversationMessages = [systemMessage, ...messages];
      
      // Use streaming with LangChain
      const stream = await model.stream(conversationMessages);
      
      for await (const chunk of stream) {
        if (chunk.content) {
          yield chunk.content.toString();
        }
      }
    }
  } catch (error) {
    console.error("Error in streaming Gemini API call:", error);
    yield "I apologize, but I'm having trouble processing your request right now. Please try again.";
  }
}