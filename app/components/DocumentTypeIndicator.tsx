'use client'

import { DocumentType } from '@/app/lib/adaptiveFramework'

interface DocumentTypeIndicatorProps {
  documentType?: DocumentType
  documentTypeString?: string // Direct document type from OpenAlex
  field?: string // OpenAlex field (takes precedence)
  subfield?: string // OpenAlex subfield
  domain?: string // OpenAlex domain
  compact?: boolean
}

const documentTypeLabels: Record<string, { label: string; color: string }> = {
  article: { label: 'Research Article', color: 'bg-blue-500' },
  review: { label: 'Literature Review', color: 'bg-purple-500' },
  book: { label: 'Book', color: 'bg-amber-500' },
  dissertation: { label: 'Dissertation', color: 'bg-indigo-500' },
  proposal: { label: 'Research Proposal', color: 'bg-cyan-500' },
  'case-study': { label: 'Case Study', color: 'bg-green-500' },
  essay: { label: 'Essay', color: 'bg-pink-500' },
  theoretical: { label: 'Theoretical Work', color: 'bg-yellow-500' },
  preprint: { label: 'Preprint', color: 'bg-red-500' },
  conference: { label: 'Conference Paper', color: 'bg-teal-500' },
  unknown: { label: 'Unknown Type', color: 'bg-gray-500' },
}

export default function DocumentTypeIndicator({
  documentType,
  documentTypeString,
  field,
  subfield,
  domain,
  compact = false,
}: DocumentTypeIndicatorProps) {
  const docTypeKey = documentTypeString || documentType || 'unknown'
  const docInfo = documentTypeLabels[docTypeKey] || documentTypeLabels.unknown

  // Use OpenAlex field if available, otherwise show domain/subfield
  const fieldDisplay = field || subfield || domain || 'Multidisciplinary'

  if (compact) {
    return (
      <div className="flex gap-2 items-center">
        <span
          className={`px-3 py-1 rounded text-xs font-semibold text-white ${docInfo.color}`}
          title={docInfo.label}
        >
          {docInfo.label}
        </span>
        <span className="px-3 py-1 rounded text-xs font-semibold bg-gray-600 text-white" title={fieldDisplay}>
          {fieldDisplay}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-dark-700 rounded-lg p-6 mb-4 border border-dark-600">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Document Classification</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${docInfo.color}`}></div>
              <div>
                <span className="text-sm font-medium text-white">{docInfo.label}</span>
                <span className="text-xs text-gray-500 ml-2">Type</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-blue"></div>
              <div>
                <span className="text-sm font-medium text-white">{fieldDisplay}</span>
                <span className="text-xs text-gray-500 ml-2">Field</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-accent-blue">OpenAlex Classification</p>
          <p className="text-xs text-gray-500 mt-1">From API metadata</p>
        </div>
      </div>
    </div>
  )
}
