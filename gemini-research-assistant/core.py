import os
import datetime
import tempfile

import markdown
from io import BytesIO

from typing import List, TypedDict
from pathlib import Path
from pypdf import PdfReader
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.tools import Tool
from langchain_community.tools import TavilySearchResults
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolExecutor

from weasyprint import HTML
from weasyprint.text.fonts import FontConfiguration

load_dotenv()

if "GOOGLE_API_KEY" not in os.environ:
    raise ValueError("GOOGLE_API_KEY is not set")

if "TAVILY_API_KEY" not in os.environ:
    raise ValueError("TAVILY_API_KEY is not set")

class InputSchema(TypedDict):
    messages: List
    research_query: str
    report_type: str
    research_results: str
    depth: str
    documents: List[bytes]

class OutputSchema(TypedDict, total=False):
    messages: List
    research_query: str
    report_type: str
    depth: str
    research_results: str
    final_report: str

class ResearchAgent:
    def __init__(self):
        # Initialize Gemini model
        self.llm = ChatGoogleGenerativeAI(model="models/gemini-2.0-flash")
        
        # Initialize tools
        self.tools = [
            Tool(
                name="web_search",
                func=TavilySearchResults(api_key=os.getenv("TAVILY_API_KEY")).run,
                description="Search the web for current information"
            )
        ]
        
        # Create tool executor
        self.tool_executor = ToolExecutor(self.tools)
        
        # Build the agent graph
        self.workflow = self._build_workflow()

    def _extract_pdf_text(self, pdf_file) -> str:
        """Extract text from a PDF file."""
        try:
            pdf_reader = PdfReader(BytesIO(pdf_file))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
            return ""

    def _build_workflow(self) -> StateGraph:
        # Define the schema for state
        workflow = StateGraph(
            input=InputSchema,
            output=OutputSchema
        )

        # Define node functions
        def research_node(state):
            # Process PDF documents if available
            documents = state.get("documents", [])
            document_context = ""
            if documents:
                for doc in documents:
                    extracted_text = self._extract_pdf_text(doc)
                    document_context += extracted_text + "\n\n"
            
            # Execute web search
            search_tool = self.tools[0]
            search_results = search_tool.run(state["research_query"])
            formatted_results = "\n".join([
                f"URL: {result['url']}\n"
                f"Content: {result['content']}\n"
                for result in search_results
            ])

            # Create messages list with documents and search results
            messages = [
                SystemMessage(content="You are a professional research analyst from a top consulting firm.")
            ]
            
            # Add document context if available
            if document_context:
                messages.append(HumanMessage(
                    content=f"Here are some relevant documents to consider:\n\n{document_context}"
                ))
            
            # Add search results and research prompt
            research_prompt = self._create_research_prompt(formatted_results)
            messages.append(HumanMessage(content=research_prompt))

            # Get response from LLM
            response = self.llm.invoke(messages)
            state["research_results"] = response.content
            return state

        def report_generation_node(state):
            # Generate professional report
            report_prompt = self._create_report_prompt(
                state.get("research_results", "No research results available"),
                state["report_type"]
            )
            
            response = self.llm.invoke([
                SystemMessage(content="You are a senior consultant writing a professional report."),
                HumanMessage(content=report_prompt)
            ])
            
            state["final_report"] = response.content
            return state

        # Add nodes to workflow
        workflow.add_node("research", research_node)
        workflow.add_node("report_generation", report_generation_node)

        # Add edges
        workflow.add_edge("research", "report_generation")
        workflow.add_edge("report_generation", END)

        # Set entry point
        workflow.set_entry_point("research")

        # Compile and create executable workflow
        return workflow.compile()

    def _create_research_prompt(self, search_results: str) -> str:
        return f"""
        Analyze the following search results and synthesize key findings:
        {search_results}
        
        Focus on:
        1. Key trends and patterns
        2. Market dynamics
        3. Critical insights
        4. Data points and statistics
        5. Expert opinions and analysis
        
        Provide a comprehensive analysis that can be used for a professional report.
        """

    def _create_report_prompt(self, research_results: str, report_type: str) -> str:
        return f"""
        Create a professional consulting report based on the following research:
        {research_results}
        
        Report Type: {report_type}
        
        Format the report with:
        1. Executive Summary
        2. Key Findings
        3. Detailed Analysis
        4. Market Implications
        5. Recommendations
        6. Conclusion
        7. References with citations and url if available
        
        Instructions:
        - Include specific data points and insights.
        - Make it actionable and valuable for decision-makers.
        - The report format is in markdown and intended to be used in a PDF document.
        - Don't include headers like Date, To, From, etc.
        - Don't include any headers like ```markdown
        """

    def generate_report(self, topic: str, question: str, depth: str, report_type: str, documents: List[bytes] = None) -> str:
        # Prepare initial state
        initial_state = {
            "messages": [],
            "research_query": f"{topic}: {question}",
            "report_type": report_type,
            "depth": depth,
            "documents": documents or []
        }
        
        # Execute workflow
        final_state = self.workflow.batch([initial_state])[0]
        
        return final_state["final_report"]

    def save_as_pdf(self, content: str) -> Path:
        # Create temporary file
        temp_dir = Path(tempfile.gettempdir())
        output_path = temp_dir / f"research_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        # Convert markdown to HTML
        html = markdown.markdown(content, extensions=['extra'])
        
        # Add some basic styling
        styled_html = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 2cm; font-size: 12px; }}
                    h1 {{ font-size: 20px; color: #333; }}
                    h2 {{ font-size: 16px; color: #444; }}
                    p {{ line-height: 1.6; }}
                    ul {{ margin-left: 0px; }}
                    li {{ margin-bottom: 8px; }}
                </style>
            </head>
            <body>
                <h1>Research Report</h1>
                {html}
            </body>
        </html>
        """
        
        # Generate PDF
        font_config = FontConfiguration()
        HTML(string=styled_html).write_pdf(
            output_path,
            font_config=font_config
        )
        
        return output_path
