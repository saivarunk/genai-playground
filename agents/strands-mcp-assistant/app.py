import os

import streamlit as st

from mcp import stdio_client, StdioServerParameters
from strands import Agent
from strands.models.anthropic import AnthropicModel
from strands.tools.mcp import MCPClient

# Initialize session state for chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Streamlit Page config
st.set_page_config(page_title="Strands + Perplexity Assistant", page_icon="🔍")
st.title("Strands + Perplexity Assistant")

# Initialize the model
@st.cache_resource
def get_model():
    return AnthropicModel(
        client_args={
            "api_key": os.getenv("ANTHROPIC_API_KEY"),
        },
        max_tokens=1028,
        model_id="claude-3-7-sonnet-20250219",
        params={
            "temperature": 0.1,
        }
    )

# Initialize MCP client
@st.cache_resource
def get_mcp_client():
    return MCPClient(lambda: stdio_client(
        StdioServerParameters(command="docker", args=[
            "run",
            "-i",
            "--rm",
            "-e",
            "PERPLEXITY_API_KEY",
            "mcp/perplexity-ask"
        ], env={"PERPLEXITY_API_KEY": os.getenv("PERPLEXITY_API_KEY")})
    ))

# Display chat messages
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Chat input
if prompt := st.chat_input("Ask me anything..."):
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Get response from agent
    with st.chat_message("assistant"):
        async def generate_response():
            model = get_model()
            with get_mcp_client() as stdio_mcp_client:
                tools = stdio_mcp_client.list_tools_sync()
                agent = Agent(model=model, tools=tools, callback_handler=None)
                agent_stream = agent.stream_async(prompt)
                async for event in agent_stream:
                    if 'data' in event:
                        yield event['data']

        # Use st.write_stream to handle the async stream
        response = st.write_stream(generate_response)
        st.session_state.messages.append({"role": "assistant", "content": response})
