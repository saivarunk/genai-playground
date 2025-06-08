# Jarvis - AI Presentation Agent

Jarvis is an AI agent specialized in creating rich, visually appealing presentations using Marpit. It can analyze uploaded PDF files / text content and generate slide presentations with clean styling and proper structure.

## Features

- 📊 **PDF Analysis**: Upload PDFs and get key insights extracted automatically
- 🚀 **Smart Content**: Creates 4-6 well-structured slides with tables, lists, and visual elements

## Setup

### 1. Environment Configuration

Create a `.env.local` file in the project root and add your Google API key:

```env
GOOGLE_API_KEY=your_google_gemini_api_key_here
```

### 2. Get Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" 
4. Create a new API key or use an existing one
5. Copy the API key to your `.env.local` file

### 3. Install Dependencies

```bash
npm install
```

## Usage

```
npm run dev
```