import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OneLittleThing/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 });
    }

    const html = await response.text();

    // Try to extract title from various sources
    let title = '';

    // Try OpenGraph title
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitleMatch) {
      title = ogTitleMatch[1];
    }

    // Try Twitter title
    if (!title) {
      const twitterTitleMatch = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
      if (twitterTitleMatch) {
        title = twitterTitleMatch[1];
      }
    }

    // Try regular title tag
    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1];
      }
    }

    // Clean up the title
    title = title.trim()
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ');

    // Truncate if too long
    if (title.length > 100) {
      title = title.substring(0, 97) + '...';
    }

    return NextResponse.json({ title: title || 'Untitled' });
  } catch (error) {
    console.error('Error fetching title:', error);
    return NextResponse.json({ error: 'Failed to parse URL' }, { status: 500 });
  }
}
