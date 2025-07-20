import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Admin test API working' })
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ 
      message: 'Admin test PUT working', 
      received: body 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Admin test PUT failed' },
      { status: 500 }
    )
  }
} 