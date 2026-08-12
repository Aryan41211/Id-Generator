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
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.src = url
  await new Promise((resolve) => { img.onload = resolve })

  const longEdge = Math.max(img.width, img.height)
  if (longEdge <= MAX_WORKING_DIMENSION) {
    return { blob, img }
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

  const resizedBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
  })

  const resizedUrl = URL.createObjectURL(resizedBlob)
  const resizedImg = new Image()
  resizedImg.src = resizedUrl
  await new Promise((resolve) => { resizedImg.onload = resolve })

  return { blob: resizedBlob, img: resizedImg }
}

async function loadFrameImage(src: string): Promise<HTMLImageElement> {
  const img = new Image()
  img.src = src
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
  })
  return img
}

// Cached frame images — loaded once, reused across generations
let cachedSoloFrame: HTMLImageElement | null = null
let cachedSquadFrame: HTMLImageElement | null = null

export async function preloadFrameAssets(): Promise<void> {
  const [solo, squad] = await Promise.all([
    loadFrameImage('/frame-assets/frame-solo.png'),
    loadFrameImage('/frame-assets/frame-squad.png'),
  ])
  cachedSoloFrame = solo
  cachedSquadFrame = squad
  console.log('[frames] preloaded frame-solo.png and frame-squad.png')
}

function getSoloFrame(): HTMLImageElement {
  if (!cachedSoloFrame) throw new Error('Solo frame not preloaded')
  return cachedSoloFrame
}

function getSquadFrame(): HTMLImageElement {
  if (!cachedSquadFrame) throw new Error('Squad frame not preloaded')
  return cachedSquadFrame
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

export async function composeSoloId(
  input: SoloComposeInput,
  outputSize: { width: number; height: number } = { width: 1080, height: 1350 }
): Promise<Blob> {
  const W = outputSize.width
  const H = outputSize.height

  console.time('composeSoloId-total')

  const { ensureFonts } = await import('@/lib/ensureFonts')
  await ensureFonts()

  const { img: photoImg } = await loadAndResize(input.photo)

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 1. Background
  ctx.fillStyle = COLORS.greenDeep
  ctx.fillRect(0, 0, W, H)
  drawGrainTexture(ctx, W, H)

  // 2. Photo
  const photoX = 80
  const photoY = 160
  const photoW = 920
  const photoH = 680
  const photoRadius = 20
  drawPhotoArea(ctx, photoImg, photoX, photoY, photoW, photoH, photoRadius)

  // 3. Frame overlay (branding)
  const frame = getSoloFrame()
  ctx.drawImage(frame, 0, 0, W, H)

  // 4. Name
  let labelY = 920 + 40
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

  // Underline
  ctx.save()
  ctx.strokeStyle = COLORS.pink
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(40, labelY + 72)
  ctx.lineTo(maxNameW + 40, labelY + 72)
  ctx.stroke()
  ctx.restore()

  // 5. Stack
  labelY += 90
  ctx.save()
  ctx.font = `500 28px "JetBrains Mono", monospace`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText((input.stack || 'YOUR STACK').toUpperCase(), 40, labelY)
  ctx.restore()

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

  const { ensureFonts } = await import('@/lib/ensureFonts')
  await ensureFonts()

  const loadedImages = await Promise.all(input.people.map(p => loadAndResize(p.photo)))

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 1. Background
  ctx.fillStyle = COLORS.greenDeep
  ctx.fillRect(0, 0, W, H)
  drawGrainTexture(ctx, W, H)

  // 2. Photos (frames + tape + pushpins only)
  const numPeople = Math.min(input.people.length, 3)
  const photoW = 300
  const photoH = 280
  const photoGap = 50
  const totalPhotosW = numPeople * photoW + (numPeople - 1) * photoGap
  const photosStartX = (W - totalPhotosW) / 2
  const photosY = 240
  const rotations = [-3, 0, 2.5]
  const tapeColors = [COLORS.yellow, COLORS.yellow, COLORS.pink]

  const photoPositions: Array<{ cx: number; cy: number; numCy: number }> = []

  for (let i = 0; i < numPeople; i++) {
    const px = photosStartX + i * (photoW + photoGap)
    const py = photosY + (i === 1 ? 15 : 0)
    const rotation = rotations[i]

    drawTornPhotoFrame(ctx, loadedImages[i].img, px, py, photoW, photoH, rotation)
    drawTape(ctx, px + 30, py - 5, 50, -25, tapeColors[i])

    if (i === 1) {
      drawPushpin(ctx, px + photoW / 2, py - 8)
    }

    const numCx = px + photoW / 2
    const numCy = py + photoH + 30
    photoPositions.push({ cx: numCx, cy: numCy + 26, numCy })

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

  // 3. Frame overlay (branding)
  const frame = getSquadFrame()
  ctx.drawImage(frame, 0, 0, W, H)

  // 4. Names + stacks (on top of frame)
  for (let i = 0; i < numPeople; i++) {
    const { cx: numCx, cy: labelY } = photoPositions[i]

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

  console.time('composeSquadId-blob')
  const result = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => { resolve(blob!) }, 'image/png')
  })
  console.timeEnd('composeSquadId-blob')
  console.timeEnd('composeSquadId-total')
  return result
}
