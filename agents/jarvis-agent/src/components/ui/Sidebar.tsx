import { useState } from 'react';

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  presentation: any;
  rawMarkdown: string;
  activeTab: 'presentation' | 'markdown';
  setActiveTab: (tab: 'presentation' | 'markdown') => void;
}

export default function Sidebar({ 
  isVisible, 
  onClose, 
  presentation, 
  rawMarkdown, 
  activeTab, 
  setActiveTab 
}: SidebarProps) {
  const [isConvertingPDF, setIsConvertingPDF] = useState(false);

  if (!isVisible || !presentation) return null;

  const downloadPresentation = () => {
    const blob = new Blob([rawMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.metadata?.title || 'presentation'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = async () => {
    setIsConvertingPDF(true);
    try {
      const response = await fetch('/api/convert-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markdown: rawMarkdown,
          filename: presentation.metadata?.title || 'presentation'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${presentation.metadata?.title || 'presentation'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        alert(`Failed to convert to PDF: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error converting to PDF:', error);
      alert('Failed to convert to PDF. Please try again.');
    } finally {
      setIsConvertingPDF(false);
    }
  };

  return (
    <div className="w-1/2 border-l border-gray-200 bg-white flex flex-col">
      {/* Sidebar Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{presentation.metadata?.title}</h3>
              <p className="text-sm text-gray-500">{presentation.metadata?.slideCount} slides</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadPresentation}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download as Markdown"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              onClick={downloadAsPDF}
              disabled={isConvertingPDF}
              className={`p-2 rounded-lg transition-colors ${
                isConvertingPDF 
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                  : 'text-red-500 hover:text-red-700 hover:bg-red-50'
              }`}
              title={isConvertingPDF ? "Converting to PDF..." : "Download as PDF"}
            >
              {isConvertingPDF ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex mt-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('presentation')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'presentation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Presentation
          </button>
          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'markdown'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Markdown
          </button>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'presentation' ? (
          <div className="h-full">
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>${presentation.css}</style>
                  </head>
                  <body>${presentation.html}</body>
                </html>
              `}
              className="w-full h-full border-0"
              title="Presentation Preview"
            />
          </div>
        ) : (
          <div className="h-full bg-gray-50 relative">
            {/* Traffic Light Buttons */}
            <div className="absolute top-3 left-3 flex space-x-2 z-10">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            
            <pre className="h-full overflow-auto p-4 pt-12 text-sm font-mono text-gray-800 bg-gray-50">
              <code>{rawMarkdown}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 