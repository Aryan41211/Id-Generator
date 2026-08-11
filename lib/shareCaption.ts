interface ShareCaptionInput {
  mode: 'solo' | 'squad'
  builderClass?: { title: string; tier: string }
}

export function buildShareCaption({ mode, builderClass }: ShareCaptionInput): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hh-goa-id.vercel.app'
  
  if (mode === 'solo' && builderClass) {
    return `Just generated my HH Goa 2026 Builder ID — I'm a ${builderClass.title} 🌴 Make yours in seconds → ${baseUrl} #FrameInGoa`
  } else {
    return `Pulled my whole crew into one HH Goa 2026 squad ID 🌴 Upload your photos, get a class, share yours → ${baseUrl} #FrameInGoa`
  }
}