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

  // Trunk
  ctx.fillRect(-2, 0, 4, 40)

  // Fronds (simple triangular shapes)
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
  // === TOP: "HH" + "GOA" ===
  ctx.save()
  ctx.font = `bold 100px "Anton", sans-serif`
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
  ctx.fillText('GOA', 40, 115)
  ctx.restore()

  ctx.save()
  ctx.font = `bold 90px "Anton", sans-serif`
  ctx.fillStyle = COLORS.pink
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText('2026', W - 40, 20)
  ctx.restore()

  // "GOA, INDIA" tag
  ctx.save()
  ctx.fillStyle = COLORS.yellow
  ctx.fillRect(W - 200, 115, 160, 28)
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.greenDeep
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('GOA, INDIA', W - 120, 129)
  ctx.restore()

  // "BUILDER ID" vertical
  ctx.save()
  ctx.font = `bold 13px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.yellow
  ctx.textAlign = 'center'
  for (let i = 0; i < 'SQUAD'.length; i++) {
    ctx.fillText('SQUAD'[i], W - 45, 170 + i * 16)
  }
  ctx.restore()

  // Crosshair
  drawCrosshairIcon(ctx, 350, 60, 20, COLORS.cream)
  console.timeEnd('composeSquadId-top')

  console.time('composeSquadId-photos')
  // === PHOTO AREA: 4 photos in a row ===
  const numPeople = input.people.length
  const photoW = 240
  const photoH = 320
  const photoGap = 30
  const totalPhotosW = numPeople * photoW + (numPeople - 1) * photoGap
  const photosStartX = (W - totalPhotosW) / 2
  const photosY = 170
  const photoRadius = 14

  for (let i = 0; i < numPeople; i++) {
    const person = input.people[i]
    const px = photosStartX + i * (photoW + photoGap)

    const photoImg = new Image()
    const photoUrl = URL.createObjectURL(resizedPhotos[i])
    photoImg.src = photoUrl
    await new Promise((resolve) => { photoImg.onload = resolve })

    drawPhotoArea(ctx, photoImg, px, photosY, photoW, photoH, photoRadius)
    URL.revokeObjectURL(photoUrl)

    // Small stamp below each
    drawBuilderStamp(ctx, px + photoW / 2, photosY + photoH + 40, 30)

    // Builder class label below
    ctx.save()
    ctx.font = `bold 11px "JetBrains Mono", monospace`
    ctx.fillStyle = COLORS.ink
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(person.builderClass.title.toUpperCase(), px + photoW / 2, photosY + photoH + 80)
    ctx.restore()
  }

  // Decorative dots
  drawDecorativeDots(ctx, 50, photosY + photoH + 120, 5, 3, COLORS.yellow)
  drawDecorativeDots(ctx, W - 90, photosY + photoH + 120, 5, 3, COLORS.yellow)
  console.timeEnd('composeSquadId-photos')

  console.time('composeSquadId-bottom')
  // === BOTTOM CREAM SECTION ===
  const bottomY = 620

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

  // Names in a row
  const namesY = bottomY + 30
  const nameSpacing = W / numPeople
  for (let i = 0; i < numPeople; i++) {
    const person = input.people[i]
    const nx = nameSpacing * i + nameSpacing / 2

    // "BUILDER" label
    ctx.save()
    ctx.fillStyle = COLORS.pink
    ctx.fillRect(nx - 50, namesY, 100, 22)
    ctx.font = `bold 11px "JetBrains Mono", monospace`
    ctx.fillStyle = COLORS.cream
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('BUILDER', nx, namesY + 11)
    ctx.restore()

    drawHashMarks(ctx, nx + 55, namesY + 5, 6, COLORS.pink)

    // Name
    ctx.save()
    ctx.font = `bold 36px "Anton", sans-serif`
    ctx.fillStyle = COLORS.ink
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    let name = person.name.toUpperCase()
    const maxW = nameSpacing - 40
    while (ctx.measureText(name).width > maxW && name.length > 3) {
      name = name.slice(0, -1)
    }
    if (name !== person.name.toUpperCase()) name += '…'
    ctx.fillText(name, nx, namesY + 30)
    ctx.restore()

    // Stack
    ctx.save()
    ctx.font = `500 14px "JetBrains Mono", monospace`
    ctx.fillStyle = COLORS.ink
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText((person.stack || '—').toUpperCase(), nx, namesY + 72)
    ctx.restore()
  }

  // "THE BUILDERS ARE HERE."
  ctx.save()
  ctx.font = `500 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('THE BUILDERS ARE HERE.', W / 2, bottomY + 140)
  ctx.restore()

  // "#FRAMEINGOA" tag
  ctx.save()
  ctx.fillStyle = COLORS.pink
  ctx.fillRect(40, H - 50, 180, 32)
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('#FRAMEINGOA', 50, H - 34)
  ctx.restore()

  // "HH GOA 2026"
  ctx.save()
  ctx.font = `bold 14px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText('HH GOA 2026', W - 40, H - 34)
  ctx.restore()

  drawPalmSilhouette(ctx, W - 45, H - 60, 0.5, COLORS.pink)
  console.timeEnd('composeSquadId-bottom')

  console.time('composeSquadId-blob')
  const result = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => { resolve(blob!) }, 'image/png')
  })
  console.timeEnd('composeSquadId-blob')
  console.timeEnd('composeSquadId-total')
  return result
}