'use client'

import { FrameworkGuidelines } from '@/app/lib/adaptiveFramework'

interface FrameworkAssessmentViewProps {
  framework: FrameworkGuidelines
  collapsed?: boolean
}

const scoreColor = (score: number, maxScore: number): string => {
  const percentage = (score / maxScore) * 100

  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-blue-500'
  if (percentage >= 40) return 'bg-yellow-500'
  if (percentage >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

const scoreRating = (score: number, maxScore: number): string => {
  const percentage = (score / maxScore) * 100

  if (percentage >= 80) return 'Excellent'
  if (percentage >= 60) return 'Good'
  if (percentage >= 40) return 'Fair'
  if (percentage >= 20) return 'Poor'
  return 'Very Poor'
}

export default function FrameworkAssessmentView({
  framework,
  collapsed = false,
}: FrameworkAssessmentViewProps) {
  const weights = framework.weights
  const totalScore = Object.values(weights).reduce((a, b) => a + b, 0)

  return (
    <div className="bg-dark-700 rounded-lg p-6 mb-6 border border-dark-600">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-2">Assessment Framework</h3>
        <p className="text-sm text-gray-400">
          Adaptive weights for {framework.documentType} in {framework.field.replace(/-/g, ' ')}
        </p>
      </div>

      {/* Weights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Methodological Rigor */}
        <div className="bg-dark-800 rounded p-4 border border-dark-600">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-semibold text-white">Methodological Rigor</h4>
            <span className="text-xs font-bold text-gray-400">{weights.methodologicalRigor}/2.5</span>
          </div>
          <div className="w-full bg-dark-600 rounded h-2 mb-2">
            <div
              className={`h-2 rounded ${scoreColor(weights.methodologicalRigor, 2.5)} transition-all`}
              style={{ width: `${(weights.methodologicalRigor / 2.5) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">Research design & methodology</p>
        </div>

        {/* Data Transparency */}
        <div className="bg-dark-800 rounded p-4 border border-dark-600">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-semibold text-white">Data Transparency</h4>
            <span className="text-xs font-bold text-gray-400">{weights.dataTransparency}/2.0</span>
          </div>
          <div className="w-full bg-dark-600 rounded h-2 mb-2">
            <div
              className={`h-2 rounded ${scoreColor(weights.dataTransparency, 2.0)} transition-all`}
              style={{ width: `${(weights.dataTransparency / 2.0) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">Availability & replicability</p>
        </div>

        {/* Source Quality */}
        <div className="bg-dark-800 rounded p-4 border border-dark-600">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-semibold text-white">Source Quality</h4>
            <span className="text-xs font-bold text-gray-400">{weights.sourceQuality}/1.5</span>
          </div>
          <div className="w-full bg-dark-600 rounded h-2 mb-2">
            <div
              className={`h-2 rounded ${scoreColor(weights.sourceQuality, 1.5)} transition-all`}
              style={{ width: `${(weights.sourceQuality / 1.5) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">Journal & citation quality</p>
        </div>

        {/* Author Credibility */}
        <div className="bg-dark-800 rounded p-4 border border-dark-600">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-semibold text-white">Author Credibility</h4>
            <span className="text-xs font-bold text-gray-400">{weights.authorCredibility}/1.5</span>
          </div>
          <div className="w-full bg-dark-600 rounded h-2 mb-2">
            <div
              className={`h-2 rounded ${scoreColor(weights.authorCredibility, 1.5)} transition-all`}
              style={{ width: `${(weights.authorCredibility / 1.5) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">Expertise & disclosures</p>
        </div>

        {/* Statistical Validity */}
        <div className="bg-dark-800 rounded p-4 border border-dark-600">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-semibold text-white">Statistical Validity</h4>
            <span className="text-xs font-bold text-gray-400">{weights.statisticalValidity}/1.5</span>
          </div>
          <div className="w-full bg-dark-600 rounded h-2 mb-2">
            <div
              className={`h-2 rounded ${scoreColor(weights.statisticalValidity, 1.5)} transition-all`}
              style={{ width: `${(weights.statisticalValidity / 1.5) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">Statistical rigor & tests</p>
        </div>

        {/* Logical Consistency */}
        <div className="bg-dark-800 rounded p-4 border border-dark-600">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-semibold text-white">Logical Consistency</h4>
            <span className="text-xs font-bold text-gray-400">{weights.logicalConsistency}/1.0</span>
          </div>
          <div className="w-full bg-dark-600 rounded h-2 mb-2">
            <div
              className={`h-2 rounded ${scoreColor(weights.logicalConsistency, 1.0)} transition-all`}
              style={{ width: `${(weights.logicalConsistency / 1.0) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">Argument coherence</p>
        </div>
      </div>

      {/* Total Score */}
      <div className="bg-dark-800 rounded p-4 border border-dark-600 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Total Assessment Weight</h4>
            <p className="text-xs text-gray-400">Maximum possible score for this document type & field</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-accent-blue">{totalScore.toFixed(1)}</div>
            <p className="text-xs text-gray-400">points</p>
          </div>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Bias Assessment Priorities */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white mb-3">Primary Bias Concerns</h4>
            <div className="space-y-2">
              {framework.biasPriorities.slice(0, 4).map((bias, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-gray-300">{bias}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Focus Areas */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Assessment Focus Areas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {framework.assessmentFocus.slice(0, 6).map((focus, idx) => (
                <div key={idx} className="flex items-start gap-2 pl-1">
                  <span className="text-accent-blue font-bold flex-shrink-0 text-base">−</span>
                  <p className="text-sm text-gray-300">{focus}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
