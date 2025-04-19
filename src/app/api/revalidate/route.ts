// src/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { tags } = await request.json();

    // Revalidate for each tag
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        revalidateTag(tag);
      }
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        revalidated: false,
        error: `Error revalidating cache: ${error}`,
      },
      { status: 500 }
    );
  }
}
