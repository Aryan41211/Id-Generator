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

  // Pink circle
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.pink
  ctx.fill()

  // Palm tree
  ctx.strokeStyle = COLORS.greenDeep
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'

  // Trunk
  ctx.beginPath()
  ctx.moveTo(cx, cy + radius * 0.5)
  ctx.quadraticCurveTo(cx + 2, cy, cx, cy - radius * 0.3)
  ctx.stroke()

  // Fronds
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

  // Ring text: "HACKER HOUSE GOA · HACKER HOUSE GOA"
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

function drawGlobeIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.6

  // Outer circle
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()

  // Horizontal line
  ctx.beginPath()
  ctx.moveTo(cx - r, cy)
  ctx.lineTo(cx + r, cy)
  ctx.stroke()

  // Vertical line
  ctx.beginPath()
  ctx.moveTo(cx, cy - r)
  ctx.lineTo(cx, cy + r)
  ctx.stroke()

  // Ellipses
  ctx.beginPath()
  ctx.ellipse(cx, cy, r * 0.5, r, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(cx, cy, r, r * 0.5, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.restore()
}

function drawCrosshairIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.2
  ctx.globalAlpha = 0.7

  // Circle
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()

  // Cross
  ctx.beginPath()
  ctx.moveTo(cx - r * 1.3, cy)
  ctx.lineTo(cx + r * 1.3, cy)
  ctx.moveTo(cx, cy - r * 1.3)
  ctx.lineTo(cx, cy + r * 1.3)
  ctx.stroke()

  // Inner dot
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

function drawBuilderStamp(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  ctx.save()

  // Outer ring
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = COLORS.pink
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Inner ring
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 0.75, 0, Math.PI * 2)
  ctx.stroke()

  // Globe lines inside
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx - radius * 0.45, cy)
  ctx.lineTo(cx + radius * 0.45, cy)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, cy - radius * 0.45)
  ctx.lineTo(cx, cy + radius * 0.45)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(cx, cy, radius * 0.25, radius * 0.45, 0, 0, Math.PI * 2)
  ctx.stroke()

  // Circular text: "BUILD • SHIP • REPEAT •"
  ctx.fillStyle = COLORS.pink
  ctx.font = `bold ${Math.round(radius * 0.13)}px "JetBrains Mono", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const text = 'BUILD • SHIP • REPEAT • '
  const totalAngle = Math.PI * 2
  const charAngle = totalAngle / text.length
  for (let i = 0; i < text.length; i++) {
    const angle = -Math.PI / 2 + i * charAngle
    ctx.save()
    ctx.translate(cx + Math.cos(angle) * (radius * 0.88), cy + Math.sin(angle) * (radius * 0.88))
    ctx.rotate(angle + Math.PI / 2)
    ctx.fillText(text[i], 0, 0)
    ctx.restore()
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

  // Ragged/cream border
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

  // Draw photo
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

  // Pin head (pink circle)
  ctx.beginPath()
  ctx.arc(x, y - 8, 8, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.pink
  ctx.fill()

  // Shine
  ctx.beginPath()
  ctx.arc(x - 2, y - 10, 3, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fill()

  // Pin point
  ctx.beginPath()
  ctx.moveTo(x - 1, y - 2)
  ctx.lineTo(x + 1, y - 2)
  ctx.lineTo(x, y + 4)
  ctx.closePath()
  ctx.fillStyle = '#888'
  ctx.fill()

  ctx.restore()
}

function drawSunsetCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  ctx.save()

  // Clip circle
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.clip()

  // Sky gradient
  const grad = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius)
  grad.addColorStop(0, '#f6d33c')
  grad.addColorStop(0.5, '#ec1263')
  grad.addColorStop(1, '#0b3d24')
  ctx.fillStyle = grad
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)

  // Sun
  ctx.fillStyle = '#f6d33c'
  ctx.beginPath()
  ctx.arc(cx, cy + 10, radius * 0.3, 0, Math.PI * 2)
  ctx.fill()

  // Water reflection
  ctx.fillStyle = 'rgba(11, 61, 36, 0.4)'
  ctx.fillRect(cx - radius, cy + radius * 0.3, radius * 2, radius * 0.7)

  // Palm silhouettes
  ctx.fillStyle = '#0b3d24'
  // Left palm
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

  // Right palm
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

  // Border ring
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

  // 4-point star
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

  // Bird 1
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.quadraticCurveTo(x + 5, y - 5, x + 10, y)
  ctx.quadraticCurveTo(x + 15, y - 5, x + 20, y)
  ctx.stroke()

  // Bird 2
  ctx.beginPath()
  ctx.moveTo(x + 25, y - 5)
  ctx.quadraticCurveTo(x + 30, y - 10, x + 35, y - 5)
  ctx.quadraticCurveTo(x + 40, y - 10, x + 45, y - 5)
  ctx.stroke()

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

  // Pink outer border (brush stroke effect)
  ctx.fillStyle = COLORS.pink
  ctx.beginPath()
  ctx.roundRect(x - 8, y - 8, w + 16, h + 16, borderRadius + 6)
  ctx.fill()

  // Cream border
  ctx.fillStyle = COLORS.cream
  ctx.beginPath()
  ctx.roundRect(x - 3, y - 3, w + 6, h + 6, borderRadius + 2)
  ctx.fill()

  // Clip and draw photo
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, borderRadius)
  ctx.clip()
  coverFitCrop(ctx, img, x, y, w, h)

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
  // === BACKGROUND ===
  ctx.fillStyle = COLORS.greenDeep
  ctx.fillRect(0, 0, W, H)
  drawGrainTexture(ctx, W, H)
  console.timeEnd('composeSoloId-background')

  console.time('composeSoloId-photo')
  // === PHOTO AREA (centered, large) ===
  const photoX = 80
  const photoY = 160
  const photoW = 920
  const photoH = 680
  const photoRadius = 20

  const photoImg = new Image()
  const photoUrl = URL.createObjectURL(resizedPhoto)
  photoImg.src = photoUrl
  await new Promise((resolve) => { photoImg.onload = resolve })

  drawPhotoArea(ctx, photoImg, photoX, photoY, photoW, photoH, photoRadius)
  URL.revokeObjectURL(photoUrl)
  console.timeEnd('composeSoloId-photo')

  console.time('composeSoloId-top')
  // === TOP LEFT: "HH" ===
  ctx.save()
  ctx.font = `bold 130px "Anton", sans-serif`
  ctx.fillStyle = COLORS.yellow
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('HH', 40, 20)
  ctx.restore()

  // === TOP RIGHT: "2026" ===
  ctx.save()
  ctx.font = `bold 120px "Anton", sans-serif`
  ctx.fillStyle = COLORS.pink
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText('2026', W - 40, 20)
  ctx.restore()

  // === "GOA, INDIA" tag ===
  ctx.save()
  ctx.fillStyle = COLORS.yellow
  ctx.fillRect(W - 220, 148, 180, 30)
  ctx.font = `bold 16px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.greenDeep
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('GOA, INDIA', W - 130, 163)
  ctx.restore()

  // === "BUILD THIS. SHIP THIS. CHANGE SOMETHING." ===
  ctx.save()
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('BUILD THIS.', 260, 40)
  ctx.fillText('SHIP THIS.', 260, 58)
  ctx.fillText('CHANGE SOMETHING.', 260, 76)
  ctx.restore()

  // === Crosshair icon ===
  drawCrosshairIcon(ctx, 480, 60, 22, COLORS.cream)

  // === "GOA" below HH ===
  ctx.save()
  ctx.font = `bold 110px "Anton", sans-serif`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('GOA', 40, 145)
  ctx.restore()

  // === "LESS NOISE. MORE SIGNAL." ===
  ctx.save()
  ctx.font = `bold 12px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('LESS NOISE.', 40, 270)
  ctx.fillText('MORE SIGNAL.', 40, 286)
  ctx.restore()

  // === Palm badge ===
  drawPalmBadge(ctx, 80, 380, 55)

  // === Globe icon left ===
  drawGlobeIcon(ctx, 60, 530, 20, COLORS.yellow)

  // === Corner crosses ===
  drawCornerCross(ctx, 50, 580, 8, COLORS.yellow)
  drawCornerCross(ctx, 130, 580, 8, COLORS.cream)

  // === Vertical "BUILDER ID" on right ===
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

  // === "001" large number on right ===
  ctx.save()
  ctx.font = `bold 72px "Anton", sans-serif`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('001', W - 55, 380)
  ctx.restore()

  // === Decorative dots ===
  drawDecorativeDots(ctx, W - 100, 500, 5, 4, COLORS.yellow)

  // === Corner crosses bottom right ===
  drawCornerCross(ctx, W - 50, 580, 8, COLORS.cream)

  console.timeEnd('composeSoloId-top')

  console.time('composeSoloId-bottom')
  // === BOTTOM CREAM SECTION ===
  const bottomY = 880
  const bottomH = H - bottomY

  // Cream background with torn top edge
  ctx.save()
  ctx.fillStyle = COLORS.cream
  ctx.beginPath()
  ctx.moveTo(0, bottomY)
  // Jagged/torn edge
  for (let x = 0; x <= W; x += 12) {
    ctx.lineTo(x, bottomY + (Math.random() * 6 - 3))
  }
  ctx.lineTo(W, H)
  ctx.lineTo(0, H)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // === "BUILDER" label ===
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

  // Hash marks after BUILDER
  drawHashMarks(ctx, 190, labelY + 8, 10, COLORS.pink)

  // === Name ===
  labelY += 44
  ctx.save()
  ctx.font = `bold 64px "Anton", sans-serif`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  let displayName = input.name.toUpperCase()
  ctx.font = `bold 64px "Anton", sans-serif`
  const maxNameW = W - 360
  while (ctx.measureText(displayName).width > maxNameW && displayName.length > 3) {
    displayName = displayName.slice(0, -1)
  }
  if (displayName !== input.name.toUpperCase()) displayName += '…'
  ctx.fillText(displayName, 40, labelY)
  ctx.restore()

  // Underline
  ctx.save()
  ctx.strokeStyle = COLORS.pink
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(40, labelY + 72)
  ctx.lineTo(maxNameW + 40, labelY + 72)
  ctx.stroke()
  ctx.restore()

  // === "STACK" label ===
  labelY += 90
  ctx.save()
  ctx.fillStyle = COLORS.pink
  ctx.fillRect(40, labelY, 110, 28)
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('STACK', 50, labelY + 14)
  ctx.restore()

  drawHashMarks(ctx, 160, labelY + 8, 10, COLORS.pink)

  // === Stack text ===
  labelY += 40
  ctx.save()
  ctx.font = `500 28px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText((input.stack || 'YOUR STACK').toUpperCase(), 40, labelY)
  ctx.restore()

  // Dashed underline
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

  // === "BUILDER CLASS" label ===
  labelY += 54
  ctx.save()
  ctx.fillStyle = COLORS.pink
  ctx.fillRect(40, labelY, 200, 28)
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('BUILDER CLASS', 50, labelY + 14)
  ctx.restore()

  drawHashMarks(ctx, 250, labelY + 8, 10, COLORS.pink)

  // === Builder class text ===
  labelY += 40
  ctx.save()
  ctx.font = `bold 56px "Anton", sans-serif`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const classText = input.builderClass.title.toUpperCase()
  ctx.fillText(classText, 40, labelY)
  ctx.restore()

  // === Builder stamp (right side) ===
  drawBuilderStamp(ctx, W - 140, bottomY + 140, 75)

  // === "MADE FOR BUILDERS." box ===
  ctx.save()
  ctx.strokeStyle = COLORS.ink
  ctx.lineWidth = 1.5
  ctx.strokeRect(W - 240, bottomY + 240, 160, 60)
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('MADE FOR', W - 230, bottomY + 252)
  ctx.fillText('BUILDERS.', W - 230, bottomY + 270)
  // Arrow
  ctx.strokeStyle = COLORS.pink
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W - 80, bottomY + 275)
  ctx.lineTo(W - 65, bottomY + 265)
  ctx.moveTo(W - 65, bottomY + 265)
  ctx.lineTo(W - 65, bottomY + 275)
  ctx.stroke()
  ctx.restore()

  console.timeEnd('composeSoloId-bottom')

  console.time('composeSoloId-footer')
  // === FOOTER BAR ===
  const footerY = H - 50

  // "#FRAMEINGOA" pink tag
  ctx.save()
  ctx.fillStyle = COLORS.pink
  ctx.fillRect(40, footerY, 180, 32)
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('#FRAMEINGOA', 50, footerY + 16)
  ctx.restore()

  // "THE BUILDERS ARE HERE."
  ctx.save()
  ctx.font = `500 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('THE BUILDERS ARE HERE.', W / 2, footerY + 16)
  ctx.restore()

  // "HH GOA 2026" right
  ctx.save()
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText('HH GOA 2026', W - 40, footerY + 16)
  ctx.restore()

  // Small palm silhouette right
  drawPalmSilhouette(ctx, W - 45, footerY - 10, 0.6, COLORS.pink)

  console.timeEnd('composeSoloId-footer')

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
  console.timeEnd('composeSquadId-background')

  console.time('composeSquadId-top')
  // === TOP LEFT: "HH" ===
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

  // "BUILD THIS. SHIP THIS. CHANGE SOMETHING."
  ctx.save()
  ctx.font = `bold 13px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('BUILD THIS.', 230, 35)
  ctx.fillText('SHIP THIS.', 230, 52)
  ctx.fillText('CHANGE SOMETHING.', 230, 69)
  ctx.restore()

  // Crosshair
  drawCrosshairIcon(ctx, 430, 60, 22, COLORS.cream)

  // "THE BUILDERS Are Here." on brush stroke
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

  // "2026" top right
  ctx.save()
  ctx.font = `bold 100px "Anton", sans-serif`
  ctx.fillStyle = COLORS.pink
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText('2026', W - 40, 15)
  ctx.restore()

  // "GOA, INDIA" tag
  ctx.save()
  ctx.fillStyle = COLORS.yellow
  ctx.fillRect(W - 210, 120, 170, 28)
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.greenDeep
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('GOA, INDIA', W - 125, 134)
  ctx.restore()

  // Palm stamp top right
  drawPalmBadge(ctx, W - 100, 220, 50)

  // Sparkles and decorations
  drawSparkle(ctx, 180, 30, 8, COLORS.yellow)
  drawSparkle(ctx, 190, 100, 5, COLORS.cream)
  drawBirds(ctx, 550, 30, COLORS.cream)
  drawDecorativeDots(ctx, W - 130, 290, 4, 3, COLORS.yellow)

  // Palm tree left side
  drawPalmSilhouette(ctx, 50, 350, 1.5, COLORS.cream)
  console.timeEnd('composeSquadId-top')

  console.time('composeSquadId-photos')
  // === PHOTOS: 3 Polaroid-style with torn frames ===
  const numPeople = Math.min(input.people.length, 3)
  const photoW = 300
  const photoH = 280
  const photoGap = 50
  const totalPhotosW = numPeople * photoW + (numPeople - 1) * photoGap
  const photosStartX = (W - totalPhotosW) / 2
  const photosY = 240
  const rotations = [-3, 0, 2.5]
  const tapeColors = [COLORS.yellow, COLORS.yellow, COLORS.pink]

  for (let i = 0; i < numPeople; i++) {
    const person = input.people[i]
    const px = photosStartX + i * (photoW + photoGap)
    const py = photosY + (i === 1 ? 15 : 0)
    const rotation = rotations[i]

    const photoImg = new Image()
    const photoUrl = URL.createObjectURL(resizedPhotos[i])
    photoImg.src = photoUrl
    await new Promise((resolve) => { photoImg.onload = resolve })

    drawTornPhotoFrame(ctx, photoImg, px, py, photoW, photoH, rotation)
    URL.revokeObjectURL(photoUrl)

    // Tape on top-left corner
    drawTape(ctx, px + 30, py - 5, 50, -25, tapeColors[i])

    // Pushpin on top center (for middle photo)
    if (i === 1) {
      drawPushpin(ctx, px + photoW / 2, py - 8)
    }

    // Number circle below photo
    const numCx = px + photoW / 2
    const numCy = py + photoH + 30
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

    // "BUILDER" label
    const labelY = numCy + 26
    ctx.save()
    ctx.fillStyle = COLORS.pink
    ctx.fillRect(numCx - 40, labelY, 80, 20)
    ctx.font = `bold 10px "JetBrains Mono", monospace`
    ctx.fillStyle = COLORS.cream
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('BUILDER', numCx, labelY + 10)
    ctx.restore()

    drawHashMarks(ctx, numCx + 44, labelY + 4, 5, COLORS.pink)

    // Name
    ctx.save()
    ctx.font = `bold 22px "Anton", sans-serif`
    ctx.fillStyle = COLORS.cream
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    let name = person.name.toUpperCase()
    const maxNameW = photoW + 20
    while (ctx.measureText(name).width > maxNameW && name.length > 3) {
      name = name.slice(0, -1)
    }
    if (name !== person.name.toUpperCase()) name += '…'
    ctx.fillText(name, numCx, labelY + 26)
    ctx.restore()

    // "STACK" yellow tag
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

    // Stack text
    ctx.save()
    ctx.font = `500 12px "JetBrains Mono", monospace`
    ctx.fillStyle = COLORS.cream
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText((person.stack || '—').toUpperCase(), numCx, stackTagY + 22)
    ctx.restore()
  }

  // Extra decorative dots right side
  drawDecorativeDots(ctx, W - 80, 400, 4, 4, COLORS.pink)
  drawSparkle(ctx, W - 60, 500, 6, COLORS.yellow)
  console.timeEnd('composeSquadId-photos')

  console.time('composeSquadId-bottom')
  // === BOTTOM SECTION: 3 boxes ===
  const bottomY = 640

  // "TEAM CLASS" brush stroke box (left)
  drawBrushStroke(ctx, 40, bottomY, 340, 90, COLORS.cream)
  ctx.save()
  ctx.font = `bold 12px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.pink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('✦ TEAM CLASS ✦', 70, bottomY + 12)
  ctx.restore()
  ctx.save()
  ctx.font = `bold 36px "Anton", sans-serif`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const classTitle = input.people[0]?.builderClass.title.toUpperCase() || 'BUILDER CLASS'
  ctx.fillText(classTitle.length > 18 ? classTitle.slice(0, 18) : classTitle, 70, bottomY + 35)
  ctx.restore()

  // Sunset circle (center)
  drawSunsetCircle(ctx, W / 2, bottomY + 45, 55)

  // "TEAM TAGLINE" brush stroke box (right)
  drawBrushStroke(ctx, W - 380, bottomY, 340, 90, COLORS.cream)
  ctx.save()
  ctx.font = `bold 12px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.pink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('✦ TEAM TAGLINE ✦', W - 350, bottomY + 12)
  ctx.restore()
  ctx.save()
  ctx.font = `bold 28px "Anton", sans-serif`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('TEAM TAGLINE', W - 350, bottomY + 38)
  ctx.fillText('GOES HERE', W - 350, bottomY + 62)
  ctx.restore()

  // Decorative sparkles
  drawSparkle(ctx, 30, bottomY + 100, 6, COLORS.pink)
  drawSparkle(ctx, W - 30, bottomY + 100, 6, COLORS.yellow)
  drawCornerCross(ctx, 400, bottomY + 95, 6, COLORS.yellow)

  // "#FRAMEINGOA" pink tag bottom right
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

  // Bottom decorative elements
  drawCornerCross(ctx, 60, H - 40, 6, COLORS.yellow)
  drawCornerCross(ctx, 200, H - 40, 6, COLORS.pink)
  drawDecorativeDots(ctx, 300, H - 45, 3, 2, COLORS.yellow)

  console.timeEnd('composeSquadId-bottom')

  console.time('composeSquadId-blob')
  const result = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => { resolve(blob!) }, 'image/png')
  })
  console.timeEnd('composeSquadId-blob')
  console.timeEnd('composeSquadId-total')
  return result
}