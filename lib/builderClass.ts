const prefixes = [
  "Terminal",
  "Midnight",
  "Beach",
  "Fullstack",
  "Sunset",
  "Rogue",
  "Zero-Latency",
  "Feral",
  "Quantum",
  "Neon",
  "Turbo",
  "Pixel"
]

const suffixes = [
  "Architect",
  "Shaman",
  "Castaway",
  "Operator",
  "Wizard",
  "Renegade",
  "Engineer",
  "Alchemist",
  "Pioneer",
  "Vanguard",
  "Nomad",
  "Sentinel"
]

const tiers = [
  { name: "Common", weight: 50 },
  { name: "Rare", weight: 30 },
  { name: "Elite", weight: 15 },
  { name: "Legendary", weight: 5 }
]

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

function weightedRandom(random: number, totalWeight: number): number {
  let sum = 0
  for (let i = 0; i < tiers.length; i++) {
    sum += tiers[i].weight
    if (random < sum) {
      return i
    }
  }
  return 0
}

export function generateBuilderClass(seed: string): { title: string; tier: string } {
  const hash = simpleHash(seed)
  
  // Generate tier based on hash
  const tierIndex = weightedRandom(hash % 100, 100)
  const tier = tiers[tierIndex].name
  
  // Generate title by combining prefix and suffix
  const prefixIndex = hash % prefixes.length
  const suffixIndex = (hash >> 8) % suffixes.length
  
  const title = `${prefixes[prefixIndex]} ${suffixes[suffixIndex]}`
  
  return { title, tier }
}