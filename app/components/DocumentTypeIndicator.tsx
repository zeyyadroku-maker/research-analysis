'use client'

import { DocumentType, AcademicField } from '@/app/lib/adaptiveFramework'

interface DocumentTypeIndicatorProps {
  documentType: DocumentType
  field: AcademicField
  compact?: boolean
}

const documentTypeLabels: Record<DocumentType, { label: string; color: string }> = {
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

const fieldLabels: Record<AcademicField, { label: string }> = {
  'natural-sciences': { label: 'Natural Sciences' },
  'engineering': { label: 'Engineering & Technology' },
  'medical': { label: 'Medical Sciences' },
  'agricultural': { label: 'Agricultural Sciences' },
  'social-sciences': { label: 'Social Sciences' },
  'humanities': { label: 'Humanities' },
  'formal-sciences': { label: 'Formal Sciences' },
  'interdisciplinary': { label: 'Interdisciplinary' },
}

export default function DocumentTypeIndicator({
  documentType,
  field,
  compact = false,
}: DocumentTypeIndicatorProps) {
  const docInfo = documentTypeLabels[documentType] || documentTypeLabels.unknown
  const fieldInfo = fieldLabels[field] || fieldLabels.interdisciplinary

  if (compact) {
    return (
      <div className="flex gap-2 items-center">
        <span
          className={`px-3 py-1 rounded text-xs font-semibold text-white ${docInfo.color}`}
          title={docInfo.label}
        >
          {docInfo.label}
        </span>
        <span className="px-3 py-1 rounded text-xs font-semibold bg-gray-600 text-white" title={fieldInfo.label}>
          {fieldInfo.label}
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
                <span className="text-sm font-medium text-white">{fieldInfo.label}</span>
                <span className="text-xs text-gray-500 ml-2">Field</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-accent-blue">Adaptive Framework</p>
          <p className="text-xs text-gray-500 mt-1">Tailored assessment</p>
        </div>
      </div>
    </div>
  )
}
