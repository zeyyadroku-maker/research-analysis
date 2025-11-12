'use client'

import { AnalysisResult } from '@/app/types'
import { useState, useEffect } from 'react'
import { saveBookmark, removeBookmark, isBookmarked } from '@/app/lib/bookmarks'
import DocumentTypeIndicator from './DocumentTypeIndicator'
import FrameworkAssessmentView from './FrameworkAssessmentView'
import DocumentExtractionIndicator from './DocumentExtractionIndicator'
import { getFrameworkGuidelines } from '@/app/lib/adaptiveFramework'

interface DetailedAnalysisViewProps {
  analysis: AnalysisResult
  onClose: () => void
}

export default function DetailedAnalysisView({ analysis, onClose }: DetailedAnalysisViewProps) {
  const [isBookmarkedState, setIsBookmarkedState] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setIsBookmarkedState(isBookmarked(analysis.paper.id))
  }, [analysis.paper.id])

  const handleBookmark = () => {
    if (isBookmarkedState) {
      removeBookmark(analysis.paper.id)
      setIsBookmarkedState(false)
    } else {
      saveBookmark(analysis, notes)
      setIsBookmarkedState(true)
    }
  }

  const handleExportAnalysis = () => {
    // Generate formatted text report
    const report = `RESEARCH PAPER ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}
================================================================================

PAPER INFORMATION
Title: ${analysis.paper.title}
Authors: ${analysis.paper.authors.join(', ')}
Journal: ${analysis.paper.journal || 'N/A'}
Year: ${analysis.paper.year || 'N/A'}
DOI: ${analysis.paper.doi || 'N/A'}
Document Type: ${analysis.paper.documentType}
Academic Field: ${analysis.paper.field}

================================================================================
CREDIBILITY ASSESSMENT (Total: ${analysis.credibility.totalScore.toFixed(1)}/10)
Rating: ${analysis.credibility.rating}

Methodological Rigor: ${analysis.credibility.methodologicalRigor.score.toFixed(1)}/${analysis.credibility.methodologicalRigor.maxScore}
${analysis.credibility.methodologicalRigor.description}

Data Transparency: ${analysis.credibility.dataTransparency.score.toFixed(1)}/${analysis.credibility.dataTransparency.maxScore}
${analysis.credibility.dataTransparency.description}

Source Quality: ${analysis.credibility.sourceQuality.score.toFixed(1)}/${analysis.credibility.sourceQuality.maxScore}
${analysis.credibility.sourceQuality.description}

Author Credibility: ${analysis.credibility.authorCredibility.score.toFixed(1)}/${analysis.credibility.authorCredibility.maxScore}
${analysis.credibility.authorCredibility.description}

Statistical Validity: ${analysis.credibility.statisticalValidity.score.toFixed(1)}/${analysis.credibility.statisticalValidity.maxScore}
${analysis.credibility.statisticalValidity.description}

Logical Consistency: ${analysis.credibility.logicalConsistency.score.toFixed(1)}/${analysis.credibility.logicalConsistency.maxScore}
${analysis.credibility.logicalConsistency.description}

================================================================================
BIAS ANALYSIS
Overall Bias Level: ${analysis.bias.overallLevel}
${analysis.bias.justification}

Identified Biases:
${analysis.bias.biases.map(b => `- ${b.type} Bias (${b.severity}): ${b.evidence}`).join('\n')}

================================================================================
KEY FINDINGS
Research Question: ${analysis.keyFindings.researchQuestion}
${analysis.keyFindings.hypothesis ? `Hypothesis: ${analysis.keyFindings.hypothesis}` : ''}

Methodology:
- Study Design: ${analysis.keyFindings.methodology.studyDesign}
- Sample Size: ${analysis.keyFindings.methodology.sampleSize}
- Population: ${analysis.keyFindings.methodology.population}
- Setting: ${analysis.keyFindings.methodology.setting}

Primary Findings:
${analysis.keyFindings.findings.primaryFindings.map(f => `- ${f}`).join('\n')}

Limitations (${analysis.keyFindings.limitations.severity}):
${analysis.keyFindings.limitations.authorAcknowledged.map(l => `- ${l}`).join('\n')}

Conclusion: ${analysis.keyFindings.conclusions.primaryConclusion}
Supported by Data: ${analysis.keyFindings.conclusions.supportedByData ? 'Yes' : 'No'}

================================================================================
RESEARCH PERSPECTIVE
Paradigm: ${analysis.perspective.paradigm}
Theoretical Framework: ${analysis.perspective.theoreticalFramework}
Epistemological Stance: ${analysis.perspective.epistemologicalStance}
Disciplinary Perspective: ${analysis.perspective.disciplinaryPerspective}

================================================================================`

    // Download as text file
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(report)}`)
    element.setAttribute('download', `${analysis.paper.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}_analysis.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getTotalScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-400'
    if (score >= 7) return 'text-blue-400'
    if (score >= 5) return 'text-yellow-400'
    if (score >= 3) return 'text-orange-400'
    return 'text-red-400'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low':
        return 'bg-green-900 text-green-200 border-green-700'
      case 'Medium':
        return 'bg-yellow-900 text-yellow-200 border-yellow-700'
      case 'High':
        return 'bg-red-900 text-red-200 border-red-700'
      default:
        return 'bg-gray-700 text-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-8 mb-6 animate-slide-up">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 mr-4">
                <h1 className="text-3xl font-bold text-white mb-2">{analysis.paper.title}</h1>
                <p className="text-gray-400">
                  {analysis.paper.authors.slice(0, 3).join(', ')}
                  {analysis.paper.authors.length > 3 && ` +${analysis.paper.authors.length - 3} more`}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {analysis.paper.journal} • {analysis.paper.year}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex gap-3">
              {/* Bookmark button */}
              <button
                onClick={handleBookmark}
                className={`px-4 py-2 rounded font-medium transition-all duration-200 flex items-center gap-2 ${
                  isBookmarkedState
                    ? 'bg-accent-blue text-white hover:bg-blue-600'
                    : 'bg-dark-700 text-gray-300 hover:text-white hover:bg-dark-600'
                }`}
              >
                <svg className={`w-5 h-5 ${isBookmarkedState ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
                </svg>
                {isBookmarkedState ? 'Bookmarked' : 'Bookmark'}
              </button>

              {/* Export button */}
              <button
                onClick={handleExportAnalysis}
                className="px-4 py-2 rounded font-medium transition-all duration-200 flex items-center gap-2 bg-dark-700 text-gray-300 hover:text-white hover:bg-dark-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8H3m12 0h9M6.3 5.7L3 9m0 0l3.3 3.3M3 9h18m0 0l-3.3-3.3M21 9l-3.3 3.3" />
                </svg>
                Export
              </button>
            </div>
          </div>

          {/* Document Type & Classification */}
          {analysis.paper.documentType && analysis.paper.field && (
            <DocumentTypeIndicator
              documentType={analysis.paper.documentType as any}
              field={analysis.paper.field as any}
            />
          )}

          {/* Document Extraction Status */}
          <DocumentExtractionIndicator
            extracted={true}
            source="provided"
            format="text"
          />

          {/* Framework Assessment Overview */}
          {analysis.paper.documentType && analysis.paper.field && (
            <FrameworkAssessmentView
              framework={getFrameworkGuidelines(analysis.paper.documentType as any, analysis.paper.field as any)}
              collapsed={true}
            />
          )}

          {/* Credibility Assessment */}
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-8 mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-accent-blue" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h2 className="text-2xl font-bold text-white">Credibility Assessment</h2>
            </div>

            <div className={`text-4xl font-bold mb-6 ${getTotalScoreColor(analysis.credibility.totalScore)}`}>
              {analysis.credibility.totalScore.toFixed(1)}/10
              <span className="text-lg ml-2 text-gray-400">({analysis.credibility.rating})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'methodologicalRigor', component: analysis.credibility.methodologicalRigor },
                { key: 'dataTransparency', component: analysis.credibility.dataTransparency },
                { key: 'sourceQuality', component: analysis.credibility.sourceQuality },
                { key: 'authorCredibility', component: analysis.credibility.authorCredibility },
                { key: 'statisticalValidity', component: analysis.credibility.statisticalValidity },
                { key: 'logicalConsistency', component: analysis.credibility.logicalConsistency },
              ].map(({ key, component }) => (
                <div key={key} className="bg-dark-700 rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-200">{component.name}</span>
                    <span className="text-sm font-bold text-accent-blue">
                      {component.score}/{component.maxScore}
                    </span>
                  </div>
                  <div className="w-full bg-dark-600 rounded h-2 overflow-hidden">
                    <div
                      className={`h-full ${getScoreColor(component.score, component.maxScore)} transition-all duration-500`}
                      style={{ width: `${(component.score / component.maxScore) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{component.description}</p>
                  {component.evidence.length > 0 && (
                    <ul className="text-xs text-gray-400 mt-2 space-y-1">
                      {component.evidence.slice(0, 2).map((e, i) => (
                        <li key={i} className="flex gap-2 pl-2">
                          <span className="text-gray-500 flex-shrink-0">−</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bias Analysis */}
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-8 mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-bold text-white">Bias Analysis</h2>
            </div>

            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-6 ${
              analysis.bias.overallLevel === 'Low'
                ? 'bg-green-900 text-green-200'
                : analysis.bias.overallLevel === 'Medium'
                ? 'bg-yellow-900 text-yellow-200'
                : 'bg-red-900 text-red-200'
            }`}>
              Overall Bias Level: {analysis.bias.overallLevel}
            </div>

            <p className="text-gray-300 mb-6">{analysis.bias.justification}</p>

            <div className="space-y-3">
              {analysis.bias.biases.map((bias, index) => (
                <div key={index} className={`border rounded p-4 ${getSeverityColor(bias.severity)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">{bias.type} Bias</span>
                    <span className="text-xs font-bold uppercase">{bias.severity}</span>
                  </div>
                  <p className="text-sm">{bias.evidence}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Findings */}
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-8 mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V6a1 1 0 00-1-1h-3a1 1 0 000-2 2 2 0 00-2 2H4z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-bold text-white">Key Findings</h2>
            </div>

            <div className="space-y-6">
              {/* Research Question */}
              <div>
                <h3 className="font-semibold text-accent-blue mb-2">Research Question</h3>
                <p className="text-gray-300">{analysis.keyFindings.researchQuestion}</p>
              </div>

              {/* Methodology */}
              <div>
                <h3 className="font-semibold text-accent-blue mb-3">Methodology</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Study Design:</span>
                    <p className="text-gray-200">{analysis.keyFindings.methodology.studyDesign}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Sample Size:</span>
                    <p className="text-gray-200">{analysis.keyFindings.methodology.sampleSize}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Population:</span>
                    <p className="text-gray-200">{analysis.keyFindings.methodology.population}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Setting:</span>
                    <p className="text-gray-200">{analysis.keyFindings.methodology.setting}</p>
                  </div>
                </div>
              </div>

              {/* Primary Findings */}
              <div>
                <h3 className="font-semibold text-accent-blue mb-2">Primary Findings</h3>
                <ul className="space-y-2">
                  {analysis.keyFindings.findings.primaryFindings.map((finding, i) => (
                    <li key={i} className="flex gap-2 text-gray-300 pl-2">
                      <span className="text-accent-blue font-bold flex-shrink-0">−</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              <div>
                <h3 className="font-semibold text-accent-blue mb-2">Limitations</h3>
                <p className="text-sm text-gray-400 mb-2">Severity: <span className="font-semibold">{analysis.keyFindings.limitations.severity}</span></p>
                <ul className="space-y-2">
                  {analysis.keyFindings.limitations.authorAcknowledged.map((limit, i) => (
                    <li key={i} className="flex gap-2 text-gray-300 text-sm pl-2">
                      <span className="text-orange-400 flex-shrink-0">−</span>
                      <span>{limit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Conclusion */}
              <div>
                <h3 className="font-semibold text-accent-blue mb-2">Conclusion</h3>
                <p className="text-gray-300 mb-3">{analysis.keyFindings.conclusions.primaryConclusion}</p>
                <p className={`text-sm font-medium ${analysis.keyFindings.conclusions.supportedByData ? 'text-green-400' : 'text-red-400'}`}>
                  {analysis.keyFindings.conclusions.supportedByData ? 'Supported by data' : 'Not adequately supported'}
                </p>
              </div>
            </div>
          </div>

          {/* Research Perspective */}
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z" />
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2V2a1 1 0 112 0v1h1a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v1a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1h-2v1a1 1 0 11-2 0v-1H7a2 2 0 01-2-2v-2H4a1 1 0 110-2h1V9H4a1 1 0 110-2h1V5H4a1 1 0 110-2h1V2a2 2 0 012-2h2V1z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-bold text-white">Research Perspective</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-accent-blue font-semibold mb-2">Paradigm</h3>
                <p className="text-gray-300">{analysis.perspective.paradigm}</p>
              </div>
              <div>
                <h3 className="text-accent-blue font-semibold mb-2">Epistemological Stance</h3>
                <p className="text-gray-300">{analysis.perspective.epistemologicalStance}</p>
              </div>
              <div>
                <h3 className="text-accent-blue font-semibold mb-2">Theoretical Framework</h3>
                <p className="text-gray-300">{analysis.perspective.theoreticalFramework}</p>
              </div>
              <div>
                <h3 className="text-accent-blue font-semibold mb-2">Disciplinary Perspective</h3>
                <p className="text-gray-300">{analysis.perspective.disciplinaryPerspective}</p>
              </div>
            </div>

            {analysis.perspective.assumptions.stated.length > 0 && (
              <div className="mt-6">
                <h3 className="text-accent-blue font-semibold mb-2">Key Assumptions</h3>
                <ul className="space-y-2">
                  {analysis.perspective.assumptions.stated.map((assumption, i) => (
                    <li key={i} className="flex gap-2 text-gray-300 text-sm pl-2">
                      <span className="text-accent-blue flex-shrink-0">:</span>
                      <span>{assumption}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
