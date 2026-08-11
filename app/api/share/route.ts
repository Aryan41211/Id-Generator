import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }
    
    // Generate a random ID
    const id = Math.random().toString(36).substring(2, 15)
    
    // Upload to Vercel Blob
    const blob = await put(`share/${id}.png`, imageFile, {
      access: 'public',
    })
    
    return NextResponse.json({ id, url: blob.url })
  } catch (error) {
    console.error('Share API error:', error)
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
  }
}