interface ShareCaptionInput {
  mode: 'solo' | 'squad'
}

export function buildShareCaption({ mode }: ShareCaptionInput): string {
  const baseUrl = 'https://hh-goa-id.vercel.app'
  
  if (mode === 'solo') {
    return `Just generated my HH Goa 2026 Builder ID 🌴 Make yours in seconds → ${baseUrl} #FrameInGoa`
  } else {
    return `Pulled my whole crew into one HH Goa 2026 squad ID 🌴 Upload your photos, share yours → ${baseUrl} #FrameInGoa`
  }
}
