'use client'

import { useState, useRef } from 'react'
import heic2any from 'heic2any'

interface UploadSlotProps {
  onImageReady: (imageBlob: Blob) => void
  onRemove?: () => void
  showRemove?: boolean
}

export default function UploadSlot({ onImageReady, onRemove, showRemove = false }: UploadSlotProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    setError(null)
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']
    const validExtensions = ['.jpg', '.jpeg', '.png', '.heic', '.heif']
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('Please upload a JPG, PNG, or HEIC image')
      return
    }
    
    // Check file size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be under 15MB')
      return
    }
    
    setIsLoading(true)
    
    try {
      let imageBlob: Blob
      
      // Check if it's a HEIC file
      if (file.type === 'image/heic' || file.type === 'image/heif' || 
          fileExtension === '.heic' || fileExtension === '.heif') {
        // Convert HEIC to JPEG
        const jpegBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        })
        imageBlob = Array.isArray(jpegBlob) ? jpegBlob[0] : jpegBlob
      } else {
        imageBlob = file
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(imageBlob)
      setPreview(previewUrl)
      
      // Call callback with the processed image
      onImageReady(imageBlob)
    } catch (err) {
      console.error('Error processing image:', err)
      setError('Error processing image. Please try another file.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onRemove?.()
  }

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.heic,.heif"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Uploaded preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-hh-cream-line"
          />
          {showRemove && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-hh-pink text-hh-cream rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-hh-pink/90 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-hh-ink bg-hh-cream rounded-lg p-8 text-center cursor-pointer hover:border-hh-pink transition-colors"
        >
          {isLoading ? (
            <div className="text-hh-ink font-body">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hh-pink mx-auto mb-4"></div>
              Converting HEIC...
            </div>
          ) : (
            <>
              <div className="text-hh-ink font-body">
                <svg className="w-12 h-12 mx-auto mb-4 text-hh-ink/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg mb-2">Drop your photo or tap to upload</p>
                <p className="text-sm text-hh-ink/60">JPG, PNG, or HEIC (max 15MB)</p>
              </div>
            </>
          )}
        </div>
      )}
      
      {error && (
        <div className="text-hh-pink text-sm mt-2 font-body">
          {error}
        </div>
      )}
    </div>
  )
}