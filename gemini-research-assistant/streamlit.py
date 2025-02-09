import streamlit as st

from core import ResearchAgent


def main():
    st.set_page_config(
        page_title="Research Report Generator",
        page_icon="📊",
        layout="wide"
    )

    # Initialize the research agent
    agent = ResearchAgent()

    # Sidebar
    with st.sidebar:
        st.title("Research Configuration")
        
        # File upload section
        st.subheader("Document Upload")
        uploaded_files = st.file_uploader(
            "Upload PDF documents for additional context",
            type=["pdf"],
            accept_multiple_files=True,
            help="Upload PDFs that contain relevant information for your research"
        )
        
        # Other sidebar inputs
        topic = st.text_input("Research Topic", "Artificial Intelligence")
        question = st.text_area("Research Question", "What are the latest developments and future trends?")
        
        depth_options = ["Basic", "Detailed", "Comprehensive"]
        depth = st.select_slider("Research Depth", options=depth_options, value="Detailed")
        
        report_type = st.selectbox(
            "Report Type",
            ["Market Analysis", "Technical Review", "Industry Overview", "Trend Analysis"]
        )

    # Main content area
    st.title("Research Report Generator")
    st.markdown("Generate comprehensive research reports powered by using RAG + Web Search + LLM")

    if st.button("Generate Report", type="primary"):
        with st.spinner("Researching and generating report..."):
            try:
                # Process uploaded documents if any
                documents = []
                if uploaded_files:
                    for file in uploaded_files:
                        documents.append(file.read())
                
                # Generate report with documents
                report_content = agent.generate_report(
                    topic=topic,
                    question=question,
                    depth=depth,
                    report_type=report_type,
                    documents=documents  # Pass the documents to the agent
                )
                
                # Display the report
                st.markdown("### Generated Report")
                st.markdown(report_content)
                
                # Generate and offer PDF download
                pdf_path = agent.save_as_pdf(report_content)
                
                with open(pdf_path, "rb") as pdf_file:
                    st.download_button(
                        label="Download PDF Report",
                        data=pdf_file,
                        file_name=f"research_report_{topic.lower().replace(' ', '_')}.pdf",
                        mime="application/pdf"
                    )
                
            except Exception as e:
                st.error(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
