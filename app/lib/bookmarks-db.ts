import { supabase } from './supabase'
import { Paper, AnalysisResult } from '@/app/types'

export interface BookmarkedPaper {
  id: string
  user_id: string
  paper_id: string
  paper_title: string
  paper_authors: string[]
  paper_abstract?: string
  paper_url?: string
  paper_year?: number
  paper_doi?: string
  bookmarked_at: string
  analysis: AnalysisResult
}

// Get all bookmarks for current user
export async function getBookmarks(): Promise<BookmarkedPaper[]> {
  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('*')
    .order('bookmarked_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookmarks:', error)
    return []
  }

  // Fetch analyses for each bookmark
  const bookmarksWithAnalyses = await Promise.all(
    (bookmarks || []).map(async (bookmark) => {
      const { data: analysis } = await supabase
        .from('analyses')
        .select('analysis_data')
        .eq('bookmark_id', bookmark.id)
        .single()

      return {
        id: bookmark.id,
        user_id: bookmark.user_id,
        paper_id: bookmark.paper_id,
        paper_title: bookmark.paper_title,
        paper_authors: bookmark.paper_authors,
        paper_abstract: bookmark.paper_abstract,
        paper_url: bookmark.paper_url,
        paper_year: bookmark.paper_year,
        paper_doi: bookmark.paper_doi,
        bookmarked_at: bookmark.bookmarked_at,
        analysis: analysis?.analysis_data || {},
      } as BookmarkedPaper
    })
  )

  return bookmarksWithAnalyses
}

// Check if paper is already bookmarked
export async function isBookmarked(paperId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('paper_id', paperId)
    .single()

  return !error && !!data
}

// Add bookmark
export async function addBookmark(
  paper: Paper,
  analysis: AnalysisResult,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Insert bookmark
    const { data: bookmark, error: bookmarkError } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        paper_id: paper.id,
        paper_title: paper.title,
        paper_authors: paper.authors || [],
        paper_abstract: paper.abstract,
        paper_url: paper.url,
        paper_year: paper.year,
        paper_doi: paper.doi,
      })
      .select()
      .single()

    if (bookmarkError) {
      return { success: false, error: bookmarkError.message }
    }

    // Insert analysis
    const { error: analysisError } = await supabase.from('analyses').insert({
      user_id: userId,
      bookmark_id: bookmark.id,
      analysis_data: analysis,
    })

    if (analysisError) {
      return { success: false, error: analysisError.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// Remove bookmark
export async function removeBookmark(bookmarkId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('bookmarks').delete().eq('id', bookmarkId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
