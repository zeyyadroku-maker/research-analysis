import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AnalysisResult, Paper } from '@/app/types'
import { fetchDocumentSafe } from '@/app/lib/documentFetcher'
import { processPdfDocument, processTextDocument } from '@/app/lib/documentProcessor'
import { classifyDocumentType, classifyAcademicField, getFrameworkGuidelines } from '@/app/lib/adaptiveFramework'
import { buildAssessmentPrompt, buildAbstractOnlyPrompt } from '@/app/lib/promptBuilder'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll().map(c => ({
              name: c.name,
              value: c.value,
            }))
          },
          setAll(cookiesToSet: any) {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              cookieStore.set(name, value, options)
            })
          },
        } as any,
      }
    )

    const { data: { user } } = await supabaseServer.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in to analyze papers' },
        { status: 401 }
      )
    }

    const { paper, fullText } = await request.json() as { paper: Paper; fullText: string }

    if (!paper) {
      return NextResponse.json(
        { error: 'Paper is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.CLAUDE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    console.log(`Analyzing paper: ${paper.title}`)

    let analysisText = fullText || paper.abstract || ''

    // Try to fetch full document if not provided
    if (!analysisText && (paper.doi || paper.url || paper.openAlexId)) {
      console.log('Attempting to fetch full document...')
      const doc = await fetchDocumentSafe(paper.id, {
        doi: paper.doi,
        url: paper.url,
        openAlexId: paper.openAlexId,
        abstract: paper.abstract,
      })

      if (doc) {
        console.log(`Successfully fetched document (${doc.size} bytes) from ${doc.source.type}`)
        try {
          // Try to process as PDF
          if (doc.source.type === 'arxiv' || doc.mimeType.includes('pdf')) {
            const processed = await processPdfDocument({
              title: paper.title,
              authors: paper.authors,
              abstract: paper.abstract,
            })
            analysisText = processed.fullText
          } else {
            // Process as text
            const processed = await processTextDocument(doc.content.toString('utf-8'), {
              title: paper.title,
              authors: paper.authors,
              abstract: paper.abstract,
            })
            analysisText = processed.fullText
          }
        } catch (processingError) {
          console.error('Error processing document:', processingError)
          // Fall back to abstract
          analysisText = paper.abstract || fullText || 'Document could not be processed'
        }
      } else {
        console.log('Could not fetch full document, using abstract')
        analysisText = paper.abstract || fullText || ''
      }
    }

    // Classify document type and field
    const documentType = classifyDocumentType(analysisText, paper.title)
    const field = classifyAcademicField(analysisText, paper.title)
    const framework = getFrameworkGuidelines(documentType, field)

    console.log(`Document classified as: ${documentType} in ${field}`)

    // Build adaptive prompt
    let prompt: string
    if (analysisText.length > 1000) {
      // Have substantial text - use full framework prompt
      prompt = buildAssessmentPrompt({
        documentTitle: paper.title,
        documentType,
        field,
        framework,
        chunks: [], // We don't use chunks in the simple path
        fullText: analysisText,
        abstract: paper.abstract,
      })
    } else {
      // Only have abstract - use abstract-only prompt
      prompt = buildAbstractOnlyPrompt(paper.title, paper.abstract || analysisText, documentType, field)
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
          'You are an expert research analyst specializing in adaptive assessment frameworks. Analyze research papers and return valid JSON responses only. Do not include any text before or after the JSON.',
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

    // Validate and cap credibility score to prevent exceeding assessment weight maximum
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

    // Cap score to max weight if needed
    if (credibilityScore.totalScore > maxWeight) {
      console.warn(
        `[Score Validation] Credibility score ${credibilityScore.totalScore.toFixed(2)} exceeds maximum weight ${maxWeight.toFixed(2)}. Capping to maximum.`
      )
      credibilityScore.totalScore = Math.min(credibilityScore.totalScore, maxWeight)
    }

    // Add maxTotalScore to credibility object
    credibilityScore.maxTotalScore = maxWeight

    // Recalculate rating based on percentage
    const scorePercentage = (credibilityScore.totalScore / maxWeight) * 100
    if (scorePercentage >= 95) {
      credibilityScore.rating = 'Exemplary'
    } else if (scorePercentage >= 75) {
      credibilityScore.rating = 'Strong'
    } else if (scorePercentage >= 55) {
      credibilityScore.rating = 'Moderate'
    } else if (scorePercentage >= 35) {
      credibilityScore.rating = 'Weak'
    } else if (scorePercentage > 0) {
      credibilityScore.rating = 'Very Poor'
    } else {
      credibilityScore.rating = 'Invalid'
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
      limitations: analysisData.limitations || {
        unverifiableClaims: [],
        dataLimitations: [],
        uncertainties: [],
        aiConfidenceNote: 'Analysis completed with available information',
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analysis error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to analyze paper: ${errorMessage}` },
      { status: 500 }
    )
  }
}
