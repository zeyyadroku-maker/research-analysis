import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function GET() {
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id

  try {
    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('bookmarked_at', { ascending: false })

    if (error) {
      throw error
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
          ...bookmark,
          analysis: analysis?.analysis_data || {},
        }
      })
    )

    return NextResponse.json(bookmarksWithAnalyses)
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id

  try {
    const body = await req.json()
    const { paper, analysis } = body

    // Check if already bookmarked
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('paper_id', paper.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Paper already bookmarked' }, { status: 409 })
    }

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
      throw bookmarkError
    }

    // Insert analysis
    const { error: analysisError } = await supabase.from('analyses').insert({
      user_id: userId,
      bookmark_id: bookmark.id,
      analysis_data: analysis,
    })

    if (analysisError) {
      throw analysisError
    }

    return NextResponse.json(bookmark, { status: 201 })
  } catch (error) {
    console.error('Error creating bookmark:', error)
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id

  try {
    const { searchParams } = new URL(req.url)
    const bookmarkId = searchParams.get('id')

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 })
    }

    // Verify ownership
    const { data: bookmark, error: fetchError } = await supabase
      .from('bookmarks')
      .select('user_id')
      .eq('id', bookmarkId)
      .single()

    if (fetchError || !bookmark || bookmark.user_id !== userId) {
      return NextResponse.json({ error: 'Bookmark not found or unauthorized' }, { status: 404 })
    }

    // Delete bookmark (analyses cascade delete automatically)
    const { error: deleteError } = await supabase.from('bookmarks').delete().eq('id', bookmarkId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 })
  }
}
