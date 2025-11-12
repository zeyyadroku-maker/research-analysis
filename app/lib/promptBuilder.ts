import { FrameworkGuidelines, AcademicField, DocumentType } from './adaptiveFramework'
import { DocumentChunk } from './documentProcessor'

export interface PromptContext {
  documentTitle?: string
  documentType: DocumentType
  field: AcademicField
  framework: FrameworkGuidelines
  chunks: DocumentChunk[]
  fullText: string
  abstract?: string
}

/**
 * Generate a comprehensive assessment prompt for Claude
 * Adapts to document type and academic field
 */
export function buildAssessmentPrompt(context: PromptContext): string {
  const typeDescriptions = getDocumentTypeDescription(context.documentType)
  const fieldGuidance = getFieldSpecificGuidance(context.field)
  const focusAreas = context.framework.assessmentFocus.join('\n  - ')
  const biases = context.framework.biasPriorities.join('\n  - ')

  return `You are a research assessment expert analyzing the following academic ${typeDescriptions.category}.

DOCUMENT INFORMATION:
- Title: ${context.documentTitle || 'Unknown'}
- Document Type: ${typeDescriptions.name} (${typeDescriptions.description})
- Academic Field: ${context.field.replace(/-/g, ' ')}

ASSESSMENT FRAMEWORK CONTEXT:
${fieldGuidance}

CREDIBILITY ASSESSMENT COMPONENTS (total possible: 10.0 points):
Assessment weight/priority for this ${typeDescriptions.name} in ${context.field.replace(/-/g, ' ')}:
- Methodological Rigor: Weight ${context.framework.weights.methodologicalRigor} / Scoring range 0-2.5
- Data Transparency: Weight ${context.framework.weights.dataTransparency} / Scoring range 0-2.0
- Source Quality: Weight ${context.framework.weights.sourceQuality} / Scoring range 0-1.5
- Author Credibility: Weight ${context.framework.weights.authorCredibility} / Scoring range 0-1.5
- Statistical Validity: Weight ${context.framework.weights.statisticalValidity} / Scoring range 0-1.5
- Logical Consistency: Weight ${context.framework.weights.logicalConsistency} / Scoring range 0-1.0

ASSESSMENT FOCUS AREAS:
- ${focusAreas}

PRIMARY BIAS CONCERNS FOR THIS FIELD:
- ${biases}

DOCUMENT TEXT:
${context.fullText.substring(0, 150000)} ${context.fullText.length > 150000 ? '[... document continues ...]' : ''}

ANALYSIS TASK:
Provide a comprehensive assessment with the following JSON structure:

{
  "credibility": {
    "methodologicalRigor": {
      "score": <0-2.5>,
      "maxScore": 2.5,
      "description": "<brief explanation of methodology assessment>",
      "evidence": ["<specific evidence 1>", "<specific evidence 2>"]
    },
    "dataTransparency": {
      "score": <0-2.0>,
      "maxScore": 2.0,
      "description": "<explanation>",
      "evidence": ["<evidence 1>", "<evidence 2>"]
    },
    "sourceQuality": {
      "score": <0-1.5>,
      "maxScore": 1.5,
      "description": "<explanation>",
      "evidence": ["<evidence 1>"]
    },
    "authorCredibility": {
      "score": <0-1.5>,
      "maxScore": 1.5,
      "description": "<explanation>",
      "evidence": ["<evidence 1>"]
    },
    "statisticalValidity": {
      "score": <0-1.5>,
      "maxScore": 1.5,
      "description": "<explanation>",
      "evidence": ["<evidence 1>"]
    },
    "logicalConsistency": {
      "score": <0-1.0>,
      "maxScore": 1.0,
      "description": "<explanation>",
      "evidence": ["<evidence 1>"]
    },
    "totalScore": <sum of above scores>,
    "rating": "<Exemplary|Strong|Moderate|Weak|Very Poor|Invalid>"
  },
  "bias": {
    "biases": [
      {
        "type": "<Selection|Confirmation|Publication|Reporting|Funding|Citation|Demographic|Measurement>",
        "evidence": "<specific evidence from document>",
        "severity": "<Low|Medium|High>"
      }
    ],
    "overallLevel": "<Low|Medium|High>",
    "justification": "<synthesis of identified biases>"
  },
  "keyFindings": {
    "fundamentals": {
      "title": "${context.documentTitle || 'Unknown'}",
      "authors": ["<author1>", "<author2>"],
      "journal": "<journal name or publisher>",
      "doi": "<DOI if available>",
      "publicationDate": "<YYYY-MM-DD>",
      "articleType": "${typeDescriptions.name}"
    },
    "researchQuestion": "<main research question>",
    "hypothesis": "<stated hypothesis if present>",
    "methodology": {
      "studyDesign": "<design type>",
      "sampleSize": "<sample size if applicable>",
      "population": "<target population>",
      "samplingMethod": "<how subjects/samples selected>",
      "setting": "<research setting>",
      "intervention": "<intervention if applicable>",
      "comparisonGroups": "<comparison groups if any>",
      "outcomesMeasures": ["<outcome 1>", "<outcome 2>"],
      "statisticalMethods": ["<method 1>", "<method 2>"],
      "studyDuration": "<duration or timeframe>"
    },
    "findings": {
      "primaryFindings": ["<finding 1>", "<finding 2>"],
      "secondaryFindings": ["<finding 1>"],
      "effectSizes": ["<effect size 1>"],
      "clinicalSignificance": "<practical significance assessment>",
      "unexpectedFindings": ["<unexpected result 1>"]
    },
    "limitations": {
      "authorAcknowledged": ["<limitation 1>", "<limitation 2>"],
      "methodologicalIdentified": ["<identified limitation 1>"],
      "severity": "<Minor|Moderate|Major>"
    },
    "conclusions": {
      "primaryConclusion": "<main conclusion stated>",
      "supportedByData": <true|false>,
      "practicalImplications": ["<implication 1>", "<implication 2>"],
      "futureResearchNeeded": ["<gap 1>", "<gap 2>"],
      "recommendations": ["<recommendation 1>"],
      "generalizability": "<assessment of generalizability>"
    }
  },
  "perspective": {
    "theoreticalFramework": "<theoretical framework used>",
    "paradigm": "<Positivist|Interpretivist|Critical|Pragmatic>",
    "disciplinaryPerspective": "<disciplinary tradition>",
    "epistemologicalStance": "<how knowledge is defined>",
    "assumptions": {
      "stated": ["<stated assumption 1>"],
      "unstated": ["<unstated assumption 1>"]
    },
    "ideologicalPosition": "<any ideological stance detected>",
    "authorReflexivity": "<author's acknowledgment of own role>",
    "context": {
      "geographic": "<geographic context>",
      "temporal": "<temporal/historical context>",
      "institutional": "<institutional context>"
    }
  }
}

CRITICAL INSTRUCTIONS:
1. All scores must use the weighted scale provided (not 0-10)
2. Rate with accuracy - do not inflate scores
3. Focus on what IS in the document, not what should be there
4. For ${typeDescriptions.name}, prioritize assessment of: ${typeDescriptions.priorities}
5. Consider field-specific expectations for ${context.field}
6. If information is unavailable, indicate this in evidence
7. Be specific: cite examples, direct quotes, or clear evidence
8. Return ONLY valid JSON, no additional text before or after
`
}

/**
 * Get human-readable description of document type
 */
function getDocumentTypeDescription(
  type: DocumentType
): { name: string; category: string; description: string; priorities: string } {
  const descriptions: Record<
    DocumentType,
    { name: string; category: string; description: string; priorities: string }
  > = {
    article: {
      name: 'Research Article',
      category: 'publication',
      description: 'Peer-reviewed original research with methods, results, and discussion',
      priorities: 'methodological rigor, statistical validity, data transparency, and peer review status',
    },
    review: {
      name: 'Literature Review',
      category: 'synthesis',
      description: 'Comprehensive synthesis of published research on a topic',
      priorities: 'source quality, comprehensiveness, synthesis methodology, and author expertise',
    },
    book: {
      name: 'Book',
      category: 'monograph',
      description: 'Extended scholarly work, typically comprehensive treatment of a topic',
      priorities: 'author credibility, logical coherence, comprehensiveness, and evidence quality',
    },
    dissertation: {
      name: 'Dissertation/Thesis',
      category: 'academic work',
      description: 'Original research submitted for degree requirement',
      priorities: 'methodological rigor, research novelty, advisor quality, and ethical compliance',
    },
    proposal: {
      name: 'Research Proposal',
      category: 'prospective work',
      description: 'Plan for future research with proposed methodology',
      priorities: 'feasibility, preliminary evidence, timeline realism, and innovation',
    },
    'case-study': {
      name: 'Case Study',
      category: 'empirical work',
      description: 'In-depth analysis of specific case(s) or situation(s)',
      priorities: 'case selection justification, triangulation, researcher reflexivity, and data quality',
    },
    essay: {
      name: 'Essay',
      category: 'argumentative work',
      description: 'Author\'s perspective and argument on a topic',
      priorities: 'logical argument coherence, source quality, acknowledgment of opposing views',
    },
    theoretical: {
      name: 'Theoretical Work',
      category: 'conceptual work',
      description: 'Development or critique of theory without empirical data',
      priorities: 'logical consistency, theoretical coherence, conceptual clarity, and falsifiability',
    },
    preprint: {
      name: 'Preprint',
      category: 'preliminary publication',
      description: 'Manuscript shared before peer review',
      priorities: 'preliminary validation, author track record, clarity of peer review status',
    },
    conference: {
      name: 'Conference Paper',
      category: 'conference contribution',
      description: 'Research presented at academic conference',
      priorities: 'conference selectivity, peer review rigor, preliminary nature, and innovation',
    },
    unknown: {
      name: 'Unknown Document',
      category: 'unidentified work',
      description: 'Document type could not be determined',
      priorities: 'format completeness, author identification, claims substantiation, logical coherence',
    },
  }

  return descriptions[type] || descriptions.unknown
}

/**
 * Get field-specific assessment guidance
 */
function getFieldSpecificGuidance(field: AcademicField): string {
  const guidance: Record<AcademicField, string> = {
    'natural-sciences': `
FOR NATURAL SCIENCES:
- Emphasize reproducibility and experimental design rigor
- Assess measurement instrument calibration and validity
- Evaluate statistical power for sample sizes
- Check for control of confounding variables
- Consider generalizability across conditions`,

    'engineering': `
FOR ENGINEERING:
- Prioritize technical feasibility and design justification
- Assess scalability from laboratory to real-world application
- Evaluate cost-benefit analysis completeness
- Check for safety and risk assessment
- Consider practical implementation constraints`,

    'medical': `
FOR MEDICAL RESEARCH:
- Prioritize patient safety and ethical compliance
- Assess statistical power for clinical significance
- Evaluate blinding and randomization adequacy
- Check for adverse event reporting completeness
- Consider conflict of interest and funding source`,

    'agricultural': `
FOR AGRICULTURAL RESEARCH:
- Emphasize environmental condition representation
- Assess seasonal and regional variation handling
- Evaluate sample/plot size appropriacy
- Check for economic feasibility consideration
- Consider sustainability implications`,

    'social-sciences': `
FOR SOCIAL SCIENCES:
- Prioritize sampling representativeness
- Assess self-report validity and social desirability bias
- Evaluate context adequacy for generalizing
- Check for alternative explanation consideration
- Consider cultural sensitivity and bias awareness`,

    'humanities': `
FOR HUMANITIES:
- Emphasize interpretive coherence and evidence grounding
- Assess source authenticity and provenance
- Evaluate scholarly apparatus (citations, references)
- Check for awareness of own interpretive biases
- Consider historiographical appropriateness`,

    'formal-sciences': `
FOR FORMAL SCIENCES:
- Prioritize logical proof completeness
- Assess axiom adequacy and justification
- Evaluate assumption clarity and necessity
- Check for generalizability claims appropriateness
- Consider practical computational implications`,

    'interdisciplinary': `
FOR INTERDISCIPLINARY WORK:
- Evaluate integration quality across disciplines
- Assess method appropriateness for combined fields
- Check for disciplinary tension resolution
- Consider whether interdisciplinary approach adds value
- Assess clarity of disciplinary assumptions`,
  }

  return guidance[field] || guidance.interdisciplinary
}

/**
 * Build a simpler prompt for when full text is unavailable (using abstract only)
 */
export function buildAbstractOnlyPrompt(
  title: string | undefined,
  abstract: string,
  documentType: DocumentType,
  field: AcademicField
): string {
  return `Analyze the following academic abstract and provide assessment based on the information available.

DOCUMENT INFORMATION:
- Title: ${title || 'Unknown'}
- Document Type: ${documentType}
- Academic Field: ${field.replace(/-/g, ' ')}

NOTE: Full document text is unavailable. Assessment is based on abstract only. Be conservative in scores and indicate where full text would be needed for proper assessment.

ABSTRACT:
${abstract}

Provide your assessment in the same JSON format as requested, but indicate in evidence fields where full document review would strengthen the assessment.`
}
