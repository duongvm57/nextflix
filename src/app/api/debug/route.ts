import { NextRequest, NextResponse } from 'next/server';

// Store API calls for debugging
const apiCalls: {
  timestamp: number;
  url: string;
  method: string;
  cache: string;
}[] = [];

// Maximum number of calls to store
const MAX_CALLS = 100;

// Add a call to the log
export function logApiCall(url: string, method: string, cache: string = 'unknown') {
  apiCalls.unshift({
    timestamp: Date.now(),
    url,
    method,
    cache,
  });

  // Keep only the most recent calls
  if (apiCalls.length > MAX_CALLS) {
    apiCalls.pop();
  }
}

// API endpoint to get the logs
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  // Add CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  // Return the logs
  return NextResponse.json(
    {
      calls: apiCalls,
      count: apiCalls.length,
      timestamp: Date.now(),
    },
    { headers }
  );
}

// Clear logs
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(_request: NextRequest) {
  // Clear the array
  apiCalls.length = 0;

  // Add CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  // Return success
  return NextResponse.json(
    {
      success: true,
      message: 'Logs cleared',
      timestamp: Date.now(),
    },
    { headers }
  );
}

// Handle OPTIONS request for CORS
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(_request: NextRequest) {
  // Add CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return new NextResponse(null, { headers });
}
