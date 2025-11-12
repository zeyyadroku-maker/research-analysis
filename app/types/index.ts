// Paper from OpenAlex API
export interface Paper {
  id: string
  title: string
  authors: string[]
  journal?: string
  doi?: string
  abstract?: string
  publicationDate?: string
  url?: string
  year?: number
  coreId?: string
  documentType?: string // From OpenAlex: 'article', 'book', 'preprint', etc.
  field?: string // Academic field classification
  citationCount?: number // Citation count from OpenAlex
  openAccessStatus?: boolean // Whether paper is open access
  openAlexId?: string // OpenAlex work ID
}

// Credibility Assessment (0-10 scale)
export interface CredibilityComponent {
  name: string
  score: number
  maxScore: number
  description: string
  evidence: string[]
}

export interface CredibilityScore {
  methodologicalRigor: CredibilityComponent
  dataTransparency: CredibilityComponent
  sourceQuality: CredibilityComponent
  authorCredibility: CredibilityComponent
  statisticalValidity: CredibilityComponent
  logicalConsistency: CredibilityComponent
  totalScore: number
  rating: 'Exemplary' | 'Strong' | 'Moderate' | 'Weak' | 'Very Poor' | 'Invalid'
}

// Bias Detection
export interface BiasDetection {
  type: 'Selection' | 'Confirmation' | 'Publication' | 'Reporting' | 'Funding' | 'Citation' | 'Demographic' | 'Measurement'
  evidence: string
  severity: 'Low' | 'Medium' | 'High'
}

export interface BiasAnalysis {
  biases: BiasDetection[]
  overallLevel: 'Low' | 'Medium' | 'High'
  justification: string
}

// Key Findings
export interface ResearchFundamentals {
  title: string
  authors: string[]
  journal: string
  doi?: string
  publicationDate: string
  articleType: string
}

export interface Methodology {
  studyDesign: string
  sampleSize: string
  population: string
  samplingMethod: string
  setting: string
  intervention?: string
  comparisonGroups?: string
  outcomesMeasures: string[]
  statisticalMethods: string[]
  studyDuration: string
}

export interface Findings {
  primaryFindings: string[]
  secondaryFindings: string[]
  effectSizes: string[]
  clinicalSignificance: string
  unexpectedFindings: string[]
}

export interface Limitations {
  authorAcknowledged: string[]
  methodologicalIdentified: string[]
  severity: 'Minor' | 'Moderate' | 'Major'
}

export interface Conclusions {
  primaryConclusion: string
  supportedByData: boolean
  practicalImplications: string[]
  futureResearchNeeded: string[]
  recommendations: string[]
  generalizability: string
}

export interface KeyFindings {
  fundamentals: ResearchFundamentals
  researchQuestion: string
  hypothesis?: string
  methodology: Methodology
  findings: Findings
  limitations: Limitations
  conclusions: Conclusions
}

// Research Perspective
export interface ResearchPerspective {
  theoreticalFramework: string
  paradigm: 'Positivist' | 'Interpretivist' | 'Critical' | 'Pragmatic'
  disciplinaryPerspective: string
  epistemologicalStance: string
  assumptions: {
    stated: string[]
    unstated: string[]
  }
  ideologicalPosition?: string
  authorReflexivity?: string
  context: {
    geographic: string
    temporal: string
    institutional: string
  }
}

// Complete Analysis Result
export interface AnalysisResult {
  paper: Paper
  credibility: CredibilityScore
  bias: BiasAnalysis
  keyFindings: KeyFindings
  perspective: ResearchPerspective
  timestamp: string
}

// Bookmarked Paper
export interface BookmarkedPaper {
  id: string
  analysis: AnalysisResult
  bookmarkedAt: string
  notes?: string
}

// Search Response from CORE API
export interface CoreSearchResponse {
  status: string
  hasMore: boolean
  totalHits: number
  data: CorePaper[]
}

export interface CorePaper {
  id: string
  title: string
  authors?: Array<{
    name: string
  }>
  abstract?: string
  doi?: string
  datePublished?: string
  downloadUrl?: string
  fullTextUrl?: string
  year?: number
}
