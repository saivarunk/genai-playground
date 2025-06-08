export default function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-16">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Jarvis</h2>
      <p className="text-gray-600 text-center max-w-md">
        Upload your files and describe what kind of presentation you'd like to create. I'll help you generate beautiful, professional slide presentations.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">📊 Data Analysis</h3>
          <p className="text-sm text-gray-600">Upload spreadsheets and create data-driven presentations</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">📄 Document Summary</h3>
          <p className="text-sm text-gray-600">Transform documents into compelling slide decks</p>
        </div>
      </div>
    </div>
  );
} 