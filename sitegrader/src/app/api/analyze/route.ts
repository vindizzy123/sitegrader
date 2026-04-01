import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { isValidUrl, normalizeUrl } from '@/lib/utils'
import { fetchPage } from '@/lib/analyzer/fetcher'
import { parsePage } from '@/lib/analyzer/parser'
import { runAllScorers } from '@/lib/analyzer/scorers'
import { computeGrade } from '@/lib/analyzer/grade'
import { supabase } from '@/lib/supabase'
import type { Report } from '@/lib/analyzer/types'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const rawUrl = (body as Record<string, unknown>)?.url
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return NextResponse.json({ error: 'Missing required field: url' }, { status: 400 })
  }

  const normalized = normalizeUrl(rawUrl)
  if (!isValidUrl(normalized)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  // Check cache: existing report for same URL analyzed within last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: cached } = await supabase
    .from('reports')
    .select('id')
    .eq('url', normalized)
    .gte('analyzed_at', since)
    .order('analyzed_at', { ascending: false })
    .limit(1)
    .single()

  if (cached?.id) {
    return NextResponse.json({ id: cached.id, cached: true })
  }

  // Run analysis pipeline
  const startMs = Date.now()

  let fetchResult: Awaited<ReturnType<typeof fetchPage>>
  try {
    fetchResult = await fetchPage(normalized)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch URL'
    return NextResponse.json({ error: message }, { status: 422 })
  }

  let parsed: Awaited<ReturnType<typeof parsePage>>
  try {
    parsed = parsePage(
      fetchResult.html,
      fetchResult.url,
      fetchResult.headers,
      fetchResult.statusCode,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse page'
    return NextResponse.json({ error: message }, { status: 422 })
  }

  let scorerResult: Awaited<ReturnType<typeof runAllScorers>>
  try {
    scorerResult = runAllScorers(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to score page'
    return NextResponse.json({ error: message }, { status: 422 })
  }

  const durationMs = Date.now() - startMs
  const { overallScore, categories, issues } = scorerResult
  const { letter: grade, color: gradeColor } = computeGrade(overallScore)
  const id = nanoid(10)
  const analyzedAt = new Date().toISOString()

  const report: Report = {
    id,
    url: normalized,
    overallScore,
    grade,
    gradeColor,
    categories,
    issues,
    analyzedAt,
    durationMs,
  }

  // Persist to Supabase (non-fatal on failure)
  const { error: insertError } = await supabase.from('reports').insert({
    id: report.id,
    url: report.url,
    overall_score: report.overallScore,
    grade: report.grade,
    grade_color: report.gradeColor,
    categories: report.categories,
    issues: report.issues,
    analyzed_at: report.analyzedAt,
    duration_ms: report.durationMs,
  })

  if (insertError) {
    console.error('Supabase insert failed:', insertError.message)
  }

  return NextResponse.json({ id, cached: false })
}
