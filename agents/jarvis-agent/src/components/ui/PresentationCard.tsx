interface PresentationCardProps {
  title: string;
  slideCount: number;
  createdAt?: string;
  onClick: () => void;
}

export default function PresentationCard({ title, slideCount, createdAt, onClick }: PresentationCardProps) {
  return (
    <div 
      className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{slideCount} slides • Click to view</p>
        </div>
        <div className="text-blue-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
} 