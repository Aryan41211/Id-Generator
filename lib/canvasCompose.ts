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

const COLORS = {
  greenDeep: '#0b3d24',
  greenMid: '#14532d',
  pink: '#ec1263',
  yellow: '#f6d33c',
  cream: '#f6efd8',
  creamLine: '#d8cfa8',
  ink: '#123524',
}

function getTierColor(tier: string): string {
  switch (tier) {
    case 'Common': return '#a8a064'
    case 'Rare': return '#f6d33c'
    case 'Elite': return '#ec1263'
    case 'Legendary': return '#ff6b35'
    default: return '#f6d33c'
  }
}

function getTierTextColor(tier: string): string {
  switch (tier) {
    case 'Common': return '#123524'
    case 'Rare': return '#123524'
    case 'Elite': return '#f6efd8'
    case 'Legendary': return '#f6efd8'
    default: return '#123524'
  }
}

const MAX_WORKING_DIMENSION = 1600

async function resizeImage(blob: Blob): Promise<Blob> {
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.src = url
  await new Promise((resolve) => { img.onload = resolve })

  const longEdge = Math.max(img.width, img.height)
  if (longEdge <= MAX_WORKING_DIMENSION) {
    URL.revokeObjectURL(url)
    return blob
  }

  const scale = MAX_WORKING_DIMENSION / longEdge
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)
  URL.revokeObjectURL(url)

  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
  })
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
    drawHeight = h
    drawWidth = h * imgRatio
    drawX = x - (drawWidth - w) / 2
    drawY = y
  } else {
    drawWidth = w
    drawHeight = w / imgRatio
    drawX = x
    drawY = y - (drawHeight - h) / 2
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
}

function drawDuotoneOverlay(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save()
  ctx.globalCompositeOperation = 'overlay'
  ctx.fillStyle = COLORS.greenDeep
  ctx.globalAlpha = 0.35
  ctx.fillRect(x, y, w, h)
  ctx.globalAlpha = 0.15
  ctx.fillStyle = COLORS.cream
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

function drawGrainTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  ctx.globalAlpha = 0.04
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const size = Math.random() * 2
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'
    ctx.fillRect(x, y, size, size)
  }
  ctx.restore()
}

function drawScallopedCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  scallops: number,
  depth: number
) {
  ctx.beginPath()
  const angleStep = (Math.PI * 2) / scallops
  for (let i = 0; i < scallops; i++) {
    const angle1 = i * angleStep
    const angle2 = (i + 0.5) * angleStep
    const angle3 = (i + 1) * angleStep

    const outerR = radius
    const innerR = radius - depth

    const x1 = cx + Math.cos(angle1) * outerR
    const y1 = cy + Math.sin(angle1) * outerR
    const cpx = cx + Math.cos(angle2) * innerR
    const cpy = cy + Math.sin(angle2) * innerR
    const x2 = cx + Math.cos(angle3) * outerR
    const y2 = cy + Math.sin(angle3) * outerR

    if (i === 0) ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo(cpx, cpy, x2, y2)
  }
  ctx.closePath()
}

function drawStamp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  tier: string,
  title: string,
  radius: number
) {
  const color = getTierColor(tier)
  const textColor = getTierTextColor(tier)

  // Outer scalloped circle
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetX = 3
  ctx.shadowOffsetY = 3
  drawScallopedCircle(ctx, cx, cy, radius, 24, 8)
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()

  // Inner border ring
  ctx.beginPath()
  ctx.arc(cx, cy, radius - 12, 0, Math.PI * 2)
  ctx.strokeStyle = textColor
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.6
  ctx.stroke()
  ctx.globalAlpha = 1

  // Tier text (curved along top would be complex, just center it)
  ctx.font = `bold ${Math.round(radius * 0.2)}px "JetBrains Mono", monospace`
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(tier.toUpperCase(), cx, cy - radius * 0.22)

  // Title text
  ctx.font = `bold ${Math.round(radius * 0.16)}px "JetBrains Mono", monospace`
  ctx.fillStyle = textColor
  const words = title.split(' ')
  if (words.length <= 2) {
    ctx.fillText(title.toUpperCase(), cx, cy + radius * 0.12)
  } else {
    ctx.fillText(words[0].toUpperCase(), cx, cy + radius * 0.05)
    ctx.fillText(words.slice(1).join(' ').toUpperCase(), cx, cy + radius * 0.28)
  }

  ctx.restore()
}

function drawTornEdge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  direction: 'vertical' | 'horizontal',
  tearSize: number = 8
) {
  ctx.save()
  ctx.strokeStyle = COLORS.creamLine
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.5
  ctx.setLineDash([tearSize, tearSize])

  ctx.beginPath()
  if (direction === 'vertical') {
    ctx.moveTo(x, y)
    ctx.lineTo(x, y + length)
  } else {
    ctx.moveTo(x, y)
    ctx.lineTo(x + length, y)
  }
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

function drawDiagonalBlock(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  ctx.fillStyle = COLORS.pink
  ctx.beginPath()
  ctx.moveTo(0, h * 0.58)
  ctx.lineTo(w, h * 0.42)
  ctx.lineTo(w, h * 0.72)
  ctx.lineTo(0, h * 0.88)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawPalmMotif(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.lineCap = 'round'

  // Trunk
  ctx.beginPath()
  ctx.moveTo(0, 60)
  ctx.quadraticCurveTo(5, 30, 0, 0)
  ctx.stroke()

  // Fronds
  const fronds = [
    { angle: -40, len: 45 },
    { angle: -15, len: 50 },
    { angle: 15, len: 50 },
    { angle: 40, len: 45 },
  ]
  for (const f of fronds) {
    ctx.beginPath()
    ctx.moveTo(0, 5)
    const rad = (f.angle * Math.PI) / 180
    const endX = Math.sin(rad) * f.len
    const endY = 5 - Math.cos(rad) * f.len
    const cpx = endX * 0.5
    const cpy = 5 - Math.cos(rad) * f.len * 0.3
    ctx.quadraticCurveTo(cpx, cpy, endX, endY)
    ctx.stroke()
  }

  ctx.restore()
}

function drawSunMotif(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  ctx.save()
  ctx.fillStyle = color
  ctx.globalAlpha = 0.9
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  // Rays
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.5
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(angle) * (radius + 4), y + Math.sin(angle) * (radius + 4))
    ctx.lineTo(x + Math.cos(angle) * (radius + 14), y + Math.sin(angle) * (radius + 14))
    ctx.stroke()
  }
  ctx.restore()
}

function drawPhotoWithFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  borderWidth: number,
  rotation: number
) {
  ctx.save()

  // Drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetX = 6
  ctx.shadowOffsetY = 8

  // Move to center of photo for rotation
  const cx = x + w / 2
  const cy = y + h / 2
  ctx.translate(cx, cy)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-cx, -cy)

  // Cream border (Polaroid style)
  ctx.fillStyle = COLORS.cream
  const borderX = x - borderWidth
  const borderY = y - borderWidth
  const borderW = w + borderWidth * 2
  const borderH = h + borderWidth * 2
  ctx.fillRect(borderX, borderY, borderW, borderH)

  // Reset shadow for photo
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Draw photo
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  coverFitCrop(ctx, img, x, y, w, h)
  ctx.restore()

  // Duotone overlay
  drawDuotoneOverlay(ctx, x, y, w, h)

  ctx.restore()
}

export async function composeSoloId(
  input: SoloComposeInput,
  outputSize: { width: number; height: number } = { width: 1080, height: 1350 }
): Promise<Blob> {
  const W = outputSize.width
  const H = outputSize.height

  console.time('composeSoloId-total')

  console.time('composeSoloId-resize')
  const resizedPhoto = await resizeImage(input.photo)
  console.timeEnd('composeSoloId-resize')

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  console.time('composeSoloId-background')
  ctx.fillStyle = COLORS.greenDeep
  ctx.fillRect(0, 0, W, H)
  drawGrainTexture(ctx, W, H)
  drawDiagonalBlock(ctx, W, H)
  drawTornEdge(ctx, W - 30, 40, H - 80, 'vertical', 10)
  drawPalmMotif(ctx, -20, H * 0.35, 2.5, COLORS.yellow)
  drawSunMotif(ctx, W - 60, 80, 40, COLORS.yellow)
  ctx.save()
  ctx.font = `bold 180px "Anton", sans-serif`
  ctx.fillStyle = COLORS.cream
  ctx.globalAlpha = 0.07
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('001', 30, 20)
  ctx.restore()
  console.timeEnd('composeSoloId-background')

  console.time('composeSoloId-photo')
  const photoW = 620
  const photoH = 780
  const photoX = 60
  const photoY = 140
  const borderWidth = 14
  const photoRotation = -2.5

  const photoImg = new Image()
  const photoUrl = URL.createObjectURL(resizedPhoto)
  photoImg.src = photoUrl
  await new Promise((resolve) => { photoImg.onload = resolve })

  drawPhotoWithFrame(ctx, photoImg, photoX, photoY, photoW, photoH, borderWidth, photoRotation)
  URL.revokeObjectURL(photoUrl)
  console.timeEnd('composeSoloId-photo')

  console.time('composeSoloId-stamp')
  const stampCx = photoX + photoW + 40
  const stampCy = photoY + photoH - 60
  drawStamp(ctx, stampCx, stampCy, input.builderClass.tier, input.builderClass.title, 90)
  console.timeEnd('composeSoloId-stamp')

  console.time('composeSoloId-text')
  ctx.save()
  const nameX = photoX + photoW + 80
  const nameMaxW = W - nameX - 40
  ctx.font = `bold 82px "Anton", sans-serif`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  let displayName = input.name.toUpperCase()
  while (ctx.measureText(displayName).width > nameMaxW && displayName.length > 3) {
    displayName = displayName.slice(0, -1)
  }
  if (displayName !== input.name.toUpperCase()) displayName += '…'

  const nameLines: string[] = []
  const words = displayName.split(' ')
  let currentLine = ''
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (ctx.measureText(testLine).width > nameMaxW && currentLine) {
      nameLines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) nameLines.push(currentLine)

  const nameLineHeight = 88
  const nameStartY = photoY + 40
  for (let i = 0; i < nameLines.length && i < 4; i++) {
    ctx.fillText(nameLines[i], nameX, nameStartY + i * nameLineHeight)
  }
  ctx.restore()

  ctx.save()
  ctx.font = `500 28px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.yellow
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const stackText = (input.stack || 'YOUR STACK').toUpperCase()
  const stackY = nameStartY + Math.min(nameLines.length, 4) * nameLineHeight + 16
  ctx.fillText(stackText, nameX, stackY)
  ctx.restore()

  ctx.save()
  ctx.font = `bold 72px "Anton", sans-serif`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('HH GOA 2026', W / 2, H * 0.77)
  ctx.restore()

  ctx.save()
  ctx.font = `500 24px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.yellow
  ctx.globalAlpha = 0.7
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('#FrameInGoa', W / 2, H * 0.83)
  ctx.restore()
  console.timeEnd('composeSoloId-text')

  console.time('composeSoloId-blob')
  const result = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => { resolve(blob!) }, 'image/png')
  })
  console.timeEnd('composeSoloId-blob')
  console.timeEnd('composeSoloId-total')
  return result
}

export async function composeSquadId(
  input: SquadComposeInput,
  outputSize: { width: number; height: number } = { width: 1350, height: 1080 }
): Promise<Blob> {
  const W = outputSize.width
  const H = outputSize.height

  console.time('composeSquadId-total')

  console.time('composeSquadId-resize')
  const resizedPhotos = await Promise.all(input.people.map(p => resizeImage(p.photo)))
  console.timeEnd('composeSquadId-resize')

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  console.time('composeSquadId-background')
  ctx.fillStyle = COLORS.greenDeep
  ctx.fillRect(0, 0, W, H)
  drawGrainTexture(ctx, W, H)
  ctx.save()
  ctx.fillStyle = COLORS.pink
  ctx.beginPath()
  ctx.moveTo(0, H * 0.65)
  ctx.lineTo(W, H * 0.52)
  ctx.lineTo(W, H * 0.78)
  ctx.lineTo(0, H * 0.91)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
  drawTornEdge(ctx, 40, H - 30, W - 80, 'horizontal', 10)
  drawPalmMotif(ctx, W - 60, H * 0.2, 2, COLORS.yellow)
  drawSunMotif(ctx, 80, 70, 35, COLORS.yellow)
  ctx.save()
  ctx.font = `bold 160px "Anton", sans-serif`
  ctx.fillStyle = COLORS.cream
  ctx.globalAlpha = 0.06
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText('SQUAD', W - 40, 20)
  ctx.restore()
  console.timeEnd('composeSquadId-background')

  console.time('composeSquadId-photos')
  const numPeople = input.people.length
  const photoW = 240
  const photoH = 300
  const borderWidth = 10
  const rotations = [-3, 2, -1.5, 3]
  const totalGroupW = numPeople * photoW + (numPeople - 1) * 40
  const startX = (W - totalGroupW) / 2
  const photoY = 80

  for (let i = 0; i < numPeople; i++) {
    const person = input.people[i]
    const px = startX + i * (photoW + 40)
    const py = photoY + (i % 2 === 1 ? 20 : 0)
    const rotation = rotations[i % rotations.length]

    const photoImg = new Image()
    const photoUrl = URL.createObjectURL(resizedPhotos[i])
    photoImg.src = photoUrl
    await new Promise((resolve) => { photoImg.onload = resolve })

    drawPhotoWithFrame(ctx, photoImg, px, py, photoW, photoH, borderWidth, rotation)
    URL.revokeObjectURL(photoUrl)

    const stampCx = px + photoW / 2
    const stampCy = py + photoH + 55
    drawStamp(ctx, stampCx, stampCy, person.builderClass.tier, person.builderClass.title, 45)
  }
  console.timeEnd('composeSquadId-photos')

  console.time('composeSquadId-text')
  ctx.save()
  ctx.font = `bold 64px "Anton", sans-serif`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('HH GOA 2026 · SQUAD', W / 2, H * 0.82)
  ctx.restore()

  ctx.save()
  ctx.font = `500 22px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.yellow
  ctx.globalAlpha = 0.7
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('#FrameInGoa', W / 2, H * 0.89)
  ctx.restore()
  console.timeEnd('composeSquadId-text')

  console.time('composeSquadId-blob')
  const result = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => { resolve(blob!) }, 'image/png')
  })
  console.timeEnd('composeSquadId-blob')
  console.timeEnd('composeSquadId-total')
  return result
}