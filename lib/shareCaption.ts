interface ShareCaptionInput {
  mode: 'solo' | 'squad'
  builderClass?: { title: string; tier: string }
}

export function buildShareCaption({ mode, builderClass }: ShareCaptionInput): string {
  // Use a default URL for server-side rendering, actual URL will be used on client
  const baseUrl = 'https://hh-goa-id.vercel.app'
  
  if (mode === 'solo' && builderClass) {
    return `Just generated my HH Goa 2026 Builder ID — I'm a ${builderClass.title} 🌴 Make yours in seconds → ${baseUrl} #FrameInGoa`
  } else {
    return `Pulled my whole crew into one HH Goa 2026 squad ID 🌴 Upload your photos, get a class, share yours → ${baseUrl} #FrameInGoa`
  }
}