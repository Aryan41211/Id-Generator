interface SoloComposeInput {
  photo: Blob
  name: string
  stack: string
}

interface SquadPersonInput {
  photo: Blob
  name: string
  stack: string
}

interface SquadComposeInput {
  people: SquadPersonInput[]
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

const MAX_WORKING_DIMENSION = 1600

interface LoadedImage {
  blob: Blob
  img: HTMLImageElement
}

async function loadAndResize(blob: Blob): Promise<LoadedImage> {
  console.log('[loadAndResize] loading blob, size:', blob.size)
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.src = url
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e))
  })
  console.log('[loadAndResize] decoded:', img.naturalWidth, 'x', img.naturalHeight)

  const longEdge = Math.max(img.width, img.height)
  if (longEdge <= MAX_WORKING_DIMENSION) {
    console.log('[loadAndResize] no resize needed (' + longEdge + ' <= ' + MAX_WORKING_DIMENSION + ')')
    return { blob, img }
  }

  const scale = MAX_WORKING_DIMENSION / longEdge
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  console.log('[loadAndResize] resizing:', img.width, 'x', img.height, '->', w, 'x', h)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)
  URL.revokeObjectURL(url)

  const resizedBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
  })

  const resizedUrl = URL.createObjectURL(resizedBlob)
  const resizedImg = new Image()
  resizedImg.src = resizedUrl
  await new Promise<void>((resolve, reject) => {
    resizedImg.onload = () => resolve()
    resizedImg.onerror = (e) => reject(new Error('Failed to load resized image: ' + e))
  })
  console.log('[loadAndResize] resized decoded:', resizedImg.naturalWidth, 'x', resizedImg.naturalHeight)

  return { blob: resizedBlob, img: resizedImg }
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
  if (imgRatio > boxRatio) {
    const drawW = h * imgRatio
    ctx.drawImage(img, x - (drawW - w) / 2, y, drawW, h)
  } else {
    const drawH = w / imgRatio
    ctx.drawImage(img, x, y - (drawH - h) / 2, w, drawH)
  }
}

function drawGrainTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  ctx.globalAlpha = 0.03
  for (let i = 0; i < 6000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'
    ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 2, Math.random() * 2)
  }
  ctx.restore()
}

function drawPhotoArea(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  borderRadius: number
) {
  ctx.save()

  ctx.fillStyle = COLORS.pink
  ctx.beginPath()
  ctx.roundRect(x - 8, y - 8, w + 16, h + 16, borderRadius + 6)
  ctx.fill()

  ctx.fillStyle = COLORS.cream
  ctx.beginPath()
  ctx.roundRect(x - 3, y - 3, w + 6, h + 6, borderRadius + 2)
  ctx.fill()

  ctx.beginPath()
  ctx.roundRect(x, y, w, h, borderRadius)
  ctx.clip()
  coverFitCrop(ctx, img, x, y, w, h)

  ctx.restore()
}

function drawTornPhotoFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  rotation: number
) {
  ctx.save()

  const cx = x + w / 2
  const cy = y + h / 2
  ctx.translate(cx, cy)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-cx, -cy)

  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetX = 3
  ctx.shadowOffsetY = 4

  ctx.fillStyle = COLORS.cream
  ctx.beginPath()
  const bx = x - 10, by = y - 10, bw = w + 20, bh = h + 20
  ctx.moveTo(bx + 4, by)
  for (let px = bx; px < bx + bw; px += 8) {
    ctx.lineTo(px, by + (Math.random() * 4 - 2))
  }
  for (let py = by; py < by + bh; py += 8) {
    ctx.lineTo(bx + bw + (Math.random() * 4 - 2), py)
  }
  for (let px = bx + bw; px > bx; px -= 8) {
    ctx.lineTo(px, by + bh + (Math.random() * 4 - 2))
  }
  for (let py = by + bh; py > by; py -= 8) {
    ctx.lineTo(bx + (Math.random() * 4 - 2), py)
  }
  ctx.closePath()
  ctx.fill()

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  coverFitCrop(ctx, img, x, y, w, h)
  ctx.restore()

  ctx.restore()
}

function drawTape(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, angle: number, color: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((angle * Math.PI) / 180)
  ctx.fillStyle = color
  ctx.globalAlpha = 0.85
  ctx.fillRect(-w / 2, -6, w, 12)
  ctx.restore()
}

function drawPushpin(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y - 8, 8, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.pink
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x - 2, y - 10, 3, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x - 1, y - 2)
  ctx.lineTo(x + 1, y - 2)
  ctx.lineTo(x, y + 4)
  ctx.closePath()
  ctx.fillStyle = '#888'
  ctx.fill()
  ctx.restore()
}

function drawHashMarks(ctx: CanvasRenderingContext2D, x: number, y: number, count: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  for (let i = 0; i < count; i++) {
    ctx.beginPath()
    ctx.moveTo(x + i * 8, y)
    ctx.lineTo(x + i * 8 + 4, y + 12)
    ctx.stroke()
  }
  ctx.restore()
}

function drawPalmBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.pink
  ctx.fill()

  ctx.strokeStyle = COLORS.greenDeep
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(cx, cy + radius * 0.5)
  ctx.quadraticCurveTo(cx + 2, cy, cx, cy - radius * 0.3)
  ctx.stroke()

  const fronds = [
    { angle: -50, len: radius * 0.45 },
    { angle: -20, len: radius * 0.5 },
    { angle: 10, len: radius * 0.5 },
    { angle: 40, len: radius * 0.45 },
  ]
  for (const f of fronds) {
    ctx.beginPath()
    ctx.moveTo(cx, cy - radius * 0.2)
    const rad = (f.angle * Math.PI) / 180
    const endX = cx + Math.sin(rad) * f.len
    const endY = cy - radius * 0.2 - Math.cos(rad) * f.len
    ctx.quadraticCurveTo(cx + Math.sin(rad) * f.len * 0.5, cy - radius * 0.2 - Math.cos(rad) * f.len * 0.3, endX, endY)
    ctx.stroke()
  }

  ctx.fillStyle = COLORS.greenDeep
  ctx.font = `bold ${Math.round(radius * 0.14)}px "JetBrains Mono", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const text = 'HACKER HOUSE GOA · '
  const totalAngle = Math.PI * 2
  const charAngle = totalAngle / text.length
  for (let i = 0; i < text.length; i++) {
    const angle = -Math.PI / 2 + i * charAngle
    ctx.save()
    ctx.translate(cx + Math.cos(angle) * (radius * 0.78), cy + Math.sin(angle) * (radius * 0.78))
    ctx.rotate(angle + Math.PI / 2)
    ctx.fillText(text[i], 0, 0)
    ctx.restore()
  }
  ctx.restore()
}

function drawCrosshairIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.2
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx - r * 1.3, cy)
  ctx.lineTo(cx + r * 1.3, cy)
  ctx.moveTo(cx, cy - r * 1.3)
  ctx.lineTo(cx, cy + r * 1.3)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, 2, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

function drawDecorativeDots(ctx: CanvasRenderingContext2D, x: number, y: number, cols: number, rows: number, color: string) {
  ctx.save()
  ctx.fillStyle = color
  ctx.globalAlpha = 0.5
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.beginPath()
      ctx.arc(x + col * 10, y + row * 10, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

function drawCornerCross(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.moveTo(x - size, y)
  ctx.lineTo(x + size, y)
  ctx.moveTo(x, y - size)
  ctx.lineTo(x, y + size)
  ctx.stroke()
  ctx.restore()
}

function drawPalmSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = color
  ctx.fillRect(-2, 0, 4, 40)
  ctx.beginPath()
  ctx.moveTo(0, -5)
  ctx.lineTo(-18, 15)
  ctx.lineTo(-5, 5)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(0, -5)
  ctx.lineTo(18, 15)
  ctx.lineTo(5, 5)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(0, -8)
  ctx.lineTo(-12, 12)
  ctx.lineTo(-3, 2)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(0, -8)
  ctx.lineTo(12, 12)
  ctx.lineTo(3, 2)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawBrushStroke(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x + 6, y)
  ctx.lineTo(x + w - 4, y + 2)
  ctx.lineTo(x + w, y + 6)
  ctx.lineTo(x + w - 2, y + h - 4)
  ctx.lineTo(x + w - 6, y + h)
  ctx.lineTo(x + 4, y + h - 2)
  ctx.lineTo(x, y + h - 6)
  ctx.lineTo(x + 2, y + 4)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawSunsetCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.clip()
  const grad = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius)
  grad.addColorStop(0, '#f6d33c')
  grad.addColorStop(0.5, '#ec1263')
  grad.addColorStop(1, '#0b3d24')
  ctx.fillStyle = grad
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
  ctx.fillStyle = '#f6d33c'
  ctx.beginPath()
  ctx.arc(cx, cy + 10, radius * 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(11, 61, 36, 0.4)'
  ctx.fillRect(cx - radius, cy + radius * 0.3, radius * 2, radius * 0.7)
  ctx.fillStyle = '#0b3d24'
  ctx.fillRect(cx - radius * 0.5, cy - radius * 0.1, 3, radius * 0.4)
  ctx.beginPath()
  ctx.moveTo(cx - radius * 0.5, cy - radius * 0.1)
  ctx.lineTo(cx - radius * 0.7, cy + radius * 0.1)
  ctx.lineTo(cx - radius * 0.45, cy)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(cx - radius * 0.5, cy - radius * 0.1)
  ctx.lineTo(cx - radius * 0.3, cy + radius * 0.05)
  ctx.lineTo(cx - radius * 0.48, cy)
  ctx.closePath()
  ctx.fill()
  ctx.fillRect(cx + radius * 0.3, cy - radius * 0.15, 3, radius * 0.45)
  ctx.beginPath()
  ctx.moveTo(cx + radius * 0.3, cy - radius * 0.15)
  ctx.lineTo(cx + radius * 0.55, cy + radius * 0.05)
  ctx.lineTo(cx + radius * 0.28, cy)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(cx + radius * 0.3, cy - radius * 0.15)
  ctx.lineTo(cx + radius * 0.1, cy + radius * 0.05)
  ctx.lineTo(cx + radius * 0.32, cy)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = COLORS.yellow
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save()
  ctx.fillStyle = color
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.moveTo(x, y - size)
  ctx.lineTo(x + size * 0.3, y - size * 0.3)
  ctx.lineTo(x + size, y)
  ctx.lineTo(x + size * 0.3, y + size * 0.3)
  ctx.lineTo(x, y + size)
  ctx.lineTo(x - size * 0.3, y + size * 0.3)
  ctx.lineTo(x - size, y)
  ctx.lineTo(x - size * 0.3, y - size * 0.3)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawBirds(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.quadraticCurveTo(x + 5, y - 5, x + 10, y)
  ctx.quadraticCurveTo(x + 15, y - 5, x + 20, y)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 25, y - 5)
  ctx.quadraticCurveTo(x + 30, y - 10, x + 35, y - 5)
  ctx.quadraticCurveTo(x + 40, y - 10, x + 45, y - 5)
  ctx.stroke()
  ctx.restore()
}

export async function composeSoloId(
  input: SoloComposeInput,
  outputSize: { width: number; height: number } = { width: 1080, height: 1350 }
): Promise<Blob> {
  const W = outputSize.width
  const H = outputSize.height

  console.time('composeSoloId-total')
  console.log('[composeSoloId] START — name:', input.name, 'stack:', input.stack)

  const { ensureFonts } = await import('@/lib/ensureFonts')
  await ensureFonts()
  console.log('[composeSoloId] STEP 0: fonts ready')

  const { img: photoImg } = await loadAndResize(input.photo)
  console.log('[composeSoloId] STEP 0: photo loaded', photoImg.naturalWidth, 'x', photoImg.naturalHeight)

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // STEP 1: Background
  console.log('[composeSoloId] STEP 1: drawing background')
  ctx.fillStyle = COLORS.greenDeep
  ctx.fillRect(0, 0, W, H)
  drawGrainTexture(ctx, W, H)

  // STEP 2: Photo
  const photoX = 80
  const photoY = 160
  const photoW = 920
  const photoH = 680
  const photoRadius = 20
  console.log('[composeSoloId] STEP 2: drawing photo at', { photoX, photoY, photoW, photoH })
  console.log('[composeSoloId] STEP 2: photo image ready:', photoImg.complete, 'natural:', photoImg.naturalWidth, 'x', photoImg.naturalHeight)
  drawPhotoArea(ctx, photoImg, photoX, photoY, photoW, photoH, photoRadius)

  // Verify photo was drawn by checking pixel at center of photo area
  const checkX = photoX + photoW / 2
  const checkY = photoY + photoH / 2
  const pixel = ctx.getImageData(checkX, checkY, 1, 1).data
  console.log('[composeSoloId] STEP 2: pixel at photo center (' + checkX + ',' + checkY + '):', { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] })

  // STEP 3: Branding overlay (drawn on canvas, NOT from PNG)
  console.log('[composeSoloId] STEP 3: drawing branding overlay')
  // Top left: "HH"
  ctx.save()
  ctx.font = `bold 130px "Anton", sans-serif`
  ctx.fillStyle = COLORS.yellow
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('HH', 40, 20)
  ctx.restore()

  // Top right: "2026"
  ctx.save()
  ctx.font = `bold 120px "Anton", sans-serif`
  ctx.fillStyle = COLORS.pink
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText('2026', W - 40, 20)
  ctx.restore()

  // "GOA, INDIA" tag
  ctx.save()
  ctx.fillStyle = COLORS.yellow
  ctx.fillRect(W - 220, 148, 180, 30)
  ctx.font = `bold 16px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.greenDeep
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('GOA, INDIA', W - 130, 163)
  ctx.restore()

  // "BUILD THIS. SHIP THIS. CHANGE SOMETHING."
  ctx.save()
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('BUILD THIS.', 260, 40)
  ctx.fillText('SHIP THIS.', 260, 58)
  ctx.fillText('CHANGE SOMETHING.', 260, 76)
  ctx.restore()

  drawCrosshairIcon(ctx, 480, 60, 22, COLORS.cream)

  // "GOA" below HH
  ctx.save()
  ctx.font = `bold 110px "Anton", sans-serif`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('GOA', 40, 145)
  ctx.restore()

  // "LESS NOISE. MORE SIGNAL."
  ctx.save()
  ctx.font = `bold 12px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('LESS NOISE.', 40, 270)
  ctx.fillText('MORE SIGNAL.', 40, 286)
  ctx.restore()

  drawPalmBadge(ctx, 80, 380, 55)
  drawCornerCross(ctx, 50, 580, 8, COLORS.yellow)
  drawCornerCross(ctx, 130, 580, 8, COLORS.cream)

  // Vertical "BUILDER ID" on right
  ctx.save()
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.yellow
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  const vertText = 'BUILDER ID'
  for (let i = 0; i < vertText.length; i++) {
    ctx.fillText(vertText[i], W - 55, 190 + i * 16)
  }
  ctx.restore()

  // "001" large number
  ctx.save()
  ctx.font = `bold 72px "Anton", sans-serif`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('001', W - 55, 380)
  ctx.restore()

  drawDecorativeDots(ctx, W - 100, 500, 5, 4, COLORS.yellow)
  drawCornerCross(ctx, W - 50, 580, 8, COLORS.cream)

  // Bottom cream section
  const bottomY = 880
  ctx.save()
  ctx.fillStyle = COLORS.cream
  ctx.beginPath()
  ctx.moveTo(0, bottomY)
  for (let x = 0; x <= W; x += 12) {
    ctx.lineTo(x, bottomY + (Math.random() * 6 - 3))
  }
  ctx.lineTo(W, H)
  ctx.lineTo(0, H)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // "BUILDER" label
  let labelY = bottomY + 40
  ctx.save()
  ctx.fillStyle = COLORS.pink
  ctx.fillRect(40, labelY, 140, 28)
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('BUILDER', 50, labelY + 14)
  ctx.restore()
  drawHashMarks(ctx, 190, labelY + 8, 10, COLORS.pink)

  // STEP 4: Name
  labelY += 44
  console.log('[composeSoloId] STEP 4: drawing name "' + input.name + '" at y=' + labelY)
  ctx.save()
  ctx.font = `bold 64px "Anton", sans-serif`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  let displayName = input.name.toUpperCase()
  const maxNameW = W - 360
  while (ctx.measureText(displayName).width > maxNameW && displayName.length > 3) {
    displayName = displayName.slice(0, -1)
  }
  if (displayName !== input.name.toUpperCase()) displayName += '…'
  ctx.fillText(displayName, 40, labelY)
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = COLORS.pink
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(40, labelY + 72)
  ctx.lineTo(maxNameW + 40, labelY + 72)
  ctx.stroke()
  ctx.restore()

  // STEP 5: Stack
  labelY += 90
  console.log('[composeSoloId] STEP 5: drawing stack "' + input.stack + '" at y=' + labelY)
  ctx.save()
  ctx.font = `500 28px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText((input.stack || 'YOUR STACK').toUpperCase(), 40, labelY)
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = COLORS.ink
  ctx.lineWidth = 1
  ctx.setLineDash([6, 4])
  ctx.beginPath()
  ctx.moveTo(40, labelY + 36)
  ctx.lineTo(340, labelY + 36)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()

  // Footer
  const footerY = H - 50
  ctx.save()
  ctx.fillStyle = COLORS.pink
  ctx.fillRect(40, footerY, 180, 32)
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('#FRAMEINGOA', 50, footerY + 16)
  ctx.restore()

  ctx.save()
  ctx.font = `500 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('THE BUILDERS ARE HERE.', W / 2, footerY + 16)
  ctx.restore()

  ctx.save()
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText('HH GOA 2026', W - 40, footerY + 16)
  ctx.restore()

  drawPalmSilhouette(ctx, W - 45, footerY - 10, 0.6, COLORS.pink)

  // Export
  console.log('[composeSoloId] STEP 6: exporting blob')
  const result = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => { resolve(blob!) }, 'image/png')
  })
  console.log('[composeSoloId] DONE — blob size:', result.size)
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
  console.log('[composeSquadId] START —', input.people.length, 'people')

  const { ensureFonts } = await import('@/lib/ensureFonts')
  await ensureFonts()

  const loadedImages = await Promise.all(input.people.map(p => loadAndResize(p.photo)))

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // STEP 1: Background
  console.log('[composeSquadId] STEP 1: drawing background')
  ctx.fillStyle = COLORS.greenDeep
  ctx.fillRect(0, 0, W, H)
  drawGrainTexture(ctx, W, H)

  // STEP 2: Branding (top area)
  console.log('[composeSquadId] STEP 2: drawing branding')
  ctx.save()
  ctx.font = `bold 110px "Anton", sans-serif`
  ctx.fillStyle = COLORS.yellow
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('HH', 40, 20)
  ctx.restore()

  ctx.save()
  ctx.font = `bold 100px "Anton", sans-serif`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('GOA', 40, 125)
  ctx.restore()

  ctx.save()
  ctx.font = `bold 13px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('BUILD THIS.', 230, 35)
  ctx.fillText('SHIP THIS.', 230, 52)
  ctx.fillText('CHANGE SOMETHING.', 230, 69)
  ctx.restore()

  drawCrosshairIcon(ctx, 430, 60, 22, COLORS.cream)

  drawBrushStroke(ctx, 200, 110, 600, 80, COLORS.cream)
  ctx.save()
  ctx.font = `bold 48px "Anton", sans-serif`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('THE BUILDERS', 500, 138)
  ctx.restore()
  ctx.save()
  ctx.font = `italic bold 42px "Anton", sans-serif`
  ctx.fillStyle = COLORS.pink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Are Here.', 500, 175)
  ctx.restore()

  ctx.save()
  ctx.font = `bold 100px "Anton", sans-serif`
  ctx.fillStyle = COLORS.pink
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText('2026', W - 40, 15)
  ctx.restore()

  ctx.save()
  ctx.fillStyle = COLORS.yellow
  ctx.fillRect(W - 210, 120, 170, 28)
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.greenDeep
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('GOA, INDIA', W - 125, 134)
  ctx.restore()

  drawPalmBadge(ctx, W - 100, 220, 50)
  drawSparkle(ctx, 180, 30, 8, COLORS.yellow)
  drawSparkle(ctx, 190, 100, 5, COLORS.cream)
  drawBirds(ctx, 550, 30, COLORS.cream)
  drawDecorativeDots(ctx, W - 130, 290, 4, 3, COLORS.yellow)
  drawPalmSilhouette(ctx, 50, 350, 1.5, COLORS.cream)

  // STEP 3: Photos
  const numPeople = Math.min(input.people.length, 3)
  const photoW = 300
  const photoH = 280
  const photoGap = 50
  const totalPhotosW = numPeople * photoW + (numPeople - 1) * photoGap
  const photosStartX = (W - totalPhotosW) / 2
  const photosY = 240
  const rotations = [-3, 0, 2.5]
  const tapeColors = [COLORS.yellow, COLORS.yellow, COLORS.pink]

  const photoPositions: Array<{ cx: number; labelY: number; numCy: number }> = []

  console.log('[composeSquadId] STEP 3: drawing', numPeople, 'photos')
  for (let i = 0; i < numPeople; i++) {
    const px = photosStartX + i * (photoW + photoGap)
    const py = photosY + (i === 1 ? 15 : 0)
    const rotation = rotations[i]

    console.log('[composeSquadId] photo', i, ': loaded:', loadedImages[i].img.complete, 'natural:', loadedImages[i].img.naturalWidth, 'x', loadedImages[i].img.naturalHeight)

    drawTornPhotoFrame(ctx, loadedImages[i].img, px, py, photoW, photoH, rotation)
    drawTape(ctx, px + 30, py - 5, 50, -25, tapeColors[i])
    if (i === 1) drawPushpin(ctx, px + photoW / 2, py - 8)

    const numCx = px + photoW / 2
    const numCy = py + photoH + 30
    photoPositions.push({ cx: numCx, labelY: numCy + 26, numCy })

    ctx.save()
    ctx.beginPath()
    ctx.arc(numCx, numCy, 16, 0, Math.PI * 2)
    ctx.fillStyle = COLORS.ink
    ctx.fill()
    ctx.font = `bold 14px "JetBrains Mono", monospace`
    ctx.fillStyle = COLORS.cream
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`0${i + 1}`, numCx, numCy)
    ctx.restore()
  }

  drawDecorativeDots(ctx, W - 80, 400, 4, 4, COLORS.pink)
  drawSparkle(ctx, W - 60, 500, 6, COLORS.yellow)

  // STEP 4: Bottom section
  const bottomY = 640
  drawBrushStroke(ctx, 40, bottomY, 340, 90, COLORS.cream)
  ctx.save()
  ctx.font = `bold 12px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.pink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('✦ TEAM TAGLINE ✦', 70, bottomY + 12)
  ctx.restore()
  ctx.save()
  ctx.font = `bold 36px "Anton", sans-serif`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('THE BUILDERS', 70, bottomY + 35)
  ctx.fillText('ARE HERE', 70, bottomY + 65)
  ctx.restore()

  drawSunsetCircle(ctx, W / 2, bottomY + 45, 55)

  drawBrushStroke(ctx, W - 380, bottomY, 340, 90, COLORS.cream)
  ctx.save()
  ctx.font = `bold 12px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.pink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('✦ BUILDER CREW ✦', W - 350, bottomY + 12)
  ctx.restore()
  ctx.save()
  ctx.font = `bold 30px "Anton", sans-serif`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('HH GOA', W - 350, bottomY + 38)
  ctx.fillText('2026', W - 350, bottomY + 65)
  ctx.restore()

  drawSparkle(ctx, 30, bottomY + 100, 6, COLORS.pink)
  drawSparkle(ctx, W - 30, bottomY + 100, 6, COLORS.yellow)
  drawCornerCross(ctx, 400, bottomY + 95, 6, COLORS.yellow)

  ctx.save()
  ctx.fillStyle = COLORS.pink
  const tagW = 180
  ctx.fillRect(W - tagW - 40, H - 45, tagW, 30)
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('#FRAMEINGOA', W - tagW - 30, H - 30)
  ctx.restore()

  drawCornerCross(ctx, 60, H - 40, 6, COLORS.yellow)
  drawCornerCross(ctx, 200, H - 40, 6, COLORS.pink)
  drawDecorativeDots(ctx, 300, H - 45, 3, 2, COLORS.yellow)

  // STEP 5: Names + stacks (on top)
  console.log('[composeSquadId] STEP 5: drawing names and stacks')
  for (let i = 0; i < numPeople; i++) {
    const { cx: numCx, labelY } = photoPositions[i]

    ctx.save()
    ctx.fillStyle = COLORS.pink
    ctx.fillRect(numCx - 40, labelY, 80, 20)
    ctx.font = `bold 10px "JetBrains Mono", monospace`
    ctx.fillStyle = COLORS.cream
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('BUILDER', numCx, labelY + 10)
    ctx.restore()

    ctx.save()
    ctx.font = `bold 22px "Anton", sans-serif`
    ctx.fillStyle = COLORS.cream
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    let name = input.people[i].name.toUpperCase()
    const maxNameW = photoW + 20
    while (ctx.measureText(name).width > maxNameW && name.length > 3) {
      name = name.slice(0, -1)
    }
    if (name !== input.people[i].name.toUpperCase()) name += '…'
    ctx.fillText(name, numCx, labelY + 26)
    ctx.restore()

    const stackTagY = labelY + 54
    ctx.save()
    ctx.fillStyle = COLORS.yellow
    ctx.fillRect(numCx - 25, stackTagY, 50, 16)
    ctx.font = `bold 8px "JetBrains Mono", monospace`
    ctx.fillStyle = COLORS.greenDeep
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('STACK', numCx, stackTagY + 8)
    ctx.restore()

    ctx.save()
    ctx.font = `500 12px "JetBrains Mono", monospace`
    ctx.fillStyle = COLORS.cream
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText((input.people[i].stack || '—').toUpperCase(), numCx, stackTagY + 22)
    ctx.restore()
  }

  // Export
  console.log('[composeSquadId] STEP 6: exporting blob')
  const result = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => { resolve(blob!) }, 'image/png')
  })
  console.log('[composeSquadId] DONE — blob size:', result.size)
  console.timeEnd('composeSquadId-total')
  return result
}
