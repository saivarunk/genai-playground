# Strands + MCP Example

This project demonstrates the integration of Strands Agentic SDK with the Model Context Protocol (MCP) using Perplexity's MCP server and Anthropic's Claude LLM. It showcases how to build an AI agent that leverages both technologies for enhanced context-aware responses.

## Prerequisites

- Docker
- Node.js and npm
- Anthropic API key
- Perplexity (Sonar) API key

## Setup Instructions

### Step 1: Setup Perplexity MCP Server

1. Clone the Perplexity MCP repository:
```bash
git clone git@github.com:ppl-ai/modelcontextprotocol.git
```

2. Navigate to the perplexity-ask directory and install dependencies:
```bash
cd modelcontextprotocol/perplexity-ask
npm install
```

3. Build the Docker container:
```bash
docker build -t mcp/perplexity-ask:latest -f Dockerfile .
```

### Step 2: Configure API Keys

1. **Anthropic API Key**
   - Sign up for an Anthropic account at [anthropic.com](https://anthropic.com)
   - Generate your API key from the dashboard
   - Set the environment variable:
   ```bash
   export ANTHROPIC_API_KEY='your-api-key'
   ```

2. **Perplexity (Sonar) API Key**
   - Sign up for a Sonar API account
   - Generate your API key from the developer dashboard
   - Set the environment variable:
   ```bash
   export PERPLEXITY_API_KEY='your-api-key'
   ```

## Usage

```bash
streamlit run app.py
```
This should start the Streamlit App and 