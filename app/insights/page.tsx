'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookmarkedPaper } from '@/app/types'
import Navigation from '@/app/components/Navigation'
import { getNormalizedScore } from '@/app/lib/scoreUtils'

export default function InsightsPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedPaper[]>([])
  const [loading, setLoading] = useState(true)

  // Load bookmarks from localStorage
  const loadBookmarks = () => {
    try {
      const stored = localStorage.getItem('research_analysis_bookmarks')
      if (stored) {
        setBookmarks(JSON.parse(stored))
      } else {
        setBookmarks([])
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
      setBookmarks([])
    }
  }

  useEffect(() => {
    // Initial load
    loadBookmarks()
    setLoading(false)

    // Listen for storage changes (from other tabs or same tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'research_analysis_bookmarks') {
        loadBookmarks()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Calculate statistics
  const stats = {
    totalPapers: bookmarks.length,
    avgCredibility: bookmarks.length > 0
      ? (bookmarks.reduce((sum, b) => sum + getNormalizedScore(b.analysis.credibility.totalScore, b.analysis.credibility.maxTotalScore), 0) / bookmarks.length).toFixed(2)
      : '0.00',
    avgBiasLevel: bookmarks.length > 0
      ? bookmarks.filter(b => b.analysis.bias.overallLevel === 'High').length / bookmarks.length * 100
      : 0,
    byField: {} as Record<string, number>,
    byDocType: {} as Record<string, number>,
    credibilityDistribution: {
      exemplary: bookmarks.filter(b => b.analysis.credibility.rating === 'Exemplary').length,
      strong: bookmarks.filter(b => b.analysis.credibility.rating === 'Strong').length,
      moderate: bookmarks.filter(b => b.analysis.credibility.rating === 'Moderate').length,
      weak: bookmarks.filter(b => b.analysis.credibility.rating === 'Weak').length,
      veryPoor: bookmarks.filter(b => b.analysis.credibility.rating === 'Very Poor').length,
    },
  }

  // Count by field and document type
  bookmarks.forEach(b => {
    const field = b.analysis.paper.field || 'Unknown'
    const docType = b.analysis.paper.documentType || 'Unknown'
    stats.byField[field] = (stats.byField[field] || 0) + 1
    stats.byDocType[docType] = (stats.byDocType[docType] || 0) + 1
  })

  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Analysis Insights</h2>
          <p className="text-gray-600 dark:text-gray-400">Statistics and insights from your bookmarked research papers</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading insights...
            </div>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v16a2 2 0 0 0 2 2h16"/>
              <rect x="7" y="13" width="9" height="4" rx="1"/>
              <rect x="7" y="5" width="12" height="4" rx="1"/>
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No bookmarks yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start analyzing papers to see insights here</p>
            <Link href="/" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Explore Papers
            </Link>
          </div>
        ) : (
          <>
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {/* Total Papers */}
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Papers</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPapers}</p>
                  </div>
                  <div className="text-4xl text-blue-200 dark:text-dark-600">📚</div>
                </div>
              </div>

              {/* Average Credibility */}
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg Credibility</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-accent-blue">{stats.avgCredibility}/10</p>
                  </div>
                  <div className="text-4xl text-blue-200 dark:text-dark-600">⭐</div>
                </div>
              </div>

              {/* High Bias Papers */}
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">High Bias Papers</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{Math.round(stats.avgBiasLevel)}%</p>
                  </div>
                  <div className="text-4xl text-orange-200 dark:text-dark-600">⚠️</div>
                </div>
              </div>

              {/* Unique Fields */}
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Unique Fields</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{Object.keys(stats.byField).length}</p>
                  </div>
                  <div className="text-4xl text-green-200 dark:text-dark-600">🔬</div>
                </div>
              </div>
            </div>

            {/* Credibility Distribution and Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {/* Credibility Distribution */}
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Credibility Distribution</h3>
                <div className="grid grid-cols-5 gap-3">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.credibilityDistribution.exemplary}</p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">Exemplary</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.credibilityDistribution.strong}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Strong</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.credibilityDistribution.moderate}</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">Moderate</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-700">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.credibilityDistribution.weak}</p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Weak</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.credibilityDistribution.veryPoor}</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">Very Poor</p>
                  </div>
                </div>
              </div>

              {/* Field Distribution */}
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">By Academic Field</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {Object.entries(stats.byField)
                    .sort(([, a], [, b]) => b - a)
                    .map(([field, count]) => (
                      <div key={field} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-dark-700 rounded">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{field}</span>
                        <span className="ml-2 text-sm font-semibold text-blue-600 dark:text-accent-blue">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Recent Papers */}
            <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Bookmarks</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bookmarks
                  .sort((a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime())
                  .slice(0, 10)
                  .map((paper) => (
                    <div key={paper.id} className="flex justify-between items-start p-3 bg-gray-100 dark:bg-dark-700 rounded border border-gray-300 dark:border-dark-600">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{paper.analysis.paper.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {paper.analysis.paper.authors.slice(0, 2).join(', ')}
                          {paper.analysis.paper.authors.length > 2 && ' +more'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600 dark:text-accent-blue">
                            {getNormalizedScore(paper.analysis.credibility.totalScore, paper.analysis.credibility.maxTotalScore).toFixed(1)}/10
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{paper.analysis.credibility.rating}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
