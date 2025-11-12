import { NextRequest, NextResponse } from 'next/server'
import { Paper, AnalysisResult } from '@/app/types'
import { classifyDocumentType, classifyAcademicField, getFrameworkGuidelines } from '@/app/lib/adaptiveFramework'
import { buildAssessmentPrompt, buildAbstractOnlyPrompt } from '@/app/lib/promptBuilder'

// Simple text extraction from buffer
function extractTextFromBuffer(buffer: Buffer, mimeType: string): string {
  if (mimeType.includes('text')) {
    // Plain text file
    return buffer.toString('utf-8')
  }

  // For PDF and other binary formats, return empty string
  // This will allow the system to fall back to using just the filename as title
  return ''
}

// Generate a simple hash for file-based ID
function generateFileId(fileName: string): string {
  let hash = 0
  for (let i = 0; i < fileName.length; i++) {
    const char = fileName.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `file-${Math.abs(hash).toString(36)}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log(`Processing uploaded file: ${file.name} (${file.size} bytes)`)

    // Extract text from file
    const buffer = Buffer.from(await file.arrayBuffer())
    let fileText = extractTextFromBuffer(buffer, file.type)

    // If no text extracted, at least use the filename
    if (!fileText) {
      fileText = file.name.replace(/\.[^/.]+$/, '')
    }

    // Create a Paper object from the file
    const fileName = file.name.replace(/\.[^/.]+$/, '')
    const paper: Paper = {
      id: generateFileId(file.name),
      title: fileName,
      authors: ['Uploaded Document'],
      abstract: fileText.substring(0, 1000),
      year: new Date().getFullYear(),
      documentType: 'unknown',
      field: 'interdisciplinary',
    }

    const apiKey = process.env.CLAUDE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    console.log(`Analyzing uploaded document: ${paper.title}`)

    // Classify document type and field
    const documentType = classifyDocumentType(fileText, paper.title)
    const field = classifyAcademicField(fileText, paper.title)
    const framework = getFrameworkGuidelines(documentType, field)

    console.log(`Document classified as: ${documentType} in ${field}`)

    // Build adaptive prompt
    let prompt: string
    if (fileText.length > 1000) {
      prompt = buildAssessmentPrompt({
        documentTitle: paper.title,
        documentType,
        field,
        framework,
        chunks: [],
        fullText: fileText,
        abstract: paper.abstract,
      })
    } else {
      prompt = buildAbstractOnlyPrompt(paper.title, fileText, documentType, field)
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 4000,
        temperature: 0,
        system:
          'You are an expert research analyst specializing in adaptive assessment frameworks. Analyze research documents and return valid JSON responses only. Do not include any text before or after the JSON.',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error status:', response.status)
      console.error('Claude API error response:', errorText)

      let errorDetails = { message: 'Unknown error' }
      try {
        errorDetails = JSON.parse(errorText)
      } catch (e) {
        errorDetails = { message: errorText }
      }

      return NextResponse.json(
        {
          error: `Claude API error: ${response.statusText}`,
          details: errorDetails,
          statusCode: response.status,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    const responseText = data.content[0].text

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Could not extract JSON from response:', responseText)
      return NextResponse.json(
        { error: 'Failed to parse analysis response' },
        { status: 500 }
      )
    }

    const analysisData = JSON.parse(jsonMatch[0])

    // Validate that credibility data exists
    if (!analysisData.credibility) {
      console.error('Missing credibility data in analysis response:', analysisData)
      return NextResponse.json(
        { error: 'Invalid analysis response: missing credibility assessment' },
        { status: 500 }
      )
    }

    // Validate and cap credibility score
    const maxWeight = (
      framework.weights.methodologicalRigor +
      framework.weights.dataTransparency +
      framework.weights.sourceQuality +
      framework.weights.authorCredibility +
      framework.weights.statisticalValidity +
      framework.weights.logicalConsistency
    )

    const credibilityScore = analysisData.credibility
    if (!credibilityScore.totalScore && credibilityScore.totalScore !== 0) {
      console.error('Missing totalScore in credibility data:', credibilityScore)
      return NextResponse.json(
        { error: 'Invalid analysis response: missing credibility totalScore' },
        { status: 500 }
      )
    }

    if (credibilityScore.totalScore > maxWeight) {
      console.warn(
        `[Score Validation] Credibility score ${credibilityScore.totalScore.toFixed(2)} exceeds maximum weight ${maxWeight.toFixed(2)}. Capping to maximum.`
      )
      credibilityScore.totalScore = Math.min(credibilityScore.totalScore, maxWeight)

      // Recalculate rating based on capped score
      if (credibilityScore.totalScore >= maxWeight * 0.9) {
        credibilityScore.rating = 'Exemplary'
      } else if (credibilityScore.totalScore >= maxWeight * 0.75) {
        credibilityScore.rating = 'Strong'
      } else if (credibilityScore.totalScore >= maxWeight * 0.5) {
        credibilityScore.rating = 'Moderate'
      } else if (credibilityScore.totalScore >= maxWeight * 0.25) {
        credibilityScore.rating = 'Weak'
      } else if (credibilityScore.totalScore > 0) {
        credibilityScore.rating = 'Very Poor'
      } else {
        credibilityScore.rating = 'Invalid'
      }
    }

    const result: AnalysisResult = {
      paper: {
        ...paper,
        documentType,
        field,
      },
      credibility: credibilityScore,
      bias: analysisData.bias,
      keyFindings: analysisData.keyFindings,
      perspective: analysisData.perspective,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to process upload: ${errorMessage}` },
      { status: 500 }
    )
  }
}
