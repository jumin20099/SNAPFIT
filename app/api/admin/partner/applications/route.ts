import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const response = await fetch('http://localhost:8080/api/partner/admin/applications', {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
} 