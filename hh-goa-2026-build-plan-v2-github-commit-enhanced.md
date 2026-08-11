# HH Goa 2026 — Frame/ID Generator: Build Plan v2 (Judge-Optimized)

## 0. What changed from v1, and why

I read the actual live task copy on **hhgoa.com** (Task #1, "HH Goa Frame / ID Card
Generator"), not just the screenshots. Three things in the real brief materially
change what you should build — none of them were in the first plan:

1. **"Use that same generator to bring your teammates into one combined frame."**
   This is not optional flavor text — it's a named requirement. The tool needs a
   **squad mode**: 2–4 photos composited into one frame/card, not just solo PFPs.
   Almost no team at a national-level hackathon will bother building this because
   it's more work. Building it well is your single biggest differentiator.
2. **"Personalized: name, stack, a generated builder class."** This confirms the
   task wants the ID-card personalization (Format B) as core, not a stretch goal —
   "builder class" specifically implies a fun, game-like generated title (like a
   trading-card rarity/class system), not just a plain text field.
3. **"Post it on X with a quick how-to on generating your own #FrameInGoa post
   using your generator."** Your X post itself is graded partly on whether it
   explains how to use the tool. Bake a ready-made "here's how" caption into the
   share flow so you're not scrambling to write it by hand later.

So: **build one flagship tool** — a personalized Builder ID/Frame with solo and
squad modes — rather than two disconnected formats. This plan also fixes the
"boring output" problem: v1 only specified an upload dropzone. A judge sees that
and a hundred others like it in five seconds. This version adds a real landing
experience in hhgoa.com's own visual language before the tool even starts.

---

## 1. Design direction — borrowed from hhgoa.com itself, not just its palette

Pulled directly from the live site, to reuse as *structure and voice*, not just colors:

- **A ticker/status bar at the very top**, exactly like the real site's
  `GOA, INDIA · 28 – 31 OCT 2026 · 2:47 pm Studio` strip — reuse this pattern for
  your own tool's micro-brand bar (e.g. `HH GOA 2026 · BUILDER ID GENERATOR ·
  #FrameInGoa`), marquee-scrolling on mobile.
- **Tone of voice**: short, confident, a little cocky — *"Less Noise. More
  Signal."*, *"heads down. ship or ship"*, *"the world watches"*. Your subheads
  should sound like this, not like generic SaaS copy ("Create your custom frame
  in seconds!").
- **Task-card visual language**: the real site's own task card for this exact
  challenge uses a cream card, a palm emoji tag ("🌴 Builder ID"), a bulleted
  checklist of features with ✦ bullets, and a solid pill CTA ("Confirm
  Participation"). Mirror this card style for your tool's own feature-highlight
  strip so it visually rhymes with the site it's for.
- **Illustration motifs**: flat retro sun, palm trees, footer tree silhouette,
  thick-outline shapes, a "waveform/vector" squiggle used as section dividers.
  Reuse these as lightweight inline SVGs — not stock icons.
- **Section rhythm**: hero → stat strip → "how it works" (their site uses a
  4-day agenda strip: genesis / triangle / build / launch — mirror this rhythm
  with your own 3–4 step strip: upload → personalize → generate → share) →
  the tool itself → footer with the same tree/social layout.
- **Grain / texture**: the real site is not flat-vector-clean — it has a subtle
  film-grain/noise texture over the deep green. Add a low-opacity noise overlay
  (CSS `background-image` with an SVG turbulence filter, ~4% opacity) so your
  greens don't look like a flat Tailwind default.

Brand tokens (keep these — they're accurate):

```css
:root {
  --hh-green-deep: #0b3d24;
  --hh-green-mid:  #14532d;
  --hh-pink:       #ec1263;
  --hh-yellow:     #f6d33c;
  --hh-cream:      #f6efd8;
  --hh-cream-line: #d8cfa8;
  --hh-ink:        #123524;
}
```

Fonts: **Anton** or **Archivo Black** for display headlines, **Space Grotesk**
for body, **JetBrains Mono** for uppercase tags/timestamps/the ticker bar —
these three fonts alone, styled correctly, are most of what makes it look
on-brand instead of generic.

---

## 2. What to actually build — priority order

1. **Landing experience** (ticker bar, hero, "how it works" strip, feature-tag
   card mirroring the real task card, footer) — this is what makes it feel
   premium instead of a bare form. Build this properly; it's cheap in effort,
   expensive in perceived quality.
2. **Solo mode: upload → personalize (name, stack/role) → generated builder
   class → composited ID card/frame → download/share.** This is your
   must-ship-perfectly core, and it directly satisfies "personalized: name,
   stack, a generated builder class" from the real brief.
3. **Squad mode: 2–4 photos → one combined frame/card.** This is the
   differentiator called out by name in the actual task. Reuse ~90% of the solo
   pipeline — same canvas engine, same crop math, just a multi-slot layout and
   a loop over N uploads instead of 1.
4. **Share flow with a working OG preview + built-in "how-to" caption.** Must
   satisfy: image attaches directly (mobile) OR the link preview shows the real
   graphic (desktop), and the caption text itself briefly explains how to make
   your own — satisfying the "quick how-to" requirement without you having to
   hand-write a tweet later.
5. **Builder-class reveal moment** — a short, satisfying animation (card
   flip/stamp/confetti) when the generated title appears. This is pure delight
   and costs half a day, but it's the kind of detail a judge remembers.
6. Polish pass (mobile, perf, error states) last, same as before.

### On the share flow (unchanged reasoning, still your trickiest requirement)

- **Mobile (majority of users):** `navigator.share()` Web Share API with the
  actual image `File` attached — opens the OS share sheet, user picks X, image
  posts as a real attachment.
- **Desktop fallback:** generate image client-side → POST once to a small
  serverless endpoint (Vercel Blob) → get an id → open a Twitter/X intent link
  pointing at `yoursite.com/s/<id>`, a page whose `og:image` is dynamically set
  to the stored image so Twitter's crawler shows the real graphic.

---

## 3. Tech stack

- **Next.js 14 (App Router) + TypeScript** — Vercel deploy, API routes free.
- **Tailwind CSS**, with the brand tokens above wired in as theme colors.
- **Canvas API (native)** for compositing — solo and squad layouts.
- **heic2any** for iPhone HEIC → JPEG conversion client-side.
- **Vercel Blob** for the desktop share-link fallback.
- **Framer Motion** (small, worth it) for the hero entrance, the ticker
  marquee, and the builder-class reveal animation — this is where "charming"
  actually comes from; don't skip it to save bundle size, it's small.
- **Vercel** for hosting.

---

## 4. File structure to have opencode create

```
hh-goa-id/
  app/
    page.tsx                    # landing + tool, single scrolling page
    layout.tsx
    globals.css
    s/[id]/page.tsx              # dynamic OG-preview page (desktop share fallback)
    api/
      share/route.ts             # POST: stores generated PNG, returns id
  components/
    landing/
      TickerBar.tsx              # top marquee strip
      Hero.tsx
      HowItWorksStrip.tsx        # 3-4 step agenda-style strip
      FeatureTagCard.tsx         # mirrors the real site's task card style
      SiteFooter.tsx
    tool/
      ModeToggle.tsx             # Solo / Squad switch
      UploadSlot.tsx             # single reusable upload tile (used 1x or up to 4x)
      PersonalizeForm.tsx        # name, stack/role
      BuilderClassReveal.tsx     # generated title + reveal animation
      IdCanvas.tsx                # core compositing (solo + squad layouts)
      DownloadButton.tsx
      ShareToXButton.tsx
  lib/
    heic.ts
    canvasCompose.ts             # cover-fit crop math, solo layout, squad layout
    builderClass.ts              # deterministic builder-class/title generator
    shareCaption.ts              # builds the caption incl. mini how-to + hashtag
  public/
    frame-assets/
      frame-solo.png
      frame-squad.png
      noise-overlay.svg
  README.md
```

---

## 5. Testing checklist before you submit

- [ ] Upload JPG, PNG, and a real iPhone HEIC photo — all work, solo and squad
- [ ] Squad mode: 2, 3, and 4 photos all lay out correctly with no overlap/clipping
- [ ] Portrait, landscape, square, and off-center-crop photos all crop correctly
- [ ] Builder-class generator produces varied, on-brand, funny-but-not-dumb titles
- [ ] Result appears in well under 3 seconds on a mid-range phone
- [ ] Download produces an actual openable PNG file
- [ ] On a real phone: Share to X opens the OS share sheet with the image attached
- [ ] On desktop: Share to X opens a pre-filled tweet intent; pasting the link
      into a card-preview validator shows the real generated image
- [ ] Tweet caption includes `#FrameInGoa` exactly, and a one-line how-to
- [ ] No login/signup wall anywhere in the flow
- [ ] Works end-to-end at 375px width
- [ ] Ticker bar, hero, and "how it works" strip all render correctly on mobile
- [ ] Site is deployed to a live URL, not localhost

---

## 6. Prompts for opencode

Paste one at a time, in order. Wait for each to finish and verify before moving
to the next.

### Prompt 1 — Project scaffold + design system + brand shell

```
Create a new Next.js 14 project using the App Router and TypeScript, with
Tailwind CSS configured. Project name: hh-goa-id.

This is for "HH Goa 2026" — a national hackathon in Goa, India, with a confident,
slightly cocky, retro-tropical brand voice (think: "Less Noise. More Signal.",
"heads down. ship or ship."). Not a generic SaaS tone.

Set up in globals.css, as CSS variables:
--hh-green-deep: #0b3d24 (main background)
--hh-green-mid: #14532d (panel backgrounds on green sections)
--hh-pink: #ec1263 (primary accent, CTA buttons)
--hh-yellow: #f6d33c (secondary accent, highlights)
--hh-cream: #f6efd8 (light card backgrounds)
--hh-cream-line: #d8cfa8 (borders on cream cards)
--hh-ink: #123524 (dark text on cream/yellow backgrounds)

Load Google Fonts: "Anton" for big display headlines, "Space Grotesk" for body
text, "JetBrains Mono" for small uppercase tags/timestamps. Wire up as Tailwind
font families: font-display, font-body, font-mono-label.

Add a subtle film-grain texture over --hh-green-deep backgrounds: create
public/frame-assets/noise-overlay.svg using an SVG feTurbulence filter, and
apply it as a fixed, full-bleed background-image at ~4% opacity over green
sections via a CSS utility class `.grain-overlay`. This should be barely
noticeable but keep the background from looking like a flat solid color.

Install framer-motion — we'll use it for a marquee ticker, hero entrance, and a
reveal animation later.

Just scaffold the project, fonts, color tokens, and the grain utility. Confirm
`npm run dev` runs cleanly. Don't build any page content yet — that's next.


GIT REQUIREMENT: Work incrementally and make the maximum practical number of meaningful Git commits for this prompt. Do not batch unrelated changes into one commit. Commit and push after each independently working component, feature, fix, styling pass, asset/config change, or other meaningful unit. Do not create empty/fake commits and do not squash the history later. At the end of this prompt, show the commits created and confirm that all completed commits were pushed to the connected GitHub repository.
```

### Prompt 2 — Landing page: ticker, hero, how-it-works, feature card, footer

```
In the hh-goa-id project, build the full landing experience in app/page.tsx
using these components (create each in components/landing/):

1. TickerBar.tsx — a thin sticky bar at the very top of the page, --hh-green-mid
   background, --hh-cream font-mono-label text, uppercase, small letter-spacing.
   Content marquee-scrolls (use framer-motion, slow constant horizontal loop,
   pause on hover/tap): "HH GOA 2026 · BUILDER ID GENERATOR · GOA, INDIA ·
   #FrameInGoa · " repeated so it loops seamlessly. This mirrors the real event
   site's top status bar.

2. Hero.tsx — full-bleed --hh-green-deep background with the grain-overlay
   utility applied. Centered content:
   - Eyebrow tag in font-mono-label, --hh-yellow: "TASK #1 · 🌴 BUILDER ID"
   - Huge headline, font-display, all caps, --hh-cream: "BUILD YOUR HH GOA ID"
   - Subheadline, font-body, muted cream/60% opacity, one confident sentence,
     e.g. "One photo. Your crew if you've got one. A generated builder class.
     Out in seconds."
   - A small decorative row of 2-3 simple inline SVG motifs (flat sun circle,
     palm tree silhouette) in --hh-yellow/--hh-pink, positioned asymmetrically,
     not centered clip-art
   - A single CTA button, solid --hh-pink pill, --hh-cream bold text, "START
     BUILDING ↓", that smooth-scrolls down to the tool section
   - Animate the hero content in with framer-motion on mount: staged fade+slide
     for eyebrow, headline, subhead, CTA (each ~80ms after the previous)

3. HowItWorksStrip.tsx — a horizontal strip (stacks vertically on mobile) of 4
   short steps styled like an agenda/timeline, matching the real site's day-by-
   day rhythm: "01 UPLOAD — drop your photo, or your whole crew's", "02
   PERSONALIZE — name, stack, and we'll assign your class", "03 GENERATE —
   composited instantly, no loading screen", "04 SHARE — download or post
   straight to X". Each step: big font-mono-label number in --hh-yellow, short
   font-display title in --hh-cream, one-line font-body description in muted
   cream. Background --hh-green-mid.

4. FeatureTagCard.tsx — a cream card (--hh-cream bg, --hh-cream-line border,
   rounded corners, soft shadow) styled like the real site's task card. Include
   a small "🌴 Builder ID" tag pill at the top, then a bulleted feature list
   using "✦" bullets (not default browser bullets) in --hh-ink text:
   "✦ Instantly recognizable HH Goa 2026 identity", "✦ 1-click download +
   1-click Share to X", "✦ Works on any photo — no manual cropping",
   "✦ Personalized: name, stack, a generated builder class", "✦ Bring your
   whole crew into one combined frame", "✦ Seconds from upload to shareable
   output". Place this card just above the tool section as a quick pitch.

5. SiteFooter.tsx — --hh-green-deep background, grain overlay, centered small
   text: "GOA, INDIA · 28-31 OCT 2026", and "#FrameInGoa" in --hh-pink
   font-mono-label. Keep it minimal — this is a footer, not the real event's
   full footer.

Assemble these in app/page.tsx in order: TickerBar, Hero, HowItWorksStrip,
FeatureTagCard, then a placeholder <section id="tool"> (labeled, empty div) for
the actual generator — we build that in later prompts — then SiteFooter.

Mobile-first throughout: must look intentional and uncluttered at 375px width,
not just "fits without breaking." Confirm npm run dev runs and the page scrolls
correctly with the ticker bar staying visible/sticky at top.


GIT REQUIREMENT: Work incrementally and make the maximum practical number of meaningful Git commits for this prompt. Do not batch unrelated changes into one commit. Commit and push after each independently working component, feature, fix, styling pass, asset/config change, or other meaningful unit. Do not create empty/fake commits and do not squash the history later. At the end of this prompt, show the commits created and confirm that all completed commits were pushed to the connected GitHub repository.
```

### Prompt 3 — Mode toggle + upload flow (solo + squad, HEIC support)

```
In the hh-goa-id project, build the upload layer of the tool inside the
#tool section of app/page.tsx.

Create components/tool/ModeToggle.tsx: a two-option pill switch, "SOLO" and
"SQUAD", --hh-cream background, active option filled --hh-pink with --hh-cream
text, inactive option --hh-ink text on transparent. Squad mode allows 2-4
photos (one combined frame for a team); solo mode allows exactly 1.

Create components/tool/UploadSlot.tsx: a single reusable upload tile —
- Accepts JPG, PNG, HEIC/HEIF (check both file.type and file extension, since
  Safari sometimes reports empty MIME type for HEIC)
- Works via click-to-browse, drag-and-drop, and a plain tap-to-upload button on
  mobile (no drag required there)
- Uses the `heic2any` package to convert HEIC/HEIF files to JPEG client-side
  before anything else touches them
- Shows a lightweight, non-blocking loading state only during HEIC conversion
  (should feel instant for JPG/PNG — no spinner for those)
- Once ready, calls an onImageReady(imageBlob: Blob) callback
- Handles errors inline (wrong file type, corrupted file, over 15MB) with a
  small --hh-pink text message inside the cream card — no browser alert()
- Visual style: dashed --hh-ink border on --hh-cream background, upload icon,
  "Drop your photo or tap to upload" text, and once an image is chosen, shows a
  small thumbnail preview with a remove (x) button

In the #tool section, wire this up:
- Solo mode: render exactly one UploadSlot
- Squad mode: render 1 UploadSlot to start, plus an "+ Add teammate" button
  (--hh-pink outline style) that adds another UploadSlot, up to a max of 4.
  Each additional slot also gets a remove button. Show a small counter
  "2/4 crew members added".

Hold all resulting image Blobs in state in app/page.tsx (an array, length 1 for
solo). Just console.log the array for now — compositing comes in the next
prompt. Confirm mode switching correctly resets/adjusts the upload slots.


GIT REQUIREMENT: Work incrementally and make the maximum practical number of meaningful Git commits for this prompt. Do not batch unrelated changes into one commit. Commit and push after each independently working component, feature, fix, styling pass, asset/config change, or other meaningful unit. Do not create empty/fake commits and do not squash the history later. At the end of this prompt, show the commits created and confirm that all completed commits were pushed to the connected GitHub repository.
```

### Prompt 4 — Personalize form + builder class generator

```
In the hh-goa-id project, build the personalization step.

Create lib/builderClass.ts exporting a function
generateBuilderClass(seed: string): { title: string; tier: string }
that deterministically (same seed always gives same result, using a simple
string hash) picks:
- a "tier" from: "Common", "Rare", "Elite", "Legendary" (weighted so Common is
  most frequent, Legendary rare)
- a "title" built by combining a prefix and suffix word list to form fun,
  on-brand builder-class names, e.g. prefixes: ["Terminal", "Midnight", "Beach",
  "Fullstack", "Sunset", "Rogue", "Zero-Latency", "Feral"], suffixes:
  ["Architect", "Shaman", "Castaway", "Operator", "Wizard", "Renegade",
  "Engineer", "Alchemist"] — combine to get things like "Terminal Shaman" or
  "Sunset Renegade". Write at least 8 words in each list so combinations feel
  varied, not repetitive across a demo session.
Use the person's name + stack/role text as the seed input so the same person
typing the same details always gets the same class (feels intentional, not
random-and-arbitrary).

Create components/tool/PersonalizeForm.tsx (solo mode) or adapt it to loop per
person in squad mode:
- Text input: "Your name" (required, max 24 chars)
- Text input: "Your stack / role" (optional, max 28 chars, placeholder like
  "Rust · Solidity" or "Product / Design")
- Live preview text below the inputs showing the generated class as they type
  (debounced), styled as a small pill: --hh-yellow background for
  Common/Rare tier, --hh-pink background for Elite/Legendary, --hh-ink text,
  font-mono-label uppercase
- Cream card styling consistent with the rest of the tool section
- In squad mode, stack one of these forms per teammate, each clearly labeled
  "Crew member 1", "Crew member 2", etc., collapsed/expanded per uploaded slot

Wire into app/page.tsx: hold name/stack/generated class per person in state,
paired with their uploaded image from the previous step.


GIT REQUIREMENT: Work incrementally and make the maximum practical number of meaningful Git commits for this prompt. Do not batch unrelated changes into one commit. Commit and push after each independently working component, feature, fix, styling pass, asset/config change, or other meaningful unit. Do not create empty/fake commits and do not squash the history later. At the end of this prompt, show the commits created and confirm that all completed commits were pushed to the connected GitHub repository.
```

### Prompt 5 — Canvas compositing engine (solo + squad layouts) + reveal animation

```
In the hh-goa-id project, build the core image generation.

First, create two frame/card background assets (design as SVG, export/rasterize
to PNG):
1. public/frame-assets/frame-solo.png (1080x1350px, portrait ID-card
   proportions) — an HH Goa 2026 branded card background with:
   - --hh-green-deep card background with the grain texture baked in
   - A rounded photo cutout area sized for one portrait photo, positioned in
     the upper 60% of the card
   - Below the photo area: reserved space for the person's name (large,
     font-display, --hh-cream), their stack/role (font-mono-label, --hh-yellow),
     and their builder-class pill (rounded pill, tier-colored per Prompt 4)
   - Small decorative motifs in corners: palm tree silhouette, sun circle, in
     --hh-yellow/--hh-pink, echoing the hero design
   - "HH GOA 2026" wordmark near the bottom edge, font-display, --hh-cream,
     legible even at small thumbnail size
   - Must read as unmistakably "HH Goa 2026" branded at a glance

2. public/frame-assets/frame-squad.png (1350x1080px, landscape) — same visual
   language, but with 2-4 smaller circular/rounded photo cutout slots arranged
   in a row or grid (design it to gracefully support 2, 3, or 4 photos — build
   4 slot positions, and when fewer photos are used, redistribute the used
   slots to be evenly centered rather than leaving empty gaps), plus a shared
   "HH GOA 2026 · SQUAD" wordmark, and a small builder-class pill per person
   under their photo.

Then build lib/canvasCompose.ts:
- A cover-fit crop helper: given a source image and a target box (x, y, w, h),
  scale to fully fill the box with no letterboxing, cropping the longer
  dimension, centered — write this yourself, don't rely on CSS object-fit.
- composeSoloId({ photo, name, stack, builderClass }, outputSize): Promise<Blob>
  — draws the photo into the solo frame's cutout, overlays frame-solo.png, then
  draws the name/stack/class text using canvas text APIs with the correct
  fonts/colors/positions matching the asset's reserved text areas, exports PNG.
- composeSquadId({ people: [{photo, name, stack, builderClass}, ...] },
  outputSize): Promise<Blob> — same idea, looping over 2-4 people into the
  squad frame's slots, redistributing slot positions evenly when fewer than 4.

Then build components/tool/IdCanvas.tsx:
- Runs the correct compose function as soon as all required data (photo(s) +
  at least a name) is ready — no user action needed, should feel instant
  (target under 1 second on a mid-range phone)
- Shows a shimmer/skeleton placeholder only if generation takes over 400ms,
  otherwise just pop the result in
- Renders the composed image in a preview card, centered, --hh-pink dashed
  border
- Keeps the resulting Blob in state so Download/Share (built next) can use it

Then build components/tool/BuilderClassReveal.tsx: once the composed image is
ready, run a short (under 1s) framer-motion reveal — the builder-class pill
should do a quick scale-up + slight rotate "stamp" animation with a subtle
--hh-yellow glow pulse, like a card being revealed. Keep it snappy, not gimmicky
— this plays once per generation, not on every re-render.

Wire into app/page.tsx: upload + personalize → instant composited preview with
the reveal animation, no intermediate full-page loading screen.


GIT REQUIREMENT: Work incrementally and make the maximum practical number of meaningful Git commits for this prompt. Do not batch unrelated changes into one commit. Commit and push after each independently working component, feature, fix, styling pass, asset/config change, or other meaningful unit. Do not create empty/fake commits and do not squash the history later. At the end of this prompt, show the commits created and confirm that all completed commits were pushed to the connected GitHub repository.
```

### Prompt 6 — Download button

```
In the hh-goa-id project, build components/tool/DownloadButton.tsx.

Takes the composed image Blob as a prop. On click, triggers a real file
download named "hh-goa-2026-id.png" (or "hh-goa-2026-squad-id.png" in squad
mode) using a temporary object URL + invisible <a download> link — no
third-party library.

Style: solid --hh-pink pill button, --hh-cream bold text, matching the
"Confirm Participation" CTA style from the real site's task card. Place it
directly below the composed preview, full-width on mobile, alongside the Share
button from the next prompt.

Confirm clicking it produces a real, openable PNG file on disk.


GIT REQUIREMENT: Work incrementally and make the maximum practical number of meaningful Git commits for this prompt. Do not batch unrelated changes into one commit. Commit and push after each independently working component, feature, fix, styling pass, asset/config change, or other meaningful unit. Do not create empty/fake commits and do not squash the history later. At the end of this prompt, show the commits created and confirm that all completed commits were pushed to the connected GitHub repository.
```

### Prompt 7 — Share to X (mobile-native + desktop OG fallback + built-in how-to)

```
In the hh-goa-id project, implement the full Share to X flow.

Create lib/shareCaption.ts exporting buildShareCaption({ mode: 'solo'|'squad',
builderClass }: ...) => string. The caption must always include the exact
hashtag #FrameInGoa, and per the task's requirement that the X post include a
quick how-to, keep a short usage line baked in, e.g. for solo mode:
"Just generated my HH Goa 2026 Builder ID — I'm a [builderClass.title] 🌴
Make yours in seconds → [link] #FrameInGoa"
and for squad mode:
"Pulled my whole crew into one HH Goa 2026 squad ID 🌴 Upload your photos, get
a class, share yours → [link] #FrameInGoa"
Where [link] is the site's own URL (window.location.origin), so anyone reading
the tweet immediately knows it's a tool they can use themselves — this
satisfies "quick how-to" without extra copy you'd have to write by hand.

PATH 1 — Mobile / Web Share API with file attachment (primary):
- Check navigator.canShare({ files: [...] })
- If supported: convert the Blob into a File (correct filename per mode,
  image/png), call navigator.share({ files: [file], text: caption })
- Opens the native OS share sheet; user picks X, image posts as a real
  attachment

PATH 2 — Desktop fallback (server-backed OG image + Twitter intent):
- Create app/api/share/route.ts: POST endpoint accepting the image as base64 or
  multipart form data, stores it via @vercel/blob's put() with public access
  and a short random id, returns { id, url } JSON
- Create app/s/[id]/page.tsx: dynamic page that looks up the stored image URL
  and uses generateMetadata() to set og:image and twitter:image to the full
  image URL, og:title to "HH Goa 2026 Builder ID", and renders the image
  centered in the page with a "Built with the HH Goa 2026 ID Generator — make
  yours" line and a link back to the homepage. This is the page Twitter/X's
  crawler will fetch for the link preview.
- In ShareToXButton.tsx: if Web Share API with files isn't supported, POST to
  /api/share, get the id, then open
  https://twitter.com/intent/tweet?text=<url-encoded caption>&url=<url-encoded
  https://<window.location.origin>/s/<id>> in a new tab

Build components/tool/ShareToXButton.tsx implementing this branching logic,
styled as an outline --hh-pink border/text button on transparent background,
placed next to Download.

Handle failure states gracefully: user cancelling the native share sheet is
not an error (show nothing); a real network failure on the fallback path shows
a small inline error message, not a crash.


GIT REQUIREMENT: Work incrementally and make the maximum practical number of meaningful Git commits for this prompt. Do not batch unrelated changes into one commit. Commit and push after each independently working component, feature, fix, styling pass, asset/config change, or other meaningful unit. Do not create empty/fake commits and do not squash the history later. At the end of this prompt, show the commits created and confirm that all completed commits were pushed to the connected GitHub repository.
```

### Prompt 8 — Mobile polish, performance, and meta/favicon pass

```
Do a full responsiveness, performance, and polish pass on the hh-goa-id
project.

- Test and fix layout at 375px, 414px, 768px, and 1280px+ viewport widths,
  including the ticker bar, hero, how-it-works strip, and the tool section in
  both solo and squad modes
- Ensure all tap targets (mode toggle, upload slots, add-teammate button,
  download, share) are at least 44x44px on mobile
- Confirm the marquee ticker doesn't jank or drop frames on a mid-range phone;
  reduce its animation complexity if needed
- Add a favicon and page metadata matching the brand: title "HH Goa 2026 —
  Builder ID Generator", meta description similar in tone to the event's own
  ("Build your HH Goa 2026 Builder ID. Solo or squad. Seconds from upload to
  shareable."), and a default og:image (a static branded card, distinct from
  the per-user dynamic ones) for when the homepage itself is shared
- Double-check there is no login wall, signup gate, or blocking modal anywhere
  before the user sees their result — upload to result must be one
  uninterrupted pass
- Compress frame-solo.png and frame-squad.png (aim under 300KB each) and run a
  Lighthouse mobile performance check; fix anything scoring below 80 on
  Performance

Don't change any core compositing/share/generation logic — this pass is purely
layout, performance, and polish.


GIT REQUIREMENT: Work incrementally and make the maximum practical number of meaningful Git commits for this prompt. Do not batch unrelated changes into one commit. Commit and push after each independently working component, feature, fix, styling pass, asset/config change, or other meaningful unit. Do not create empty/fake commits and do not squash the history later. At the end of this prompt, show the commits created and confirm that all completed commits were pushed to the connected GitHub repository.
```

### Prompt 9 — Deploy

```
Deploy the hh-goa-id project to Vercel. Set up the BLOB_READ_WRITE_TOKEN
environment variable for @vercel/blob via the Vercel dashboard or CLI.

After deploying, confirm and report back:
1. The /s/[id] dynamic OG route works when a real generated share link is
   pasted into a link-preview debugging tool (e.g. a card validator)
2. The full flow — upload, personalize (solo and squad), generate, download,
   share — works on the live URL, not just localhost
3. The site loads and performs correctly on a real mobile device over a real
   network connection, including the ticker/hero/how-it-works landing sections
```


## 6A. GitHub commit strategy — commit as much as possible

**IMPORTANT: This project should be developed with a very granular Git commit history. The repository is connected to GitHub, so push commits throughout the entire build instead of completing the project first and making a single large commit.**

The goal is to create the **maximum practical number of meaningful commits** while keeping the history clean and understandable. Do **not** squash the work into a few large commits.

### Mandatory commit rules for the entire project

1. **Commit after every meaningful implementation unit.** A meaningful unit can be one component, one utility, one feature, one styling pass, one bug fix, one test group, one asset, one configuration change, or one deployment/configuration improvement.
2. **Prefer small commits over large commits.** If a prompt creates 4–6 independent pieces, make separate commits for those pieces rather than one commit containing everything.
3. **Push to GitHub frequently.** After each commit (or a very small batch of commits when a dependency requires it), push the current branch to the connected GitHub repository.
4. **Do not create fake/empty commits just to inflate the count.** Every commit must contain a real, reviewable change.
5. **Do not wait until the end of a prompt to commit everything if the work can be safely split.** For example:
   - component created → commit
   - component styling completed → commit
   - component wired into page → commit
   - responsive fix → commit
   - bug fix → commit
   - test/verification improvement → commit
6. **Use focused commit messages.** Examples:
   - `feat: add ticker bar`
   - `style: polish hero typography`
   - `feat: add squad mode toggle`
   - `feat: support HEIC uploads`
   - `fix: handle invalid image uploads`
   - `feat: add builder class generator`
   - `feat: add solo canvas compositor`
   - `feat: add squad canvas compositor`
   - `perf: optimize frame assets`
   - `fix: correct mobile upload layout`
7. **Before every commit:** run the smallest relevant verification for the change and make sure the application is not knowingly left broken.
8. **Keep unrelated changes out of the same commit.** If two changes are independent, commit them separately.
9. **Never rewrite/squash the granular history later unless explicitly instructed.** The detailed commit history is an intentional deliverable of this project.
10. **At the end of every major prompt/phase:** verify `git status`, review the recent commits with `git log --oneline`, and push all completed commits to GitHub.
11. **If a phase contains multiple independent tasks, deliberately split them into multiple commits.** Aim for the highest reasonable commit granularity throughout the project.
12. **Track the GitHub push state.** Do not claim a change is backed up on GitHub until the push succeeds.

### Recommended commit cadence by phase

For each major prompt below, do not make only one commit if the work naturally contains multiple independent changes. A reasonable target is:

- **Prompt 1:** 4–8 meaningful commits
- **Prompt 2:** 8–15 meaningful commits
- **Prompt 3:** 8–15 meaningful commits
- **Prompt 4:** 5–10 meaningful commits
- **Prompt 5:** 12–20 meaningful commits
- **Prompt 6:** 2–4 meaningful commits
- **Prompt 7:** 8–15 meaningful commits
- **Prompt 8:** 8–15 meaningful commits
- **Prompt 9:** 3–8 meaningful commits

These are targets, not artificial requirements. If a phase genuinely contains more independent work, make more commits.

### Required workflow for opencode

At the start of the project:

```bash
git init
git branch -M main
git remote -v
git status
```

Then, throughout development:

```bash
git status
git add <only-files-for-this-change>
git commit -m "type: concise description"
git push origin main
```

For every commit, use a focused `git add` rather than automatically staging the entire repository when unrelated work exists.

After each major phase:

```bash
git status
git log --oneline --decorate -n 20
git push origin main


GIT REQUIREMENT: Work incrementally and make the maximum practical number of meaningful Git commits for this prompt. Do not batch unrelated changes into one commit. Commit and push after each independently working component, feature, fix, styling pass, asset/config change, or other meaningful unit. Do not create empty/fake commits and do not squash the history later. At the end of this prompt, show the commits created and confirm that all completed commits were pushed to the connected GitHub repository.
```

**Do not use `git reset --soft`, interactive rebase, squash, or history rewriting to merge these commits later.** The desired outcome is a long, chronological, meaningful GitHub history showing the project being built step-by-step.

### Add this instruction to every opencode prompt

> **Git requirement:** Work incrementally and make the maximum practical number of meaningful Git commits for this task. Do not batch unrelated changes into one commit. After each independently working component, feature, fix, styling pass, test improvement, asset/config change, or other meaningful unit, create a focused commit and push it to the connected GitHub repository. Do not create empty/fake commits. Do not squash the history later. At the end, show the commits created and confirm the push succeeded.


---

## 7. After it's deployed — submission checklist

- [ ] Post the required X post yourself, with `#FrameInGoa`, the live link, and
      a real generated Builder ID (solo or squad) attached — the brief requires
      this as the actual submission, not just the tool existing
- [ ] The post itself briefly explains how to generate your own — satisfying
      the "quick how-to" line in the real task description
- [ ] Double-check your team hasn't already submitted once — **one submission
      per team, extra submissions get rejected outright**
- [ ] Submit the live link per the task's submission instructions before the
      close time shown in your dashboard
