# Research Assistant with LangChain and Gemini

A powerful research assistant powered by LangChain and Google's Gemini 2.0 Flash model that helps generate comprehensive research reports by combining web search, document analysis, and AI-driven insights.

## Features

- 🔍 **Web Search Integration**: Utilizes Tavily Search API for real-time web research
- 📄 **Document Analysis**: Process and analyze uploaded PDF documents
- 🤖 **AI-Powered Analysis**: Leverages Google's Gemini 2.0 Flash model for intelligent synthesis
- 📊 **Professional Reports**: Generates well-structured reports in both Markdown and PDF formats
- 🌐 **Interactive Web Interface**: Built with Streamlit for easy user interaction

## Prerequisites

- Python 3.7+
- Google API Key (for Gemini 2.0 Flash)
- Tavily API Key (for web search)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd gemini-research-assistant
```

2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the project root with the following:
```
GOOGLE_API_KEY=your_google_api_key
TAVILY_API_KEY=your_tavily_api_key
```

## Usage

1. Start the Streamlit application:
```bash
streamlit run streamlit.py
```

2. Access the web interface through your browser (typically at `http://localhost:8501`)

3. Configure your research:
   - Enter your research topic and question
   - Upload relevant PDF documents (optional)
   - Select research depth and report type
   - Click "Generate Report" to start the process

## Features in Detail

### Research Configuration
- **Topic & Question**: Define your research focus
- **Document Upload**: Add context through PDF documents
- **Research Depth**: Choose between Basic, Detailed, or Comprehensive analysis
- **Report Types**: Select from Market Analysis, Technical Review, Industry Overview, or Trend Analysis

### Report Generation
The assistant generates structured reports including:
- Executive Summary
- Key Findings
- Detailed Analysis
- Market Implications
- Recommendations
- Conclusion
- References with citations

### Output Formats
- Markdown format for immediate viewing
- Downloadable PDF with professional formatting

## Architecture

The project consists of two main components:
1. `core.py`: Contains the ResearchAgent class that handles:
   - Document processing
   - Web search integration
   - LLM interactions
   - Report generation
   
2. `streamlit.py`: Provides the web interface for:
   - User input collection
   - File uploads
   - Report display and download

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Dependencies

Key dependencies include:
- streamlit
- langchain
- langgraph
- google-generativeai
- tavily-python
- weasyprint
- pypdf
- markdown

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Todo
- Robust source and citation attribution
- Add support for image generation for any data points
- Add ability to add links for context