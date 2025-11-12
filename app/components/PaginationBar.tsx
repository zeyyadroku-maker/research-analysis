'use client'

interface PaginationBarProps {
  currentPage: number
  totalPages: number
  hasMore: boolean
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export default function PaginationBar({
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  isLoading = false,
}: PaginationBarProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    // Enable next if either hasMore is true OR currentPage < totalPages
    const canGoNext = hasMore || (totalPages > 0 && currentPage < totalPages)
    if (canGoNext) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value, 10)
    if (page > 0 && (totalPages === 0 || page <= totalPages)) {
      onPageChange(page)
    }
  }

  const canGoNext = hasMore || (totalPages > 0 && currentPage < totalPages)

  return (
    <div className="flex items-center justify-between gap-4 bg-dark-800 border border-dark-700 rounded-lg p-4 mt-6">
      <div className="flex items-center gap-2">
        {/* Only show Previous button if not on first page */}
        {currentPage > 1 && (
          <button
            onClick={handlePrevious}
            disabled={isLoading}
            className="px-4 py-2 rounded bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-200 hover:text-white"
          >
            ← Previous
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canGoNext || isLoading}
          className="px-4 py-2 rounded bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-200 hover:text-white"
        >
          Next →
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-300">
        <span>Page</span>
        <input
          type="number"
          min="1"
          value={currentPage}
          onChange={handlePageInput}
          disabled={isLoading}
          className="w-12 px-2 py-1 rounded bg-dark-700 border border-dark-600 text-white text-center disabled:opacity-50"
        />
        {totalPages > 0 && <span>of {totalPages}</span>}
        {totalPages === 0 && hasMore && <span>(more available)</span>}
      </div>

      <div className="text-sm text-gray-400">
        {isLoading && <span className="text-accent-blue">Loading...</span>}
      </div>
    </div>
  )
}
