'use client'

import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void
  isLoading?: boolean
}

export interface SearchFilters {
  author?: string
}

export default function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [author, setAuthor] = useState('')

  // Check if author filter is active (only active filter now)
  const hasActiveFilters = !!author


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Allow search if either query is provided OR author filter is active
    if (query.trim() || hasActiveFilters) {
      onSearch(query, {
        author: author || undefined,
      })
    }
  }

  const handleClearFilters = () => {
    setAuthor('')
  }

  return (
    <div className="w-full mb-8">
      {/* Main Search Bar */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research papers by topic, author, keywords..."
            disabled={isLoading}
            className="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-accent-blue transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-accent-blue focus:ring-opacity-30"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || (!query.trim() && !hasActiveFilters)}
          className="px-6 py-3 bg-blue-600 dark:bg-accent-blue hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </span>
          ) : (
            'Search'
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-3 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          title="Toggle advanced filters"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </form>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg p-6 mb-4 animate-slide-down">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-900 dark:text-white font-semibold">Advanced Filters</h3>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Clear filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Author Filter - ONLY ACTIVE FILTER */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2 font-semibold">Author Name (Server-Side Search)</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Search by author name (e.g., John Smith, Albert Einstein)..."
                className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-accent-blue transition-all"
              />
            </div>

            {/* Disabled Filters - Greyed Out */}
            <div className="pt-4 border-t border-gray-300 dark:border-dark-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">The following filters are not yet functional with OpenAlex API and have been disabled:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50 pointer-events-none">
                {/* From Year - DISABLED */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">From Year (Disabled)</label>
                  <select
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded text-gray-600 dark:text-gray-500 cursor-not-allowed"
                  >
                    <option value="">Any Year</option>
                  </select>
                </div>

                {/* To Year - DISABLED */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">To Year (Disabled)</label>
                  <select
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded text-gray-600 dark:text-gray-500 cursor-not-allowed"
                  >
                    <option value="">Any Year</option>
                  </select>
                </div>

                {/* Keyword Filter - DISABLED */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Keyword (Disabled)</label>
                  <input
                    type="text"
                    disabled
                    placeholder="Filter by keyword..."
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded text-gray-600 dark:text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Title Filter - DISABLED */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Title Contains (Disabled)</label>
                  <input
                    type="text"
                    disabled
                    placeholder="Filter by title..."
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded text-gray-600 dark:text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
