'use client'

import { useState } from 'react'

interface AIDisclaimerBannerProps {
  compact?: boolean
}

export default function AIDisclaimerBanner({ compact = false }: AIDisclaimerBannerProps) {
  const [isExpanded, setIsExpanded] = useState(!compact)

  return (
    <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-700/60 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zm3 0a1 1 0 11-2 0 1 1 0 012 0zm3 0a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-blue-200">AI-Generated Analysis</h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-300 hover:text-blue-200 transition-colors"
            >
              {isExpanded ? 'Less' : 'More'}
            </button>
          </div>
          <p className="text-sm text-blue-100 mt-1">
            This analysis is AI-generated supplementary guidance, not professional expertise. Always verify findings with domain experts.
          </p>

          {isExpanded && (
            <div className="mt-3 space-y-2 text-xs text-blue-100 border-t border-blue-700/40 pt-3">
              <p>
                <span className="font-semibold text-blue-200">Confidence Levels:</span> Look for the percentage badges - higher confidence (80%+) means more reliable assessment.
              </p>
              <p>
                <span className="font-semibold text-blue-200">Show Your Work:</span> The reasoning section explains why each score was given and what evidence supports it.
              </p>
              <p>
                <span className="font-semibold text-blue-200">&quot;I Don&apos;t Know&quot;:</span> Claims marked as unverifiable indicate areas where the AI cannot reliably assess the paper.
              </p>
              <p>
                <span className="font-semibold text-blue-200">Limitations:</span> Abstract-only analysis is inherently limited. Full document review strengthens all assessments.
              </p>
              <p className="italic text-blue-50">
                This tool analyzes research credibility to help identify potential issues, but should not replace human expert judgment, peer review, or critical evaluation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
