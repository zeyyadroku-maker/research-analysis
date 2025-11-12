# AI Research Analysis Platform

An AI-powered research paper analysis platform that helps you understand credibility, detect bias, and evaluate research quality with intelligent insights.

## Features

- 🔍 **Search Research Papers**: Search from the CORE API database with millions of papers
- 🤖 **AI-Powered Analysis**: Uses Groq LLM to analyze papers using a comprehensive framework
- 📊 **Credibility Assessment**: Evaluates papers on methodological rigor, transparency, source quality, author credentials, statistical validity, and logical consistency (0-10 scale)
- ⚠️ **Bias Detection**: Identifies multiple types of bias including selection, confirmation, publication, reporting, funding, citation, demographic, and measurement bias
- 📈 **Key Findings Extraction**: Automatically extracts research fundamentals, methodology, findings, limitations, and conclusions
- 📚 **Bookmark Papers**: Save your favorite analyses for later review
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations inspired by contemporary design patterns

## Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v3
- **APIs**:
  - CORE API (paper database)
  - Groq API (LLM analysis)
- **State Management**: React hooks with localStorage for bookmarks

## Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
cd research-analysis
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables (already configured in `.env.local`):
```bash
NEXT_PUBLIC_CORE_API_KEY=c784JlxHSmNoTI2nsqwjruAzpCBt5vZd
GROQ_API_KEY=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
```

> **Note**: The Groq API key provided is a placeholder. If it doesn't work, update it with a valid key in `.env.local`

## Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Usage

1. **Search Papers**: Use the search bar on the homepage to find research papers by topic, author, or keywords
2. **View Results**: Papers appear as cards with basic information
3. **Analyze**: Click the "Analyze" button on any paper to run the full AI analysis
4. **Review Analysis**: The analysis includes:
   - Credibility score with breakdown by component
   - Identified biases and their severity
   - Key research findings and methodology
   - Research perspective and theoretical framework
5. **Bookmark**: Save papers you find interesting using the bookmark button
6. **View Bookmarks**: Access your saved papers from the Bookmarks page

## Project Structure

```
app/
├── api/
│   ├── search/          # CORE API search endpoint
│   └── analyze/         # Groq LLM analysis endpoint
├── components/
│   ├── SearchBar.tsx    # Search interface
│   ├── ResultsCard.tsx  # Paper result cards
│   └── DetailedAnalysisView.tsx  # Full analysis modal
├── lib/
│   └── bookmarks.ts     # Bookmark management utilities
├── types/
│   └── index.ts         # TypeScript type definitions
├── bookmarks/
│   └── page.tsx         # Bookmarks page
├── page.tsx             # Home page
└── globals.css          # Global styles
```

## API Endpoints

### POST /api/search
Searches for papers using the CORE API.

**Query Parameters:**
- `q` (required): Search query
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "papers": [{ paper objects }],
  "totalHits": number,
  "hasMore": boolean,
  "currentPage": number
}
```

### POST /api/analyze
Analyzes a paper using the Groq LLM with the comprehensive framework.

**Request Body:**
```json
{
  "paper": { paper object },
  "fullText": "Paper content or abstract"
}
```

**Response:**
```json
{
  "paper": { paper object },
  "credibility": { credibility assessment },
  "bias": { bias analysis },
  "keyFindings": { extracted findings },
  "perspective": { research perspective },
  "timestamp": "ISO timestamp"
}
```

## Analysis Framework

The AI analysis uses a comprehensive framework that includes:

### Credibility Assessment (0-10)
1. Methodological Rigor (0-2.5)
2. Data Transparency (0-2)
3. Source Quality (0-1.5)
4. Author Credibility (0-1.5)
5. Statistical Validity (0-1.5)
6. Logical Consistency (0-1)

### Bias Detection
- Selection Bias
- Confirmation Bias
- Publication Bias
- Reporting Bias
- Funding Bias
- Citation Bias
- Demographic Bias
- Measurement Bias

### Key Findings Extraction
- Research fundamentals
- Research questions and hypotheses
- Methodology details
- Primary and secondary findings
- Limitations and severity assessment
- Conclusions and implications

### Research Perspective
- Theoretical framework
- Epistemological stance
- Research assumptions
- Ideological positioning
- Author positionality
- Contextual information

## Customization

### Update API Keys
Edit `.env.local` to use different API keys:
```bash
NEXT_PUBLIC_CORE_API_KEY=your_core_api_key
GROQ_API_KEY=your_groq_api_key
```

### Styling
- Tailwind configuration: `tailwind.config.ts`
- Global styles: `app/globals.css`
- Color scheme is defined in the Tailwind config

### LLM Model
To change the Groq model, update `app/api/analyze/route.ts`:
```typescript
model: 'mixtral-8x7b-32768', // Change this line
```

## Performance Considerations

- Papers are fetched on-demand from CORE API
- Analysis requests are sent to Groq LLM (may take a few seconds)
- Bookmarks are stored in browser localStorage
- Consider implementing pagination for large search results

## Limitations

- Analysis quality depends on Groq LLM capabilities
- Full-text analysis currently uses paper abstract instead of full text
- Bookmarks are stored locally in the browser (not synced across devices)
- CORE API may have rate limits

## Future Enhancements

- [ ] Full-text PDF parsing for complete paper analysis
- [ ] Database backend for persistent bookmark storage
- [ ] User accounts and authentication
- [ ] Advanced filtering by bias level, credibility score, etc.
- [ ] Comparison view for multiple papers
- [ ] Export analysis as PDF
- [ ] Community annotations and ratings
- [ ] Advanced search filters
- [ ] Research collaboration features

## Troubleshooting

### API Keys Not Working
- Verify the API keys are correct in `.env.local`
- Check if the APIs are accessible from your network
- Try regenerating the API keys from the provider dashboards

### Slow Analysis
- The Groq LLM analysis can take 10-30 seconds per paper
- This is normal behavior for comprehensive analysis
- Consider implementing a progress bar for better UX

### No Search Results
- Try simpler search terms
- Check the CORE API is responsive
- Verify the CORE API key is valid

## License

MIT License - feel free to use this project for personal and commercial purposes.

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## Support

For issues and questions, please open an issue on the GitHub repository.
