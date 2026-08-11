interface PersonData {
  photo: Blob
  name: string
  stack: string
  builderClass: { title: string; tier: string }
}

interface SoloComposeInput {
  photo: Blob
  name: string
  stack: string
  builderClass: { title: string; tier: string }
}

interface SquadComposeInput {
  people: PersonData[]
}

function coverFitCrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height
  const boxRatio = w / h
  
  let drawWidth: number
  let drawHeight: number
  let drawX: number
  let drawY: number
  
  if (imgRatio > boxRatio) {
    // Image is wider than box, crop sides
    drawHeight = h
    drawWidth = h * imgRatio
    drawX = x - (drawWidth - w) / 2
    drawY = y
  } else {
    // Image is taller than box, crop top/bottom
    drawWidth = w
    drawHeight = w / imgRatio
    drawX = x
    drawY = y - (drawHeight - h) / 2
  }
  
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
}

function getTierColor(tier: string): string {
  switch (tier) {
    case 'Common':
    case 'Rare':
      return '#f6d33c' // hh-yellow
    case 'Elite':
    case 'Legendary':
      return '#ec1263' // hh-pink
    default:
      return '#f6d33c'
  }
}

function getTierTextColor(tier: string): string {
  switch (tier) {
    case 'Common':
    case 'Rare':
      return '#123524' // hh-ink
    case 'Elite':
    case 'Legendary':
      return '#f6efd8' // hh-cream
    default:
      return '#123524'
  }
}

export async function composeSoloId(
  input: SoloComposeInput,
  outputSize: { width: number; height: number } = { width: 1080, height: 1350 }
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = outputSize.width
  canvas.height = outputSize.height
  const ctx = canvas.getContext('2d')!
  
  // Load the frame background
  const frameImg = new Image()
  frameImg.src = '/frame-assets/frame-solo.svg'
  await new Promise((resolve) => {
    frameImg.onload = resolve
  })
  
  // Draw the frame background
  ctx.drawImage(frameImg, 0, 0, outputSize.width, outputSize.height)
  
  // Load and draw the photo
  const photoImg = new Image()
  const photoUrl = URL.createObjectURL(input.photo)
  photoImg.src = photoUrl
  await new Promise((resolve) => {
    photoImg.onload = resolve
  })
  
  // Cover-fit crop the photo into the cutout area
  coverFitCrop(ctx, photoImg, 90, 120, 900, 675)
  
  // Clean up the object URL
  URL.revokeObjectURL(photoUrl)
  
  // Draw the name
  ctx.font = '72px Anton, sans-serif'
  ctx.fillStyle = '#f6efd8'
  ctx.textAlign = 'center'
  ctx.fillText(input.name.toUpperCase(), 540, 870)
  
  // Draw the stack
  ctx.font = '36px JetBrains Mono, monospace'
  ctx.fillStyle = '#f6d33c'
  ctx.fillText(input.stack || 'YOUR STACK', 540, 920)
  
  // Draw the builder class pill
  const pillWidth = 400
  const pillHeight = 60
  const pillX = 540 - pillWidth / 2
  const pillY = 960
  
  // Pill background
  ctx.fillStyle = getTierColor(input.builderClass.tier)
  ctx.beginPath()
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 30)
  ctx.fill()
  
  // Pill text
  ctx.font = '24px JetBrains Mono, monospace'
  ctx.fillStyle = getTierTextColor(input.builderClass.tier)
  ctx.textAlign = 'center'
  ctx.fillText(
    `${input.builderClass.tier.toUpperCase()} · ${input.builderClass.title.toUpperCase()}`,
    540,
    pillY + 40
  )
  
  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!)
    }, 'image/png')
  })
}

export async function composeSquadId(
  input: SquadComposeInput,
  outputSize: { width: number; height: number } = { width: 1350, height: 1080 }
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = outputSize.width
  canvas.height = outputSize.height
  const ctx = canvas.getContext('2d')!
  
  // Load the frame background
  const frameImg = new Image()
  frameImg.src = '/frame-assets/frame-squad.svg'
  await new Promise((resolve) => {
    frameImg.onload = resolve
  })
  
  // Draw the frame background
  ctx.drawImage(frameImg, 0, 0, outputSize.width, outputSize.height)
  
  // Calculate slot positions based on number of people
  const slotWidth = 250
  const slotHeight = 250
  const slotY = 150
  const totalSlots = 4
  const numPeople = input.people.length
  
  // Calculate spacing to center the used slots
  const totalWidth = numPeople * slotWidth
  const spacing = (outputSize.width - totalWidth) / (numPeople + 1)
  
  // Process each person
  for (let i = 0; i < numPeople; i++) {
    const person = input.people[i]
    const slotX = spacing + i * (slotWidth + spacing)
    
    // Load and draw the photo
    const photoImg = new Image()
    const photoUrl = URL.createObjectURL(person.photo)
    photoImg.src = photoUrl
    await new Promise((resolve) => {
      photoImg.onload = resolve
    })
    
    // Cover-fit crop the photo into the slot
    coverFitCrop(ctx, photoImg, slotX, slotY, slotWidth, slotHeight)
    
    // Clean up the object URL
    URL.revokeObjectURL(photoUrl)
    
    // Draw the builder class pill
    const pillWidth = 200
    const pillHeight = 40
    const pillX = slotX + (slotWidth - pillWidth) / 2
    const pillY = slotY + slotHeight + 20
    
    // Pill background
    ctx.fillStyle = getTierColor(person.builderClass.tier)
    ctx.beginPath()
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 20)
    ctx.fill()
    
    // Pill text
    ctx.font = '14px JetBrains Mono, monospace'
    ctx.fillStyle = getTierTextColor(person.builderClass.tier)
    ctx.textAlign = 'center'
    ctx.fillText(
      `${person.builderClass.tier.toUpperCase()} · ${person.builderClass.title.toUpperCase()}`,
      pillX + pillWidth / 2,
      pillY + 28
    )
  }
  
  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!)
    }, 'image/png')
  })
}